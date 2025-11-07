// Epic 07 - Admin Waiting List Management API
// Get and manage waiting list entries

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/role-protection';
import { WaitingListService } from '@/lib/services/waiting-list-service';
import type { WaitingListStatus } from '@/lib/types/subscription';

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

    // Only admins can view waiting list
    if (user.userType !== 'admin') {
      return NextResponse.json(
        { error: 'Accès réservé aux administrateurs' },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as WaitingListStatus | null;
    const desiredTier = searchParams.get('tier') as 'basic' | 'pro' | null;
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    // Build filters
    const filters: any = {};
    if (status) filters.status = status;
    if (desiredTier) filters.desiredTier = desiredTier;
    if (limit) filters.limit = parseInt(limit);
    if (offset) filters.offset = parseInt(offset);

    // Get waiting list
    const result = await WaitingListService.getWaitingList(filters);

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
    console.error('Error in GET /api/admin/waiting-list:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
