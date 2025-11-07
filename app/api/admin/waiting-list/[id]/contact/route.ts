// Epic 07 - Mark Waiting List Entry as Contacted API (Admin Only)
// Allows admins to mark a waiting list entry as contacted

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/role-protection';
import { WaitingListService } from '@/lib/services/waiting-list-service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated user
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Only admins can mark as contacted
    if (user.userType !== 'admin') {
      return NextResponse.json(
        { error: 'Accès réservé aux administrateurs' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const entryId = parseInt(id);

    if (isNaN(entryId)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { notes } = body;

    // Mark as contacted
    const result = await WaitingListService.markAsContacted(
      entryId,
      user.id,
      notes
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Entrée marquée comme contactée',
    });
  } catch (error) {
    console.error('Error in PATCH /api/admin/waiting-list/[id]/contact:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
