import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { sql } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 10; // 10 results per page
    const maxResults = 50; // Maximum 50 results total (5 pages max)
    const offset = (page - 1) * limit;

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status parameter is required' },
        { status: 400 }
      );
    }

    if (page < 1 || page > 5) {
      return NextResponse.json(
        { success: false, error: 'Page must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Get session details for the specified status (optimized for performance)
    const sessionDetailsResult = await db.execute(
      sql`
        SELECT 
          jr.id,
          jr.status,
          jr.session_date,
          jr.modality as session_modality,
          jr.created_at,
          jr.certification_title,
          jr.session_location,
          -- Calculate days until session
          CASE 
            WHEN jr.session_date IS NULL THEN NULL
            WHEN jr.session_date < CURRENT_DATE THEN -1
            ELSE (jr.session_date - CURRENT_DATE)::INTEGER
          END as days_until_session,
          -- Centre information (minimal)
          tc.name as centre_name,
          tc.city as centre_city,
          -- Jury information (minimal)
          jp.first_name as jury_first_name,
          jp.last_name as jury_last_name,
          jp.region as jury_city
        FROM jury_requests jr
        LEFT JOIN training_centers tc ON jr.training_center_id = tc.id
        LEFT JOIN users u_jury ON jr.jury_id = u_jury.id
        LEFT JOIN jury_profiles jp ON u_jury.id = jp.user_id
        WHERE jr.status = ${status}
        ORDER BY 
          CASE 
            WHEN jr.session_date IS NULL THEN 2
            WHEN jr.session_date < CURRENT_DATE THEN 3
            ELSE 1
          END,
          jr.session_date ASC NULLS LAST,
          jr.created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `
    );

    // Get total count for pagination (limited to maxResults)
    const totalCountResult = await db.execute(
      sql`
        SELECT COUNT(*)::INTEGER as total_count
        FROM jury_requests jr
        WHERE jr.status = ${status}
      `
    );

    const actualCount = (totalCountResult[0] as any)?.total_count || 0;
    const totalCount = Math.min(actualCount, maxResults);
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const sessions = sessionDetailsResult.map((row: any) => ({
      id: row.id,
      status: row.status,
      sessionDate: row.session_date,
      sessionModality: row.session_modality,
      createdAt: row.created_at,
      certificationTitle: row.certification_title,
      sessionLocation: row.session_location,
      daysUntilSession: row.days_until_session,
      centre: {
        name: row.centre_name,
        city: row.centre_city,
      },
      jury: {
        firstName: row.jury_first_name,
        lastName: row.jury_last_name,
        city: row.jury_city,
      },
    }));

    return NextResponse.json({
      success: true,
      data: {
        status,
        sessions,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          actualCount,
          limit,
          hasNextPage,
          hasPrevPage,
          isLimited: actualCount > maxResults,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching session details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch session details' },
      { status: 500 }
    );
  }
}
