import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AuthService } from '@/lib/auth/auth-service';
import { EmailService } from '@/lib/email/resend-service';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    const resetToken = await AuthService.sendPasswordResetEmail(email);

    // Si un token a été généré, envoyer l'email
    if (resetToken) {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (user) {
        try {
          await EmailService.sendPasswordResetEmail(email, user.name || 'Utilisateur', resetToken);
        } catch (emailError) {
          console.error('Password reset email failed:', emailError);
          // Continue même si l'email échoue
        }
      }
    }

    // Toujours retourner un succès pour des raisons de sécurité
    // (ne pas révéler si l'email existe ou non)
    return NextResponse.json({
      success: true,
      message: 'Si cette adresse email existe dans notre système, vous recevrez un lien de réinitialisation.',
    }, { status: 200 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Email invalide',
        errors: error.errors,
      }, { status: 400 });
    }

    console.error('Forgot password error:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur lors de l\'envoi de l\'email de réinitialisation',
    }, { status: 500 });
  }
}
