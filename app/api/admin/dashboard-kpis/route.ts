import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { users, juryProfiles } from '@/lib/db/schema';
import { sql, eq, and } from 'drizzle-orm';

export async function GET() {
  try {
    // 1. Total Users (training centers + juries)
    const totalUsersResult = await db
      .select({
        total: sql<number>`count(*)`.as('total'),
      })
      .from(users)
      .where(sql`${users.userType} IN ('centre', 'jury')`);

    const totalUsers = totalUsersResult[0]?.total || 0;

    // 2. Pending Profiles (juries pending validation > 48h)
    const pendingProfilesResult = await db
      .select({
        count: sql<number>`count(*)`.as('count'),
      })
      .from(users)
      .innerJoin(juryProfiles, eq(users.id, juryProfiles.userId))
      .where(
        and(
          eq(users.userType, 'jury'),
          eq(users.validationStatus, 'pending'),
          sql`${users.createdAt} < NOW() - INTERVAL '48 hours'`
        )
      );

    const pendingProfiles = pendingProfilesResult[0]?.count || 0;

    // For the remaining KPIs, we'll use raw SQL since tables aren't in schema
    // 3. Total Connections/Relations (jury requests) - using raw SQL
    const totalConnectionsResult = await db.execute(
      sql`SELECT COUNT(*) as total FROM jury_requests`
    );
    const totalConnections = Number(totalConnectionsResult[0]?.total || 0);

    // 4. Average Jury Rating (only for juries that have ratings) - using raw SQL
    const averageRatingResult = await db.execute(
      sql`
        SELECT ROUND(AVG(sr.overall_rating), 1) as avg_rating
        FROM session_ratings sr
        INNER JOIN users u ON sr.rated_id = u.id
        WHERE u.user_type = 'jury'
          AND sr.status = 'active'
          AND sr.is_visible = true
          AND sr.overall_rating IS NOT NULL
      `
    );
    const averageJuryRating = Number(averageRatingResult[0]?.avg_rating || 0);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        pendingProfiles,
        totalConnections,
        averageJuryRating: averageJuryRating > 0 ? averageJuryRating : null, // null if no ratings
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard KPIs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard KPIs' },
      { status: 500 }
    );
  }
}
