import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/session';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { count, and, gte, isNull, isNotNull, eq, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const sessionCookie = request.cookies.get('session');
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const session = await verifyToken(sessionCookie.value);
    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Verify user is admin
    const adminUser = await db
      .select({ userType: users.userType })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!adminUser[0] || adminUser[0].userType !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Calculate KPIs using real data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Total users (non-deleted)
    const totalUsers = await db
      .select({ count: count() })
      .from(users)
      .where(isNull(users.deletedAt));

    // Active users (logged in within last 30 days, non-deleted)
    const activeUsers = await db
      .select({ count: count() })
      .from(users)
      .where(
        and(
          isNull(users.deletedAt),
          gte(users.lastLogin, thirtyDaysAgo)
        )
      );

    // Pending users (validation status = pending, non-deleted)
    const pendingUsers = await db
      .select({ count: count() })
      .from(users)
      .where(
        and(
          isNull(users.deletedAt),
          eq(users.validationStatus, 'pending')
        )
      );

    // Suspended users (logically deleted)
    const suspendedUsers = await db
      .select({ count: count() })
      .from(users)
      .where(isNotNull(users.deletedAt));

    return NextResponse.json({
      totalUsers: totalUsers[0].count,
      activeUsers: activeUsers[0].count,
      pendingUsers: pendingUsers[0].count,
      suspendedUsers: suspendedUsers[0].count,
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user statistics' },
      { status: 500 }
    );
  }
}
