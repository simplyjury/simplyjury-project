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
    // Get current user
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

    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const period = searchParams.get('period');
    const certification = searchParams.get('certification');

    // Build query for center's past sessions (session_date < today)
    let query = supabase
      .from('jury_requests')
      .select(`
        *,
        users!jury_requests_jury_id_fkey(
          id, 
          name,
          jury_profiles(first_name, last_name, expertise_domains, profile_photo_url)
        )
      `)
      .eq('training_center_id', trainingCenter.id)
      .lt('session_date', new Date().toISOString().split('T')[0]) // Only past sessions
      .order('session_date', { ascending: false });

    // Apply additional filters
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
      
      query = query.gte('session_date', startDate.toISOString().split('T')[0]);
    }

    if (certification) {
      query = query.ilike('certification_title', `%${certification}%`);
    }

    // Execute query
    const { data: sessions, error } = await query;

    if (error) {
      console.error('Error fetching center sessions:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des sessions' },
        { status: 500 }
      );
    }

    // Transform data to match the expected format
    const transformedSessions = (sessions || []).map(session => {
      let juryName = 'Jury Non Assigné';
      let juryProfilePhoto = null;
      
      // Extract jury name and profile photo from the nested users.jury_profiles relationship
      if (session.users && session.users.jury_profiles && session.users.jury_profiles.length > 0) {
        const profile = session.users.jury_profiles[0];
        
        if (profile.first_name && profile.last_name) {
          juryName = `${profile.first_name} ${profile.last_name}`;
        }
        juryProfilePhoto = profile.profile_photo_url;
      }
      
      // Fallback to user name if no jury profile
      if (juryName === 'Jury Non Assigné' && session.users?.name) {
        juryName = session.users.name;
      }

      return {
        id: session.id,
        status: session.status,
        certification_title: session.certification_title,
        certification_code: session.certification_code,
        session_date: session.session_date,
        session_start_time: session.session_start_time,
        session_end_time: session.session_end_time,
        candidate_count: session.candidate_count,
        modality: session.modality,
        session_location: session.session_location,
        transport_covered: session.transport_covered,
        meals_covered: session.meals_covered,
        accommodation_covered: session.accommodation_covered,
        custom_message: session.custom_message,
        jury_response: session.jury_response,
        created_at: session.created_at,
        updated_at: session.updated_at,
        jury_id: session.jury_id, // Add jury ID for rating functionality
        jury_name: juryName,
        jury_profile_photo: juryProfilePhoto,
        jury_rating: '4.9', // Mock data - would come from ratings system
        jury_reviews: '45' // Mock data - would come from reviews system
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedSessions
    });

  } catch (error) {
    console.error('Error in center-sessions API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
