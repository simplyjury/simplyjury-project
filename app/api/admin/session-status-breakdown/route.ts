import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Get session status breakdown statistics
    const sessionStatusResult = await db.execute(
      sql`
        SELECT 
          status,
          COUNT(*) as count
        FROM jury_requests
        GROUP BY status
        ORDER BY 
          CASE status
            WHEN 'pending' THEN 1
            WHEN 'accepted' THEN 2
            WHEN 'in_progress' THEN 3
            WHEN 'completed' THEN 4
            WHEN 'cancelled' THEN 5
            ELSE 6
          END
      `
    );

    // Initialize all statuses with 0 count
    const statusData = {
      pending: 0,
      accepted: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
    };

    // Populate with actual data
    sessionStatusResult.forEach((row: any) => {
      const status = row.status;
      const count = Number(row.count);
      if (status in statusData) {
        statusData[status as keyof typeof statusData] = count;
      }
    });

    // Calculate total and percentages
    const totalSessions = Object.values(statusData).reduce((sum, count) => sum + count, 0);
    
    const statusBreakdown = Object.entries(statusData).map(([status, count]) => ({
      status,
      count,
      percentage: totalSessions > 0 ? Math.round((count / totalSessions) * 100 * 10) / 10 : 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalSessions,
        statusBreakdown,
      },
    });
  } catch (error) {
    console.error('Error fetching session status breakdown:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch session status breakdown' },
      { status: 500 }
    );
  }
}
