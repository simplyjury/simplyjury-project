import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSession } from '@/lib/auth/session';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getCurrentUser() {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return null;
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.userId)
      .single();

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// GET - Fetch missions for a jury
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Verify user is a jury
    if (user.user_type !== 'jury') {
      return NextResponse.json({ error: 'Accès réservé aux jurys' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build query for jury missions - only show past missions
    let query = supabase
      .from('jury_requests')
      .select(`
        *,
        training_centers!inner(
          id,
          name,
          contact_person_name,
          contact_person_email,
          city,
          region,
          users!training_centers_user_id_fkey(
            id,
            name,
            email
          )
        )
      `)
      .eq('jury_id', user.id)
      .lt('session_date', new Date().toISOString().split('T')[0]) // Only past sessions
      .order('session_date', { ascending: false });

    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: missions, error } = await query;

    if (error) {
      console.error('Error fetching jury missions:', error);
      return NextResponse.json({ error: 'Erreur lors de la récupération des missions' }, { status: 500 });
    }

    // Get total count for pagination - only past missions
    let countQuery = supabase
      .from('jury_requests')
      .select('*', { count: 'exact', head: true })
      .eq('jury_id', user.id)
      .lt('session_date', new Date().toISOString().split('T')[0]); // Only past sessions

    if (status) {
      countQuery = countQuery.eq('status', status);
    }

    const { count } = await countQuery;

    // Transform the data to include center information
    const transformedMissions = missions?.map(mission => ({
      id: mission.id,
      status: mission.status,
      certification_title: mission.certification_title,
      certification_code: mission.certification_code,
      session_date: mission.session_date,
      session_start_time: mission.session_start_time,
      session_end_time: mission.session_end_time,
      candidate_count: mission.candidate_count,
      modality: mission.modality,
      session_location: mission.session_location,
      transport_covered: mission.transport_covered,
      meals_covered: mission.meals_covered,
      accommodation_covered: mission.accommodation_covered,
      custom_message: mission.custom_message,
      jury_response: mission.jury_response,
      jury_response_date: mission.jury_response_date,
      created_at: mission.created_at,
      updated_at: mission.updated_at,
      // Center information
      center_id: mission.training_centers.id,
      center_name: mission.training_centers.name,
      center_contact_name: mission.training_centers.contact_person_name,
      center_contact_email: mission.training_centers.contact_person_email,
      center_city: mission.training_centers.city,
      center_region: mission.training_centers.region,
      center_user_id: mission.training_centers.users?.id
    })) || [];

    return NextResponse.json({
      success: true,
      data: transformedMissions,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in jury-missions GET:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
