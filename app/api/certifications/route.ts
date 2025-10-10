import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { franceCompetenceCertifications, certificationStats, trainingCenters, users } from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';

async function getCurrentUser() {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return null;
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId)
    });

    return user;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
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
        certification_details: franceCompetenceCertifications.certificationDetails,
        // Approval workflow fields
        approval_status: franceCompetenceCertifications.approvalStatus,
        siret_mismatch: franceCompetenceCertifications.siretMismatch,
        certificateur_siret: franceCompetenceCertifications.certificateurSiret,
        certificateur_name: franceCompetenceCertifications.certificateurName,
        center_siret: franceCompetenceCertifications.centerSiret,
        approval_requested_at: franceCompetenceCertifications.approvalRequestedAt,
        approval_comment: franceCompetenceCertifications.approvalComment,
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

      // Extract competency blocks from certification_details JSONB
      const competencyBlocks: string[] = [];
      if (cert.certification_details && typeof cert.certification_details === 'object') {
        const details = cert.certification_details as any;
        if (details.blocs_competences?.rncp && Array.isArray(details.blocs_competences.rncp)) {
          details.blocs_competences.rncp.forEach((bloc: any) => {
            if (bloc.intitule) {
              competencyBlocks.push(bloc.intitule);
            }
          });
        }
      }

      // Extract tags from domains
      const tags: string[] = [];
      if (cert.domain) {
        tags.push(cert.domain);
      }
      if (cert.certification_details && typeof cert.certification_details === 'object') {
        const details = cert.certification_details as any;
        if (details.domaines?.rome?.rncp && Array.isArray(details.domaines.rome.rncp)) {
          details.domaines.rome.rncp.slice(0, 3).forEach((rome: any) => {
            if (rome.intitule && !tags.includes(rome.intitule)) {
              tags.push(rome.intitule);
            }
          });
        }
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
        competency_blocks: competencyBlocks,
        tags: tags.slice(0, 5), // Limit to 5 tags
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
    const user = await getCurrentUser();
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
