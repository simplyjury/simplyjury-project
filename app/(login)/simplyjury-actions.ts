'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { AuthService } from '@/lib/auth/auth-service';
import { EmailService } from '@/lib/email/resend-service';
import { sendVerificationEmail } from '@/lib/auth/email-verification';
import { setRLSContext } from '@/lib/auth/rls-context';

export interface ActionState {
  error?: string;
  success?: string;
  email?: string;
  password?: string;
  name?: string;
  userType?: string;
}

// Schémas de validation
const signInSchema = z.object({
  email: z.string().email('Adresse email invalide').min(3).max(255),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères').max(100)
});

const signUpSchema = z.object({
  email: z.string().email('Adresse email invalide').min(3).max(255),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(100)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
  name: z.string().min(1, 'Le nom est obligatoire').max(100),
  userType: z.enum(['centre', 'jury'], {
    errorMap: () => ({ message: 'Veuillez sélectionner un type d\'utilisateur' })
  })
});

const passwordResetRequestSchema = z.object({
  email: z.string().email('Adresse email invalide')
});

const passwordResetSchema = z.object({
  token: z.string().min(1, 'Token manquant'),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(100)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre')
});

// Action de connexion
export async function signInAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string
    };

    const validatedData = signInSchema.parse(rawData);
    const { email, password } = validatedData;

    // Authentification via AuthService
    const result = await AuthService.authenticateUser(email, password);

    if (!result.success || !result.user) {
      return {
        error: 'Email ou mot de passe incorrect',
        email,
        password
      };
    }

    // Vérification email obligatoire
    console.log('Sign-in check - emailVerified:', result.user.emailVerified);
    if (!result.user.emailVerified) {
      return {
        error: 'Veuillez vérifier votre adresse email avant de vous connecter',
        email,
        password
      };
    }

    // Génération du JWT et mise à jour du dernier login
    console.log('Generating JWT for user:', result.user.id);
    const token = await AuthService.generateJWT(
      result.user.id,
      result.user.email,
      result.user.user_type || 'centre'
    );
    console.log('JWT generated successfully');

    await AuthService.updateLastLogin(result.user.id);
    console.log('Last login updated');

    // Configuration du cookie de session
    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 jours
    });
    console.log('Session cookie set');

    // Configuration du contexte RLS
    await setRLSContext(result.user.id);
    console.log('RLS context set');

    // Redirection selon le type d'utilisateur et statut du profil
    const redirectPath = getRedirectPath(result.user);
    console.log('Redirecting to:', redirectPath);
    redirect(redirectPath);

  } catch (error) {
    console.error('Sign-in error:', error);
    if (error instanceof z.ZodError) {
      return {
        error: error.errors[0].message,
        email: formData.get('email') as string,
        password: formData.get('password') as string
      };
    }

    return {
      error: 'Une erreur est survenue lors de la connexion',
      email: formData.get('email') as string,
      password: formData.get('password') as string
    };
  }
}

// Action d'inscription
export async function signUpAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      name: formData.get('name') as string,
      userType: formData.get('userType') as string
    };

    const validatedData = signUpSchema.parse(rawData);
    const { email, password, name, userType } = validatedData;

    // Vérification si l'utilisateur existe déjà
    const existingUser = await AuthService.getUserByEmail(email);
    if (existingUser) {
      return {
        error: 'Cette adresse email est déjà utilisée',
        email,
        password,
        name,
        userType
      };
    }
    
    try {
      // Création de l'utilisateur via AuthService
      const result = await AuthService.createUser({
        email,
        password,
        name,
        userType: userType as 'centre' | 'jury'
      });

      if (!result.user) {
        return {
          error: 'Erreur lors de la création du compte',
          email,
          password,
          name,
          userType
        };
      }
    } catch (error: any) {
      return {
        error: 'Erreur lors de la création du compte',
        email,
        password,
        name,
        userType
      };
    }

    // Envoi de l'email de vérification
    try {
      await sendVerificationEmail(email, name);
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError);
      // On continue même si l'email échoue
    }

    return {
      success: 'Compte créé avec succès ! Veuillez vérifier votre email pour activer votre compte.',
      email,
      name,
      userType
    };

  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: error.errors[0].message,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        name: formData.get('name') as string,
        userType: formData.get('userType') as string
      };
    }

    return {
      error: 'Une erreur est survenue lors de l\'inscription',
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      name: formData.get('name') as string,
      userType: formData.get('userType') as string
    };
  }
}

