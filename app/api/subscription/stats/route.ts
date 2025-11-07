// Epic 07 - Get Contact Usage Statistics API
// Returns detailed usage statistics for a training center

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/role-protection';
import { db } from '@/lib/db/drizzle';
import { trainingCenters } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ContactLimitService } from '@/lib/services/contact-limit-service';

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

    // Only training centers can check stats
    if (user.userType !== 'centre') {
      return NextResponse.json(
        { error: 'Accès réservé aux centres de formation' },
        { status: 403 }
      );
    }

    // Get training center for this user
    const center = await db.query.trainingCenters.findFirst({
      where: eq(trainingCenters.userId, user.id),
    });

    if (!center) {
      return NextResponse.json(
        { error: 'Centre de formation non trouvé' },
        { status: 404 }
      );
    }

    // Get contact statistics
    const result = await ContactLimitService.getContactStats(center.id);

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
    console.error('Error in GET /api/subscription/stats:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
