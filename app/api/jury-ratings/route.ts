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

// GET - Fetch ratings received by a jury
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

    // Fetch all ratings received by this jury from centers
    const { data: ratings, error } = await supabase
      .from('session_ratings')
      .select(`
        id,
        communication_rating,
        punctuality_rating,
        expertise_rating,
        overall_rating,
        comment,
        would_recommend,
        created_at,
        jury_requests!inner(
          id,
          certification_title,
          session_date,
          training_centers!inner(
            name
          )
        )
      `)
      .eq('rated_id', user.id)
      .eq('rater_type', 'centre')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching jury ratings:', error);
      return NextResponse.json({ error: 'Erreur lors de la récupération des évaluations' }, { status: 500 });
    }

    // Calculate average ratings
    const ratingsData = ratings || [];
    const totalRatings = ratingsData.length;

    if (totalRatings === 0) {
      return NextResponse.json({
        success: true,
        data: {
          totalRatings: 0,
          averageRatings: null,
          ratings: []
        }
      });
    }

    // Calculate averages for each criterion
    const communicationSum = ratingsData.reduce((sum, rating) => sum + rating.communication_rating, 0);
    const punctualitySum = ratingsData.reduce((sum, rating) => sum + rating.punctuality_rating, 0);
    const expertiseSum = ratingsData.reduce((sum, rating) => sum + rating.expertise_rating, 0);
    const overallSum = ratingsData.reduce((sum, rating) => sum + rating.overall_rating, 0);

    const averageRatings = {
      communication: Math.round((communicationSum / totalRatings) * 10) / 10,
      punctuality: Math.round((punctualitySum / totalRatings) * 10) / 10,
      expertise: Math.round((expertiseSum / totalRatings) * 10) / 10,
      overall: Math.round((overallSum / totalRatings) * 10) / 10
    };

    // Calculate recommendation percentage
    const recommendationsCount = ratingsData.filter(rating => rating.would_recommend === true).length;
    const recommendationPercentage = totalRatings > 0 ? Math.round((recommendationsCount / totalRatings) * 100) : 0;

    // Transform ratings data for frontend
    const transformedRatings = ratingsData.map(rating => ({
      id: rating.id,
      communication_rating: rating.communication_rating,
      punctuality_rating: rating.punctuality_rating,
      expertise_rating: rating.expertise_rating,
      overall_rating: rating.overall_rating,
      comment: rating.comment,
      would_recommend: rating.would_recommend,
      created_at: rating.created_at,
      certification_title: (rating.jury_requests as any).certification_title,
      session_date: (rating.jury_requests as any).session_date,
      center_name: (rating.jury_requests as any).training_centers.name
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalRatings,
        averageRatings,
        recommendationPercentage,
        ratings: transformedRatings
      }
    });

  } catch (error) {
    console.error('Error in jury-ratings GET:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
