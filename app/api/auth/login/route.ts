import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AuthService } from '@/lib/auth/auth-service';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // Récupérer l'utilisateur par email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Email ou mot de passe incorrect',
      }, { status: 401 });
    }

    // Vérifier le mot de passe
    const isValidPassword = await AuthService.comparePassword(password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json({
        success: false,
        message: 'Email ou mot de passe incorrect',
      }, { status: 401 });
    }

    // Vérifier si l'email est vérifié
    if (!user.emailVerified) {
      return NextResponse.json({
        success: false,
        message: 'Veuillez vérifier votre adresse email avant de vous connecter',
        requiresEmailVerification: true,
      }, { status: 403 });
    }

    // Générer le JWT
    const token = await AuthService.generateJWT(user.id, user.email, user.userType || 'centre');

    // Mettre à jour la dernière connexion
    await AuthService.updateLastLogin(user.id);

    // Définir le cookie sécurisé
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 jours
      path: '/',
    });

    return NextResponse.json({
      success: true,
      message: 'Connexion réussie',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        profileCompleted: user.profileCompleted,
        validationStatus: user.validationStatus,
      },
    }, { status: 200 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Données invalides',
        errors: error.errors,
      }, { status: 400 });
    }

    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur lors de la connexion',
    }, { status: 500 });
  }
}
