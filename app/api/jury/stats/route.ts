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

    // Execute database operations with RLS context
    const result = await withRLSContext(user.id, async () => {
      // Get total requests count
      const { count: totalRequests, error: totalError } = await supabase
        .from('jury_requests')
        .select('*', { count: 'exact', head: true })
        .eq('jury_id', user.id);

      if (totalError) {
        console.error('Error fetching total requests:', totalError);
        throw new Error('Erreur lors du calcul des demandes totales');
      }

      // Get pending requests count
      const { count: pendingRequests, error: pendingError } = await supabase
        .from('jury_requests')
        .select('*', { count: 'exact', head: true })
        .eq('jury_id', user.id)
        .eq('status', 'pending');

      if (pendingError) {
        console.error('Error fetching pending requests:', pendingError);
        throw new Error('Erreur lors du calcul des demandes en attente');
      }

      // Get completed missions count
      const { count: completedMissions, error: completedError } = await supabase
        .from('jury_requests')
        .select('*', { count: 'exact', head: true })
        .eq('jury_id', user.id)
        .eq('status', 'completed');

      if (completedError) {
        console.error('Error fetching completed missions:', completedError);
        throw new Error('Erreur lors du calcul des missions réalisées');
      }

      // Get average rating
      const { data: ratingsData, error: ratingsError } = await supabase
        .from('session_ratings')
        .select('overall_rating')
        .eq('rated_id', user.id)
        .eq('status', 'active')
        .eq('is_visible', true)
        .not('overall_rating', 'is', null);

      if (ratingsError) {
        console.error('Error fetching ratings:', ratingsError);
        throw new Error('Erreur lors du calcul de la note moyenne');
      }

      // Calculate average rating
      let averageRating = 0;
      if (ratingsData && ratingsData.length > 0) {
        const sum = ratingsData.reduce((acc, rating) => acc + Number(rating.overall_rating), 0);
        averageRating = Math.round((sum / ratingsData.length) * 10) / 10; // Round to 1 decimal place
      }

      return {
        totalRequests: totalRequests || 0,
        pendingRequests: pendingRequests || 0,
        completedMissions: completedMissions || 0,
        averageRating,
        totalRatings: ratingsData?.length || 0
      };
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des statistiques' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error in jury stats endpoint:', error);
    
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
