import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AuthService } from '@/lib/auth/auth-service';
import { verifyEmailToken } from '@/lib/auth/email-verification';

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token requis'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = verifyEmailSchema.parse(body);

    const isValid = await verifyEmailToken(token);

    if (!isValid) {
      return NextResponse.json({
        success: false,
        message: 'Token de vérification invalide ou expiré',
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Email vérifié avec succès',
    }, { status: 200 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Token invalide',
        errors: error.errors,
      }, { status: 400 });
    }

    console.error('Email verification error:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur lors de la vérification de l\'email',
    }, { status: 500 });
  }
}

// GET pour vérification via URL (optionnel)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Token manquant',
      }, { status: 400 });
    }

    const isValid = await verifyEmailToken(token);

    if (!isValid) {
      return NextResponse.json({
        success: false,
        message: 'Token de vérification invalide ou expiré',
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Email vérifié avec succès',
    }, { status: 200 });

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur lors de la vérification de l\'email',
    }, { status: 500 });
  }
}
