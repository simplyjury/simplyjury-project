import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { AuthService } from '@/lib/auth/auth-service';
import { EmailService } from '@/lib/email/resend-service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Verify authentication and admin access
    const authResult = await AuthService.verifyToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Check if user is admin or validator
    if (authResult.user.userType !== 'admin' && !authResult.user.isValidator) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const userId = parseInt(params.userId);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'ID utilisateur invalide' }, { status: 400 });
    }

    const body = await request.json();
    const { validationStatus, validationComment } = body;

    // Validate the validation status
    if (!validationStatus || !['validated', 'rejected'].includes(validationStatus)) {
      return NextResponse.json(
        { error: 'Statut de validation invalide. Doit être "validated" ou "rejected"' },
        { status: 400 }
      );
    }

    // Check if user exists and is a jury with pending status
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!existingUser) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    if (existingUser.userType !== 'jury') {
      return NextResponse.json({ error: 'Seuls les profils jury peuvent être validés' }, { status: 400 });
    }

    if (existingUser.validationStatus !== 'pending') {
      return NextResponse.json(
        { error: 'Ce profil n\'est pas en attente de validation' },
        { status: 400 }
      );
    }

    // Update the user's validation status
    const [updatedUser] = await db
      .update(users)
      .set({
        validationStatus,
        validationComment: validationComment || null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du statut de validation' },
        { status: 500 }
      );
    }

    // Send validation email to the jury
    try {
      const juryName = updatedUser.name || `${updatedUser.email}`;
      await EmailService.sendJuryProfileValidationEmail(
        updatedUser.email,
        juryName,
        validationStatus,
        validationComment
      );
      console.log(`Validation email sent to ${updatedUser.email} for status: ${validationStatus}`);
    } catch (emailError) {
      console.error('Error sending validation email:', emailError);
      // Don't fail the entire request if email fails, but log the error
    }

    return NextResponse.json({
      success: true,
      message: `Profil ${validationStatus === 'validated' ? 'validé' : 'refusé'} avec succès`,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        validationStatus: updatedUser.validationStatus,
        validationComment: updatedUser.validationComment,
      }
    });

  } catch (error) {
    console.error('Error updating validation status:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du statut de validation' },
      { status: 500 }
    );
  }
}
