import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AuthService } from '@/lib/auth/auth-service';
import { EmailService } from '@/lib/email/resend-service';

const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
  name: z.string().optional(),
  userType: z.enum(['centre', 'jury'], { required_error: 'Type d\'utilisateur requis' }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    const { user, verificationToken } = await AuthService.createUser(validatedData);

    // Envoyer email de bienvenue et vérification
    try {
      await Promise.all([
        EmailService.sendWelcomeEmail(user.email, user.name || 'Utilisateur', validatedData.userType),
        EmailService.sendVerificationEmail(user.email, user.name || 'Utilisateur', verificationToken)
      ]);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue même si l'email échoue - l'utilisateur peut toujours utiliser le token
    }

    return NextResponse.json({
      success: true,
      message: 'Compte créé avec succès. Veuillez vérifier votre email.',
      userId: user.id,
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Données invalides',
        errors: error.errors,
      }, { status: 400 });
    }

    // Gestion des erreurs de contrainte unique (email déjà existant)
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return NextResponse.json({
        success: false,
        message: 'Cette adresse email est déjà utilisée',
      }, { status: 409 });
    }

    console.error('Registration error:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur lors de la création du compte',
    }, { status: 500 });
  }
}
