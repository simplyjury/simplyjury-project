import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db/drizzle';
import { franceCompetenceCertifications, trainingCenters } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { AuthService } from '@/lib/auth/auth-service';

async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    if (!sessionCookie?.value) {
      return null;
    }

    const payload = await AuthService.verifyJWT(sessionCookie.value);
    const userId = payload.userId;

    if (!userId) {
      return null;
    }

    return await AuthService.getUserWithProfile(payload.userId);
  } catch (error) {
    return null;
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const certificationId = parseInt(id);
    if (isNaN(certificationId)) {
      return NextResponse.json({ error: 'Invalid certification ID' }, { status: 400 });
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

    // Check if the certification belongs to this training center
    const certification = await db
      .select({
        id: franceCompetenceCertifications.id,
        training_center_id: franceCompetenceCertifications.trainingCenterId,
      })
      .from(franceCompetenceCertifications)
      .where(eq(franceCompetenceCertifications.id, certificationId))
      .limit(1);

    if (!certification.length) {
      return NextResponse.json({ error: 'Certification not found' }, { status: 404 });
    }

    if (certification[0].training_center_id !== trainingCenterId) {
      return NextResponse.json({ error: 'Access denied - certification does not belong to your center' }, { status: 403 });
    }

    // Delete the certification (CASCADE will handle related stats)
    await db
      .delete(franceCompetenceCertifications)
      .where(
        and(
          eq(franceCompetenceCertifications.id, certificationId),
          eq(franceCompetenceCertifications.trainingCenterId, trainingCenterId)
        )
      );

    return NextResponse.json({ 
      success: true,
      message: 'Certification supprimée avec succès'
    });

  } catch (error) {
    console.error('Error deleting certification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
