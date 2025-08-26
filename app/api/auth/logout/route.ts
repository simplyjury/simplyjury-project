import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Supprimer le cookie d'authentification
    cookieStore.delete('auth-token');

    return NextResponse.json({
      success: true,
      message: 'Déconnexion réussie',
    }, { status: 200 });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({
      success: false,
      message: 'Erreur lors de la déconnexion',
    }, { status: 500 });
  }
}
