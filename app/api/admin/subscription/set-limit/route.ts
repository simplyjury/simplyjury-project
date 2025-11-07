// Epic 07 - Set Manual Contact Limit API (Admin Only)
// Allows admins to override contact limits for specific centers

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

    // Only admins can set manual limits
    if (user.userType !== 'admin') {
      return NextResponse.json(
        { error: 'Accès réservé aux administrateurs' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { trainingCenterId, newLimit, reason, expiresAt } = body;

    // Validate required fields
    if (!trainingCenterId || newLimit === undefined || !reason) {
      return NextResponse.json(
        { error: 'Centre, nouvelle limite et raison requis' },
        { status: 400 }
      );
    }

    // Validate new limit
    if (typeof newLimit !== 'number' || newLimit < 0) {
      return NextResponse.json(
        { error: 'La limite doit être un nombre positif' },
        { status: 400 }
      );
    }

    // Validate expiration date if provided
    let expirationDate: Date | undefined;
    if (expiresAt) {
      expirationDate = new Date(expiresAt);
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
    }

    // Set manual limit
    const result = await SubscriptionService.setManualLimitOverride({
      trainingCenterId,
      newLimit,
      reason,
      expiresAt: expirationDate,
      performedBy: user.id,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.code === 'CENTER_NOT_FOUND' ? 404 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Limite manuelle définie avec succès',
    });
  } catch (error) {
    console.error('Error in POST /api/admin/subscription/set-limit:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
