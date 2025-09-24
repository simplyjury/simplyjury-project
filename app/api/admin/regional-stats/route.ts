import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { trainingCenters, juryProfiles } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'centres'; // 'centres' or 'juries'

    let regionalStats;
    let totalCount;

    if (type === 'centres') {
      // Get total count of training centers (for percentage calculation)
      const totalResult = await db
        .select({
          total: sql<number>`count(*)`.as('total'),
        })
        .from(trainingCenters)
        .where(sql`${trainingCenters.region} IS NOT NULL AND ${trainingCenters.region} != ''`);
      
      totalCount = totalResult[0]?.total || 0;

      // Get regional statistics for training centers
      regionalStats = await db
        .select({
          region: trainingCenters.region,
          count: sql<number>`count(*)`.as('count'),
        })
        .from(trainingCenters)
        .where(sql`${trainingCenters.region} IS NOT NULL AND ${trainingCenters.region} != ''`)
        .groupBy(trainingCenters.region)
        .orderBy(sql`count(*) DESC`)
        .limit(5);
    } else {
      // Get total count of jury profiles (for percentage calculation)
      const totalResult = await db
        .select({
          total: sql<number>`count(*)`.as('total'),
        })
        .from(juryProfiles)
        .where(sql`${juryProfiles.region} IS NOT NULL AND ${juryProfiles.region} != ''`);
      
      totalCount = totalResult[0]?.total || 0;

      // Get regional statistics for jury profiles
      regionalStats = await db
        .select({
          region: juryProfiles.region,
          count: sql<number>`count(*)`.as('count'),
        })
        .from(juryProfiles)
        .where(sql`${juryProfiles.region} IS NOT NULL AND ${juryProfiles.region} != ''`)
        .groupBy(juryProfiles.region)
        .orderBy(sql`count(*) DESC`)
        .limit(5);
    }

    // Format the data with percentages
    const formattedStats = regionalStats.map((region, index) => ({
      rank: index + 1,
      region: region.region,
      count: region.count,
      percentage: totalCount > 0 ? ((region.count / totalCount) * 100).toFixed(1) : '0.0',
    }));

    return NextResponse.json({
      success: true,
      data: formattedStats,
      total: totalCount,
      type,
    });
  } catch (error) {
    console.error('Error fetching regional statistics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch regional statistics' },
      { status: 500 }
    );
  }
}
