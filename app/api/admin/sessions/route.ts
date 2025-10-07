import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { sql } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';

async function getCurrentUser() {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return null;
    }

    const userResult = await db.execute(
      sql`SELECT * FROM users WHERE id = ${session.userId}`
    );

    if (!userResult || userResult.length === 0) {
      return null;
    }

    return userResult[0];
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Verify user is admin
    if ((user as any).user_type !== 'admin') {
      return NextResponse.json(
        { error: 'Accès refusé - droits administrateur requis' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const modality = searchParams.get('modality') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const sortBy = searchParams.get('sortBy') || '';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Build the base query with filters using sql template
    let whereConditions = [];

    if (search) {
      const searchPattern = `%${search}%`;
      whereConditions.push(sql`(
        tc.name ILIKE ${searchPattern} OR 
        jp.first_name ILIKE ${searchPattern} OR 
        jp.last_name ILIKE ${searchPattern} OR 
        jr.certification_title ILIKE ${searchPattern}
      )`);
    }

    if (status) {
      whereConditions.push(sql`jr.status = ${status}`);
    }

    if (modality) {
      whereConditions.push(sql`jr.modality = ${modality}`);
    }

    if (dateFrom) {
      whereConditions.push(sql`jr.session_date >= ${dateFrom}`);
    }

    if (dateTo) {
      whereConditions.push(sql`jr.session_date <= ${dateTo}`);
    }

    // Determine sort order
    let orderByClause;
    const sortDirection = sortOrder === 'asc' ? sql`ASC` : sql`DESC`;
    
    if (sortBy === 'certification_title') {
      orderByClause = sql`ORDER BY jr.certification_title ${sortDirection} NULLS LAST`;
    } else if (sortBy === 'training_center_name') {
      orderByClause = sql`ORDER BY tc.name ${sortDirection} NULLS LAST`;
    } else if (sortBy === 'session_date') {
      orderByClause = sql`ORDER BY jr.session_date ${sortDirection} NULLS LAST`;
    } else if (sortBy === 'modality') {
      orderByClause = sql`ORDER BY jr.modality ${sortDirection} NULLS LAST`;
    } else if (sortBy === 'status') {
      orderByClause = sql`ORDER BY jr.status ${sortDirection} NULLS LAST`;
    } else {
      // Default sort by session date descending
      orderByClause = sql`ORDER BY jr.session_date DESC NULLS LAST, jr.created_at DESC`;
    }

    // Get sessions with pagination
    const sessionsResult = await db.execute(sql`
      SELECT 
        jr.id,
        jr.status,
        jr.certification_title,
        jr.certification_code,
        jr.session_date,
        jr.candidate_count,
        jr.session_start_time,
        jr.session_end_time,
        jr.modality,
        jr.session_location,
        jr.transport_covered,
        jr.meals_covered,
        jr.accommodation_covered,
        jr.custom_message,
        jr.jury_response,
        jr.jury_response_date,
        jr.created_at,
        jr.updated_at,
        tc.name as training_center_name,
        jp.first_name as jury_first_name,
        jp.last_name as jury_last_name,
        u_jury.email as jury_email,
        jp.expertise_domains as jury_expertise_domains
      FROM jury_requests jr
      LEFT JOIN training_centers tc ON jr.training_center_id = tc.id
      LEFT JOIN users u_jury ON jr.jury_id = u_jury.id
      LEFT JOIN jury_profiles jp ON u_jury.id = jp.user_id
      ${whereConditions.length > 0 ? sql`WHERE ${sql.join(whereConditions, sql` AND `)}` : sql``}
      ${orderByClause}
      LIMIT ${limit}
      OFFSET ${offset}
    `);

    // Get total count
    const countResult = await db.execute(sql`
      SELECT COUNT(*)::INTEGER as total_count
      FROM jury_requests jr
      LEFT JOIN training_centers tc ON jr.training_center_id = tc.id
      LEFT JOIN users u_jury ON jr.jury_id = u_jury.id
      LEFT JOIN jury_profiles jp ON u_jury.id = jp.user_id
      ${whereConditions.length > 0 ? sql`WHERE ${sql.join(whereConditions, sql` AND `)}` : sql``}
    `);

    const totalCount = (countResult[0] as any)?.total_count || 0;
    const transformedSessions = sessionsResult;

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      sessions: transformedSessions,
      pagination: {
        currentPage: page,
        limit,
        totalCount: totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error in admin sessions API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
