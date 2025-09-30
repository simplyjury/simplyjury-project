import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AuthService } from '@/lib/auth/auth-service';
import { withRLSContext } from '@/lib/auth/rls-context';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await AuthService.verifyToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const user = authResult.user;

    // Verify user is a jury
    if (user.userType !== 'jury') {
      return NextResponse.json(
        { success: false, error: 'Accès réservé aux jurys' },
        { status: 403 }
      );
    }

    // Get pagination parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;

    // Execute database operations with RLS context
    const result = await withRLSContext(user.id, async () => {
      // Get total count for pagination
      const { count: totalCount, error: countError } = await supabase
        .from('session_ratings')
        .select('*', { count: 'exact', head: true })
        .eq('rater_id', user.id)
        .eq('rater_type', 'jury')
        .eq('status', 'active')
        .not('overall_rating', 'is', null);

      if (countError) {
        console.error('Error fetching ratings given count:', countError);
        throw new Error('Erreur lors du comptage des évaluations données');
      }

      // Get paginated ratings given by this jury to centers
      const { data: ratingsGiven, error: ratingsError } = await supabase
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
          jury_request_id,
          jury_requests!inner(
            certification_title,
            certification_code,
            session_date,
            status,
            training_centers!inner(
              name
            )
          )
        `)
        .eq('rater_id', user.id)
        .eq('rater_type', 'jury')
        .eq('status', 'active')
        .not('overall_rating', 'is', null)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (ratingsError) {
        console.error('Error fetching ratings given:', ratingsError);
        throw new Error('Erreur lors de la récupération des évaluations données');
      }

      // Format ratings given
      const formattedRatings = (ratingsGiven || []).map(rating => {
        const juryRequest = rating.jury_requests as any;
        const trainingCenter = juryRequest?.training_centers;
        
        return {
          id: rating.id,
          communicationRating: rating.communication_rating,
          punctualityRating: rating.punctuality_rating,
          expertiseRating: rating.expertise_rating,
          overallRating: Number(rating.overall_rating),
          comment: rating.comment,
          wouldRecommend: rating.would_recommend,
          centerName: trainingCenter?.name || 'Centre non spécifié',
          certificationTitle: juryRequest?.certification_title,
          certificationCode: juryRequest?.certification_code,
          sessionDate: juryRequest?.session_date,
          createdAt: rating.created_at,
          date: new Date(rating.created_at).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }),
          formattedSessionDate: juryRequest?.session_date ? new Date(juryRequest.session_date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }) : null
        };
      });

      return {
        totalRatings: totalCount || 0,
        ratings: formattedRatings,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil((totalCount || 0) / limit),
          hasNextPage: page < Math.ceil((totalCount || 0) / limit),
          hasPreviousPage: page > 1
        }
      };
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des évaluations données' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error in jury ratings given endpoint:', error);
    
    // Handle specific error messages from withRLSContext
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
