import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Get session completion statistics
    const sessionStatsResult = await db.execute(
      sql`
        SELECT 
          COUNT(*) as total_sessions,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_sessions,
          COUNT(CASE WHEN status != 'completed' THEN 1 END) as incomplete_sessions,
          ROUND(
            COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / COUNT(*), 
            1
          ) as completion_percentage
        FROM jury_requests
        WHERE created_at < NOW() -- Only past sessions
      `
    );

    const stats = sessionStatsResult[0];
    const totalSessions = Number(stats?.total_sessions || 0);
    const completedSessions = Number(stats?.completed_sessions || 0);
    const incompleteSessions = Number(stats?.incomplete_sessions || 0);
    const completionPercentage = Number(stats?.completion_percentage || 0);

    return NextResponse.json({
      success: true,
      data: {
        totalSessions,
        completedSessions,
        incompleteSessions,
        completionPercentage,
      },
    });
  } catch (error) {
    console.error('Error fetching session completion stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch session completion stats' },
      { status: 500 }
    );
  }
}
