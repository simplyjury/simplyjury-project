import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { AuthService } from '@/lib/auth/auth-service';
import { setRLSContext } from '@/lib/auth/rls-context';

const signInSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(1, 'Mot de passe requis')
});

function getRedirectPath(user: any): string {
  // Check if user needs to complete profile first
  if (!user.profileCompleted) {
    if (user.userType === 'centre') {
      return '/profile/center';
    } else if (user.userType === 'jury') {
      return '/profile/jury';
    }
  }
  
  // Both user types redirect to /dashboard with adaptive UI based on userType
  return '/dashboard';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = signInSchema.parse(body);
    const { email, password } = validatedData;

    // Authentification via AuthService
    const result = await AuthService.authenticateUser(email, password);

    if (!result.success || !result.user) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Vérification email obligatoire
    if (!result.user.emailVerified) {
      return NextResponse.json(
        { error: 'Veuillez vérifier votre adresse email avant de vous connecter' },
        { status: 401 }
      );
    }

    // Génération du JWT et mise à jour du dernier login
    const token = await AuthService.generateJWT(
      result.user.id,
      result.user.email,
      result.user.userType || 'centre'
    );

    await AuthService.updateLastLogin(result.user.id);

    // Configuration du contexte RLS
    await setRLSContext(result.user.id);

    // Déterminer le chemin de redirection
    const redirectPath = getRedirectPath(result.user);

    // Configuration du cookie de session avec NextResponse
    const response = NextResponse.json({ 
      success: true, 
      redirectPath,
      user: {
        id: result.user.id,
        email: result.user.email,
        userType: result.user.userType,
        profileCompleted: result.user.profileCompleted,
        validationStatus: result.user.validationStatus
      }
    });

    // Définir le cookie de session
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 jours
    });

    return response;

  } catch (error) {
    console.error('Sign-in API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la connexion' },
      { status: 500 }
    );
  }
}
