// Epic 07 - Grant Premium Access API (Admin Only)
// Allows admins to grant temporary Pro-level access to training centers

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/role-protection';
import { SubscriptionService } from '@/lib/services/subscription-service';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Only admins can grant premium access
    if (user.userType !== 'admin') {
      return NextResponse.json(
        { error: 'Accès réservé aux administrateurs' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { trainingCenterId, expiresAt, reason } = body;

    // Validate required fields
    if (!trainingCenterId || !expiresAt || !reason) {
      return NextResponse.json(
        { error: 'Centre, date d\'expiration et raison requis' },
        { status: 400 }
      );
    }

    // Validate expiration date
    const expirationDate = new Date(expiresAt);
    if (isNaN(expirationDate.getTime())) {
      return NextResponse.json(
        { error: 'Date d\'expiration invalide' },
        { status: 400 }
      );
    }

    // Expiration must be in the future
    if (expirationDate <= new Date()) {
      return NextResponse.json(
        { error: 'La date d\'expiration doit être dans le futur' },
        { status: 400 }
      );
    }

    // Grant premium access
    const result = await SubscriptionService.grantPremiumAccess({
      trainingCenterId,
      expiresAt: expirationDate,
      reason,
      grantedBy: user.id,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.code === 'CENTER_NOT_FOUND' ? 404 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Accès premium accordé avec succès',
    });
  } catch (error) {
    console.error('Error in POST /api/admin/subscription/grant-premium:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
