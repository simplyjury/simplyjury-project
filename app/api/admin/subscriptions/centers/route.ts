// Epic 07 - Admin API: Get all training centers with subscription details
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { trainingCenters, users } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth/role-protection';

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const user = await getCurrentUser();
    if (!user || user.userType !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Fetch all training centers with subscription details
    // Use get_effective_contact_limit to calculate the correct limit based on priority:
    // 1. Manual override (highest priority)
    // 2. Premium access (15 contacts)
    // 3. Subscription tier limit (default)
    const centers = await db
      .select({
        id: trainingCenters.id,
        name: trainingCenters.name,
        email: users.email,
        subscriptionTier: trainingCenters.subscriptionTier,
        contactsUsed: trainingCenters.contactsUsedCurrentPeriod,
        contactsLimit: sql<number>`get_effective_contact_limit(${trainingCenters.id})`,
        firstAcceptedContactDate: trainingCenters.firstAcceptedContactDate,
        hasPremiumAccess: sql<boolean>`
          CASE 
            WHEN ${trainingCenters.premiumAccessGrantedUntil} IS NOT NULL 
            AND ${trainingCenters.premiumAccessGrantedUntil} > NOW() 
            THEN true 
            ELSE false 
          END
        `,
        premiumAccessExpiresAt: trainingCenters.premiumAccessGrantedUntil,
        manualContactLimit: trainingCenters.manualContactLimitOverride,
        manualLimitExpiresAt: trainingCenters.manualLimitOverrideExpires,
      })
      .from(trainingCenters)
      .leftJoin(users, eq(trainingCenters.userId, users.id))
      .orderBy(trainingCenters.name);

    return NextResponse.json({
      success: true,
      data: centers,
    });
  } catch (error) {
    console.error('Error fetching centers:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
