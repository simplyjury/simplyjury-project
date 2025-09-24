import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { sql } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = parseInt(id);

    if (isNaN(sessionId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid session ID' },
        { status: 400 }
      );
    }

    // Get detailed session information (lazy loaded)
    const sessionDetailResult = await db.execute(
      sql`
        SELECT 
          jr.id,
          jr.status,
          jr.session_date,
          jr.modality as session_modality,
          jr.created_at,
          jr.certification_title,
          jr.certification_code,
          jr.session_location,
          jr.candidate_count,
          jr.session_start_time,
          jr.session_end_time,
          jr.transport_covered,
          jr.meals_covered,
          jr.accommodation_covered,
          jr.custom_message,
          -- Centre detailed information
          tc.name as centre_name,
          tc.city as centre_city,
          tc.email as centre_email,
          tc.phone as centre_phone,
          tc.address as centre_address,
          u_centre.email as centre_user_email,
          -- Jury detailed information
          jp.first_name as jury_first_name,
          jp.last_name as jury_last_name,
          jp.region as jury_region,
          jp.current_position as jury_position,
          jp.experience_years as jury_experience,
          jp.expertise_domains as jury_expertise,
          u_jury.email as jury_email
        FROM jury_requests jr
        LEFT JOIN training_centers tc ON jr.training_center_id = tc.id
        LEFT JOIN users u_centre ON tc.user_id = u_centre.id
        LEFT JOIN users u_jury ON jr.jury_id = u_jury.id
        LEFT JOIN jury_profiles jp ON u_jury.id = jp.user_id
        WHERE jr.id = ${sessionId}
      `
    );

    if (sessionDetailResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    const row = sessionDetailResult[0];
    const sessionDetail = {
      id: row.id,
      status: row.status,
      sessionDate: row.session_date,
      sessionModality: row.session_modality,
      createdAt: row.created_at,
      certificationTitle: row.certification_title,
      certificationCode: row.certification_code,
      sessionLocation: row.session_location,
      candidateCount: row.candidate_count,
      sessionStartTime: row.session_start_time,
      sessionEndTime: row.session_end_time,
      transportCovered: row.transport_covered,
      mealsCovered: row.meals_covered,
      accommodationCovered: row.accommodation_covered,
      customMessage: row.custom_message,
      centre: {
        name: row.centre_name,
        city: row.centre_city,
        email: row.centre_email,
        phone: row.centre_phone,
        address: row.centre_address,
        userEmail: row.centre_user_email,
      },
      jury: {
        firstName: row.jury_first_name,
        lastName: row.jury_last_name,
        region: row.jury_region,
        position: row.jury_position,
        experience: row.jury_experience,
        expertise: row.jury_expertise,
        email: row.jury_email,
      },
    };

    return NextResponse.json({
      success: true,
      data: sessionDetail,
    });
  } catch (error) {
    console.error('Error fetching session detail:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch session detail' },
      { status: 500 }
    );
  }
}
