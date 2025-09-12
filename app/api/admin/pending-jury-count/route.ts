import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { AuthService } from '@/lib/auth/auth-service';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication and admin access
    const authResult = await AuthService.verifyToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Check if user is admin or validator
    if (authResult.user.userType !== 'admin' && !authResult.user.isValidator) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Count pending jury users
    const pendingJuryCount = await db
      .select({ count: users.id })
      .from(users)
      .where(
        and(
          eq(users.validationStatus, 'pending'),
          eq(users.profileCompleted, true),
          eq(users.userType, 'jury')
        )
      );

    return NextResponse.json({
      count: pendingJuryCount.length
    });

  } catch (error) {
    console.error('Error fetching pending jury count:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du nombre de jurys en attente' },
      { status: 500 }
    );
  }
}
