import { NextRequest, NextResponse } from 'next/server';
import { NewsletterService } from '@/lib/services/newsletter-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token manquant.' },
        { status: 400 }
      );
    }

    const result = await NewsletterService.confirm(token);

    return NextResponse.json({
      success: result.success,
      message: result.message,
    });
  } catch (error) {
    console.error('Newsletter confirmation error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la confirmation.' },
      { status: 500 }
    );
  }
}
