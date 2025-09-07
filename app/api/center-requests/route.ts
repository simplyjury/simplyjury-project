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

export async function GET(request: NextRequest) {
  try {
    // Get current user using the same method as jury-requests
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Only allow center users to access this endpoint
    if (user.user_type !== 'centre') {
      return NextResponse.json(
        { error: 'Accès non autorisé pour ce type d\'utilisateur' },
        { status: 403 }
      );
    }

    // Get training center for this user
    const { data: trainingCenter, error: centerError } = await supabase
      .from('training_centers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (centerError || !trainingCenter) {
      return NextResponse.json(
        { error: 'Centre de formation non trouvé' },
        { status: 404 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const period = searchParams.get('period');
    const certification = searchParams.get('certification');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build query for center's outgoing requests
    let query = supabase
      .from('jury_requests')
      .select(`
        *,
        users!jury_requests_jury_id_fkey(
          id, 
          name,
          jury_profiles(first_name, last_name, expertise_domains)
        )
      `)
      .eq('training_center_id', trainingCenter.id)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (period) {
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3);
          startDate = new Date(now.getFullYear(), quarter * 3, 1);
          break;
        default:
          startDate = new Date(0);
      }
      
      query = query.gte('created_at', startDate.toISOString());
    }

    if (certification) {
      query = query.ilike('certification_type', `%${certification}%`);
    }

    // Execute query with pagination
    const { data: requests, error, count } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching center requests:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des demandes' },
        { status: 500 }
      );
    }

    // Transform data to match the expected format
    const transformedRequests = (requests || []).map(request => {
      let juryName = 'Jury Non Assigné';
      
      // Extract jury name from the nested users.jury_profiles relationship
      if (request.users && request.users.jury_profiles) {
        const profile = request.users.jury_profiles;
        if (profile.first_name && profile.last_name) {
          juryName = `${profile.first_name} ${profile.last_name}`;
        }
      }
      
      // Fallback to user name if no jury profile
      if (juryName === 'Jury Non Assigné' && request.users?.name) {
        juryName = request.users.name;
      }

      return {
        id: request.id,
        status: request.status,
        certification_type: request.certification_title || request.certification_type,
        rncp_code: request.certification_code || request.rncp_code,
        level: request.level,
        session_date: request.session_date,
        candidate_count: request.candidate_count,
        modality: request.modality,
        location: request.session_location || request.location,
        duration: request.duration,
        city: request.city,
        created_at: request.created_at,
        jury_name: juryName,
        jury_rating: '4.9', // Mock data - would come from ratings system
        jury_reviews: '45', // Mock data - would come from reviews system
        jury_message: request.jury_response || request.jury_response_message || null
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedRequests,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in center-requests API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
