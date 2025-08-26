import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AuthService } from '@/lib/auth/auth-service';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requis'),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = resetPasswordSchema.parse(body);

    const isReset = await AuthService.resetPassword(token, password);

    if (!isReset) {
      return NextResponse.json({
        success: false,
        message: 'Token de réinitialisation invalide ou expiré',
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès',
    }, { status: 200 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Données invalides',
        errors: error.errors,
      }, { status: 400 });
    }

    console.error('Reset password error:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur lors de la réinitialisation du mot de passe',
    }, { status: 500 });
  }
}
