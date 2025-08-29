import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { franceCompetenceCertifications, certificationStats, trainingCenters, users } from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { AuthService } from '@/lib/auth/auth-service';

async function getCurrentUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    const payload = await AuthService.verifyJWT(token);
    const userId = payload.userId;

    if (!userId) {
      return null;
    }

    // Check if user's training center is a certificateur
    const trainingCenter = await db.query.trainingCenters.findFirst({
      where: eq(trainingCenters.userId, userId),
      columns: {
        id: true,
        isCertificateur: true
      }
    });

    if (!trainingCenter?.isCertificateur) {
      return null;
    }

    return await AuthService.getUserWithProfile(payload.userId);
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's training center
    const userTrainingCenter = await db
      .select({
        id: trainingCenters.id,
        is_certificateur: trainingCenters.isCertificateur,
      })
      .from(trainingCenters)
      .where(eq(trainingCenters.userId, user.id))
      .limit(1);

    if (!userTrainingCenter.length || !userTrainingCenter[0].is_certificateur) {
      return NextResponse.json({ error: 'Access denied - not a certification body' }, { status: 403 });
    }

    const trainingCenterId = userTrainingCenter[0].id;

    // Get certifications for this training center
    const certifications = await db
      .select({
        id: franceCompetenceCertifications.id,
        title: franceCompetenceCertifications.title,
        code: franceCompetenceCertifications.code,
        level: franceCompetenceCertifications.level,
        domain: franceCompetenceCertifications.domain,
        status: franceCompetenceCertifications.status,
        validity_start: franceCompetenceCertifications.validityStart,
        validity_end: franceCompetenceCertifications.validityEnd,
        created_at: franceCompetenceCertifications.createdAt,
      })
      .from(franceCompetenceCertifications)
      .where(eq(franceCompetenceCertifications.trainingCenterId, trainingCenterId))
      .orderBy(desc(franceCompetenceCertifications.createdAt));

    // Get statistics for each certification
    const currentYear = new Date().getFullYear();
    const stats = await db
      .select({
        france_competence_certification_id: certificationStats.franceCompetenceCertificationId,
        candidates_count: certificationStats.candidatesCount,
        successful_candidates: certificationStats.successfulCandidates,
        total_sessions: certificationStats.totalSessions,
        last_session_date: certificationStats.lastSessionDate,
      })
      .from(certificationStats)
      .where(eq(certificationStats.year, currentYear));

    // Combine certifications with their stats
    const certificationsWithStats = certifications.map(cert => {
      const certStats = stats.find(s => s.france_competence_certification_id === cert.id);
      
      // Calculate status based on validity_end
      const now = new Date();
      const validityEnd = cert.validity_end ? new Date(cert.validity_end) : null;
      let calculatedStatus = 'active';
      
      if (validityEnd && validityEnd < now) {
        calculatedStatus = 'expired';
      } else if (cert.status === 'inactive') {
        calculatedStatus = 'inactive';
      }

      return {
        ...cert,
        status: calculatedStatus,
        candidates_count: certStats?.candidates_count || 0,
        success_rate: certStats?.candidates_count && certStats?.successful_candidates
          ? Math.round((certStats.successful_candidates / certStats.candidates_count) * 100)
          : 0,
        total_sessions: certStats?.total_sessions || 0,
        last_session_date: certStats?.last_session_date,
        // Mock competency blocks and tags for now - these would come from France Compétences API
        competency_blocks: [],
        tags: cert.domain ? [cert.domain] : [],
      };
    });

    return NextResponse.json({
      certifications: certificationsWithStats,
      training_center_id: trainingCenterId,
    });

  } catch (error) {
    console.error('Error fetching certifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's training center
    const userTrainingCenter = await db
      .select({
        id: trainingCenters.id,
        is_certificateur: trainingCenters.isCertificateur,
      })
      .from(trainingCenters)
      .where(eq(trainingCenters.userId, user.id))
      .limit(1);

    if (!userTrainingCenter.length || !userTrainingCenter[0].is_certificateur) {
      return NextResponse.json({ error: 'Access denied - not a certification body' }, { status: 403 });
    }

    const body = await request.json();
    const { code_rncp, intitule, niveau_qualification, date_fin_enregistrement, domaines_activite } = body;

    // Check if certification already exists for this training center
    const existingCert = await db
      .select()
      .from(franceCompetenceCertifications)
      .where(
        and(
          eq(franceCompetenceCertifications.trainingCenterId, userTrainingCenter[0].id),
          eq(franceCompetenceCertifications.code, code_rncp)
        )
      )
      .limit(1);

    if (existingCert.length > 0) {
      return NextResponse.json({ error: 'Certification already linked to this training center' }, { status: 400 });
    }

    // Add new certification
    const newCertification = await db
      .insert(franceCompetenceCertifications)
      .values({
        trainingCenterId: userTrainingCenter[0].id,
        fcCertificationId: code_rncp, // Use RNCP code as FC ID for now
        title: intitule,
        code: code_rncp,
        level: niveau_qualification.toString(),
        domain: domaines_activite?.[0] || 'Non spécifié',
        status: 'active',
        validityEnd: new Date(date_fin_enregistrement),
      })
      .returning();

    return NextResponse.json({ 
      message: 'Certification linked successfully',
      certification: newCertification[0]
    });

  } catch (error) {
    console.error('Error adding certification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
