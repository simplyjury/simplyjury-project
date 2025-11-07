// Epic 07 - Refund Contact API (Admin Only)
// Allows admins to refund a contact for system errors or disputes

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/role-protection';
import { ContactLimitService } from '@/lib/services/contact-limit-service';

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

    // Only admins can refund contacts
    if (user.userType !== 'admin') {
      return NextResponse.json(
        { error: 'Accès réservé aux administrateurs' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { trainingCenterId, juryRequestId, reason } = body;

    // Validate required fields
    if (!trainingCenterId || !juryRequestId || !reason) {
      return NextResponse.json(
        { error: 'Centre, demande de jury et raison requis' },
        { status: 400 }
      );
    }

    // Refund the contact
    const result = await ContactLimitService.refundContact({
      trainingCenterId,
      juryRequestId,
      reason,
      performedBy: user.id,
    });

    if (!result.success) {
      const statusCode = 
        result.code === 'CENTER_NOT_FOUND' ? 404 :
        result.code === 'NO_CONTACTS_TO_REFUND' ? 400 :
        500;

      return NextResponse.json(
        { error: result.error },
        { status: statusCode }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Contact remboursé avec succès',
    });
  } catch (error) {
    console.error('Error in POST /api/admin/subscription/refund-contact:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
