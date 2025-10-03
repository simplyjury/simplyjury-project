import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notifyValidatorsOfNewJury } from '@/lib/actions/jury-validation-actions';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.userId;

    // Check current user status
    const user = await db
      .select({ validationStatus: users.validationStatus })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Only allow re-submission for rejected users
    if (user[0].validationStatus !== 'rejected') {
      return NextResponse.json({ 
        error: 'La re-soumission n\'est autorisée que pour les profils rejetés' 
      }, { status: 400 });
    }

    // Reset validation status to pending and clear rejection comment
    await db
      .update(users)
      .set({ 
        validationStatus: 'pending',
        validationComment: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    // Send notification emails to validators
    try {
      console.log('Sending validator notifications for re-submitted jury profile...');
      const notificationResult = await notifyValidatorsOfNewJury(userId);
      
      if (notificationResult.success) {
        console.log('Validator notifications sent successfully:', notificationResult.message);
      } else {
        console.error('Failed to send validator notifications:', notificationResult.error);
        // Don't fail the re-submission if email notifications fail
      }
    } catch (emailError) {
      console.error('Error sending validator notifications:', emailError);
      // Continue with successful response even if email fails
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Profil soumis à nouveau pour validation avec succès'
    });

  } catch (error) {
    console.error('Error resubmitting jury profile:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la re-soumission du profil' },
      { status: 500 }
    );
  }
}
