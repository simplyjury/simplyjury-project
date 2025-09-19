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
    // Get authenticated user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Verify user is a training center
    if (user.user_type !== 'centre') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Get training center profile
    const { data: trainingCenter, error: centerError } = await supabase
      .from('training_centers')
      .select('id, name')
      .eq('user_id', user.id)
      .single();

    if (centerError || !trainingCenter) {
      return NextResponse.json({ error: 'Centre de formation non trouvé' }, { status: 404 });
    }

    // Set RLS context
    await supabase.rpc('set_current_user_id', { user_id: user.id });

    // Get all ratings received by this center (where rater_type = 'jury' and rated_id = user.id)
    const { data: ratings, error: ratingsError } = await supabase
      .from('session_ratings')
      .select(`
        *,
        jury_requests!inner(
          id,
          session_date,
          certification_title,
          candidate_count,
          modality,
          session_location,
          status,
          training_center_id,
          jury_id
        ),
        rater:users!session_ratings_rater_id_fkey(
          id, 
          name,
          jury_profiles(first_name, last_name, expertise_domains, current_position, current_company)
        )
      `)
      .eq('rated_id', user.id)
      .eq('rater_type', 'jury')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (ratingsError) {
      console.error('Error fetching ratings:', ratingsError);
      return NextResponse.json({ error: 'Erreur lors de la récupération des avis' }, { status: 500 });
    }

    // Calculate statistics
    const totalRatings = ratings?.length || 0;
    
    // For jury ratings, we use the overall_rating field (which is the global rating they provided)
    const averageRating = totalRatings > 0 
      ? Number((ratings.reduce((sum, rating) => sum + (rating.overall_rating || rating.communication_rating || 0), 0) / totalRatings).toFixed(1))
      : 0;

    // Count recommendations
    const recommendationsCount = ratings?.filter(rating => rating.would_recommend === true).length || 0;
    const recommendationPercentage = totalRatings > 0 
      ? Math.round((recommendationsCount / totalRatings) * 100) 
      : 0;

    // Count unique juries who evaluated
    const uniqueJuries = new Set(ratings?.map(rating => rating.rater_id) || []).size;

    // Count sessions evaluated (unique jury_request_id)
    const uniqueSessions = new Set(ratings?.map(rating => rating.jury_request_id) || []).size;

    // Get recent ratings with jury details for the list
    const recentRatings = ratings?.slice(0, 10).map(rating => ({
      id: rating.id,
      overall_rating: rating.overall_rating || rating.communication_rating, // Use overall_rating for jury ratings
      communication_rating: rating.communication_rating,
      punctuality_rating: rating.punctuality_rating,
      expertise_rating: rating.expertise_rating,
      comment: rating.comment,
      would_recommend: rating.would_recommend,
      created_at: rating.created_at,
      jury: {
        id: rating.rater.id,
        name: rating.rater.name,
        first_name: rating.rater.jury_profiles?.[0]?.first_name,
        last_name: rating.rater.jury_profiles?.[0]?.last_name,
        expertise_domains: rating.rater.jury_profiles?.[0]?.expertise_domains,
        current_position: rating.rater.jury_profiles?.[0]?.current_position,
        current_company: rating.rater.jury_profiles?.[0]?.current_company
      },
      session: {
        id: rating.jury_requests.id,
        session_date: rating.jury_requests.session_date,
        certification_title: rating.jury_requests.certification_title,
        candidate_count: rating.jury_requests.candidate_count,
        modality: rating.jury_requests.modality,
        location: rating.jury_requests.session_location
      }
    })) || [];

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalRatings,
          averageRating,
          recommendationPercentage,
          uniqueJuries,
          uniqueSessions
        },
        recentRatings
      }
    });

  } catch (error) {
    console.error('Error in center ratings API:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
