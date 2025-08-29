import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { franceCompetenceCertifications, certificationStats, trainingCenters } from '@/lib/db/schema';
import { eq, and, sql, sum, avg, count } from 'drizzle-orm';
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
    const currentYear = new Date().getFullYear();

    // Get total and active certifications count
    const certificationCounts = await db
      .select({
        total_count: count(),
        active_count: sum(
          sql`CASE WHEN ${franceCompetenceCertifications.validityEnd} > NOW() AND ${franceCompetenceCertifications.status} = 'active' THEN 1 ELSE 0 END`
        ),
      })
      .from(franceCompetenceCertifications)
      .where(eq(franceCompetenceCertifications.trainingCenterId, trainingCenterId));

    // Get current year statistics
    const yearStats = await db
      .select({
        total_candidates: sum(certificationStats.candidatesCount),
        total_successful: sum(certificationStats.successfulCandidates),
      })
      .from(certificationStats)
      .innerJoin(
        franceCompetenceCertifications,
        eq(certificationStats.franceCompetenceCertificationId, franceCompetenceCertifications.id)
      )
      .where(
        and(
          eq(franceCompetenceCertifications.trainingCenterId, trainingCenterId),
          eq(certificationStats.year, currentYear)
        )
      );

    const totalCandidates = Number(yearStats[0]?.total_candidates) || 0;
    const totalSuccessful = Number(yearStats[0]?.total_successful) || 0;
    const averageSuccessRate = totalCandidates > 0 ? Math.round((totalSuccessful / totalCandidates) * 100) : 0;

    const stats = {
      active_count: Number(certificationCounts[0]?.active_count) || 0,
      total_count: Number(certificationCounts[0]?.total_count) || 0,
      total_candidates: totalCandidates,
      average_success_rate: averageSuccessRate,
    };

    return NextResponse.json({ stats });

  } catch (error) {
    console.error('Error fetching certification stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
