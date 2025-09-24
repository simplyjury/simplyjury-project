import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { sql, eq } from 'drizzle-orm';

export async function GET() {
  try {
    // Get user type distribution statistics
    const userTypeStatsResult = await db
      .select({
        userType: users.userType,
        count: sql<number>`count(*)`.as('count'),
      })
      .from(users)
      .where(sql`${users.userType} IN ('centre', 'jury')`)
      .groupBy(users.userType);

    // Process the results
    let centreCount = 0;
    let juryCount = 0;

    userTypeStatsResult.forEach(row => {
      if (row.userType === 'centre') {
        centreCount = Number(row.count);
      } else if (row.userType === 'jury') {
        juryCount = Number(row.count);
      }
    });

    const totalUsers = centreCount + juryCount;
    const centrePercentage = totalUsers > 0 ? Math.round((centreCount / totalUsers) * 100 * 10) / 10 : 0;
    const juryPercentage = totalUsers > 0 ? Math.round((juryCount / totalUsers) * 100 * 10) / 10 : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        centreCount,
        juryCount,
        centrePercentage,
        juryPercentage,
      },
    });
  } catch (error) {
    console.error('Error fetching user type distribution:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user type distribution' },
      { status: 500 }
    );
  }
}
