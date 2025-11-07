// Epic 07 - Waiting List Statistics API (Admin Only)
// Returns comprehensive statistics about the waiting list

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/role-protection';
import { WaitingListService } from '@/lib/services/waiting-list-service';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Only admins can view stats
    if (user.userType !== 'admin') {
      return NextResponse.json(
        { error: 'Accès réservé aux administrateurs' },
        { status: 403 }
      );
    }

    // Get waiting list statistics
    const result = await WaitingListService.getWaitingListStats();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error('Error in GET /api/admin/waiting-list/stats:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
