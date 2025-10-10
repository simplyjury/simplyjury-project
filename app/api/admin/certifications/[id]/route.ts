import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { franceCompetenceCertifications, users, trainingCenters } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { AuthService } from '@/lib/auth/auth-service';
import { sendCertificationDecisionEmail } from '@/lib/actions/send-certification-decision-email';

/**
 * PATCH /api/admin/certifications/[id]
 * Approve or reject a pending certification
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 15 requirement)
    const resolvedParams = await params;
    
    // Verify authentication and admin access
    const authResult = await AuthService.verifyToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Check if user is admin
    if (authResult.user.userType !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const certificationId = parseInt(resolvedParams.id);
    if (isNaN(certificationId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    const body = await request.json();
    const { approvalStatus, approvalComment } = body;

    // Validate approval status
    if (!['approved', 'rejected'].includes(approvalStatus)) {
      return NextResponse.json(
        { error: 'Statut d\'approbation invalide' },
        { status: 400 }
      );
    }

    // Validate rejection comment (mandatory, min 10 characters)
    if (approvalStatus === 'rejected') {
      if (!approvalComment || approvalComment.trim().length < 10) {
        return NextResponse.json(
          { error: 'Un commentaire d\'au moins 10 caractères est requis pour le rejet' },
          { status: 400 }
        );
      }
    }

    // First, get the certification details with training center info
    const certificationWithCenter = await db
      .select({
        certification: franceCompetenceCertifications,
        centerName: trainingCenters.name,
        centerEmail: trainingCenters.email,
        userEmail: users.email,
      })
      .from(franceCompetenceCertifications)
      .leftJoin(
        trainingCenters,
        eq(franceCompetenceCertifications.trainingCenterId, trainingCenters.id)
      )
      .leftJoin(users, eq(trainingCenters.userId, users.id))
      .where(eq(franceCompetenceCertifications.id, certificationId))
      .limit(1);

    if (!certificationWithCenter || certificationWithCenter.length === 0) {
      return NextResponse.json(
        { error: 'Certification non trouvée' },
        { status: 404 }
      );
    }

    const { certification, centerName, centerEmail, userEmail } = certificationWithCenter[0];

    // Update certification approval status
    const [updatedCertification] = await db
      .update(franceCompetenceCertifications)
      .set({
        approvalStatus,
        approvedAt: new Date(),
        approvedBy: authResult.user.userId,
        approvalComment: approvalComment || null,
      })
      .where(eq(franceCompetenceCertifications.id, certificationId))
      .returning();

    if (!updatedCertification) {
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour' },
        { status: 500 }
      );
    }

    // Send email notification to training center (async, non-blocking)
    const emailRecipient = centerEmail || userEmail;
    if (emailRecipient && centerName && certification.title && certification.code) {
      sendCertificationDecisionEmail({
        centerName,
        centerEmail: emailRecipient,
        certificationTitle: certification.title,
        certificationCode: certification.code,
        decision: approvalStatus as 'approved' | 'rejected',
        approvalComment: approvalComment || undefined,
      }).catch((error) => {
        console.error('Failed to send certification decision email:', error);
        // Don't block the response if email fails
      });
    }

    return NextResponse.json({
      success: true,
      message: approvalStatus === 'approved' 
        ? 'Certification approuvée avec succès'
        : 'Certification rejetée',
      certification: updatedCertification
    });

  } catch (error) {
    console.error('Error updating certification approval:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la certification' },
      { status: 500 }
    );
  }
}
