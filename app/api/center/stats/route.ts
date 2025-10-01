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

    // Verify user is a training center
    if (user.userType !== 'centre') {
      return NextResponse.json(
        { success: false, error: 'Accès réservé aux centres de formation' },
        { status: 403 }
      );
    }

    // Execute database operations with RLS context
    const result = await withRLSContext(user.id, async () => {
      // Get training center ID
      const { data: centerData, error: centerError } = await supabase
        .from('training_centers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (centerError || !centerData) {
        throw new Error('Centre de formation non trouvé');
      }

      const centerId = centerData.id;

      // Get total requests count
      const { count: totalRequests, error: totalError } = await supabase
        .from('jury_requests')
        .select('*', { count: 'exact', head: true })
        .eq('training_center_id', centerId);

      if (totalError) {
        console.error('Error fetching total requests:', totalError);
        throw new Error('Erreur lors du calcul des demandes totales');
      }

      // Get pending requests count
      const { count: pendingRequests, error: pendingError } = await supabase
        .from('jury_requests')
        .select('*', { count: 'exact', head: true })
        .eq('training_center_id', centerId)
        .eq('status', 'pending');

      if (pendingError) {
        console.error('Error fetching pending requests:', pendingError);
        throw new Error('Erreur lors du calcul des demandes en attente');
      }

      // Get accepted requests count
      const { count: acceptedRequests, error: acceptedError } = await supabase
        .from('jury_requests')
        .select('*', { count: 'exact', head: true })
        .eq('training_center_id', centerId)
        .eq('status', 'accepted');

      if (acceptedError) {
        console.error('Error fetching accepted requests:', acceptedError);
        throw new Error('Erreur lors du calcul des demandes acceptées');
      }

      // Get completed sessions count
      const { count: completedSessions, error: completedError } = await supabase
        .from('jury_requests')
        .select('*', { count: 'exact', head: true })
        .eq('training_center_id', centerId)
        .eq('status', 'completed');

      if (completedError) {
        console.error('Error fetching completed sessions:', completedError);
        throw new Error('Erreur lors du calcul des sessions réalisées');
      }

      // Get contacted juries count (unique juries from conversations)
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select('jury_id')
        .eq('training_center_id', centerId);

      if (conversationsError) {
        console.error('Error fetching conversations:', conversationsError);
        throw new Error('Erreur lors du calcul des jurys contactés');
      }

      const contactedJuries = new Set(conversationsData?.map(c => c.jury_id) || []).size;

      // Get active conversations count
      const { count: activeConversations, error: activeConvError } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('training_center_id', centerId)
        .eq('status', 'active');

      if (activeConvError) {
        console.error('Error fetching active conversations:', activeConvError);
        throw new Error('Erreur lors du calcul des conversations actives');
      }

      // Get average rating given by center to juries
      const { data: ratingsData, error: ratingsError } = await supabase
        .from('session_ratings')
        .select('overall_rating, jury_requests!inner(training_center_id)')
        .eq('jury_requests.training_center_id', centerId)
        .eq('rater_type', 'centre')
        .eq('status', 'active')
        .not('overall_rating', 'is', null);

      if (ratingsError) {
        console.error('Error fetching ratings:', ratingsError);
        throw new Error('Erreur lors du calcul de la note moyenne');
      }

      // Calculate average rating
      let averageRatingGiven = 0;
      if (ratingsData && ratingsData.length > 0) {
        const sum = ratingsData.reduce((acc, rating) => acc + Number(rating.overall_rating), 0);
        averageRatingGiven = Math.round((sum / ratingsData.length) * 10) / 10; // Round to 1 decimal place
      }

      return {
        totalRequests: totalRequests || 0,
        pendingRequests: pendingRequests || 0,
        acceptedRequests: acceptedRequests || 0,
        completedSessions: completedSessions || 0,
        contactedJuries,
        activeConversations: activeConversations || 0,
        averageRatingGiven,
        totalRatingsGiven: ratingsData?.length || 0
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
    console.error('Error in center stats endpoint:', error);
    
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
