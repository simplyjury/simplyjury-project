import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AuthService } from '@/lib/auth/auth-service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch ratings summary for multiple juries (for centers to see jury ratings)
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await AuthService.verifyToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const user = authResult.user;

    // Verify user is a center
    if (user.userType !== 'centre') {
      return NextResponse.json({ error: 'Accès réservé aux centres' }, { status: 403 });
    }

    // Get jury IDs from query parameters
    const url = new URL(request.url);
    const juryIdsParam = url.searchParams.get('jury_ids');
    
    if (!juryIdsParam) {
      return NextResponse.json({ error: 'jury_ids parameter required' }, { status: 400 });
    }

    const juryIds = juryIdsParam.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    
    if (juryIds.length === 0) {
      return NextResponse.json({ success: true, data: {} });
    }

    // Fetch ratings for all specified juries
    const { data: ratings, error } = await supabase
      .from('session_ratings')
      .select(`
        rated_id,
        overall_rating,
        communication_rating,
        punctuality_rating,
        expertise_rating
      `)
      .in('rated_id', juryIds)
      .eq('rater_type', 'centre')
      .eq('status', 'active');

    if (error) {
      console.error('Error fetching jury ratings summary:', error);
      return NextResponse.json({ error: 'Erreur lors de la récupération des évaluations' }, { status: 500 });
    }

    // Group ratings by jury ID and calculate averages
    const ratingsSummary: Record<number, { averageRating: number; totalRatings: number }> = {};

    juryIds.forEach(juryId => {
      const juryRatings = ratings?.filter(rating => rating.rated_id === juryId) || [];
      
      if (juryRatings.length > 0) {
        const totalRating = juryRatings.reduce((sum, rating) => sum + parseFloat(rating.overall_rating), 0);
        const averageRating = Math.round((totalRating / juryRatings.length) * 10) / 10;
        
        ratingsSummary[juryId] = {
          averageRating,
          totalRatings: juryRatings.length
        };
      } else {
        ratingsSummary[juryId] = {
          averageRating: 0,
          totalRatings: 0
        };
      }
    });

    return NextResponse.json({
      success: true,
      data: ratingsSummary
    });

  } catch (error) {
    console.error('Error in jury-ratings-summary GET:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