// Action de demande de réinitialisation de mot de passe
export async function requestPasswordResetAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const rawData = {
      email: formData.get('email') as string
    };

    const validatedData = passwordResetRequestSchema.parse(rawData);
    const { email } = validatedData;

    console.log(`Server Action: Processing password reset for ${email}`);
    
    // Generate reset token and update database
    const token = await AuthService.sendPasswordResetEmail(email);

    if (!token) {
      console.log(`Server Action: No user found for email ${email}`);
      // For security reasons, we still return success even if user doesn't exist
      return {
        success: 'Un email de réinitialisation a été envoyé à votre adresse',
        email
      };
    }

    console.log(`Server Action: Reset token generated for ${email}`);

    // Get user details to send the email
    const user = await AuthService.getUserByEmail(email);
    
    if (user) {
      try {
        console.log(`Server Action: Sending reset email to ${email}`);
        await EmailService.sendPasswordResetEmail(email, user.name || 'Utilisateur', token);
        console.log(`Server Action: Reset email sent successfully to ${email}`);
      } catch (emailError) {
        console.error('Server Action: Failed to send reset email:', emailError);
        // Continue even if email fails - don't reveal this to user for security
      }
    }

    return {
      success: 'Un email de réinitialisation a été envoyé à votre adresse',
      email
    };

  } catch (error) {
    console.error('Server Action: Password reset error:', error);
    
    if (error instanceof z.ZodError) {
      return {
        error: error.errors[0].message,
        email: formData.get('email') as string
      };
    }

    return {
      error: 'Une erreur est survenue',
      email: formData.get('email') as string
    };
  }
}

// Action de réinitialisation de mot de passe
export async function resetPasswordAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const rawData = {
      token: formData.get('token') as string,
      password: formData.get('password') as string
    };

    const validatedData = passwordResetSchema.parse(rawData);
    const { token, password } = validatedData;

    const success = await AuthService.resetPassword(token, password);

    if (!success) {
      return {
        error: 'Token invalide ou expiré'
      };
    }

    return {
      success: 'Mot de passe réinitialisé avec succès'
    };

  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: error.errors[0].message
      };
    }

    return {
      error: 'Une erreur est survenue'
    };
  }
}

// Action de vérification d'email
export async function verifyEmailAction(token: string): Promise<boolean> {
  try {
    return await AuthService.verifyEmail(token);
  } catch (error) {
    console.error('Erreur vérification email:', error);
    return false;
  }
}

// Action de déconnexion
export async function signOutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  redirect('/sign-in');
}

// Fonction utilitaire pour déterminer la redirection
function getRedirectPath(user: any): string {
  // Admin users always go to admin dashboard (no profile completion needed)
  if (user.user_type === 'admin') {
    return '/dashboard/admin';
  }

  // Si le profil n'est pas complété, rediriger vers la page de profil
  if (!user.profile_completed) {
    return user.user_type === 'centre' ? '/dashboard/profile/centre' : '/dashboard/profile/jury';
  }

  // Si le profil est en attente de validation
  if (user.validation_status === 'pending') {
    return '/dashboard/validation-pending';
  }

  // Si le profil est rejeté
  if (user.validation_status === 'rejected') {
    return '/dashboard/validation-rejected';
  }

  // Sinon, rediriger vers le dashboard principal
  return '/dashboard';
}
