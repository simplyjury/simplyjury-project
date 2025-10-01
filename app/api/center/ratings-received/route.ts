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

      // Get ratings received from juries
      const { data: ratingsData, error: ratingsError } = await supabase
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
          rater_id,
          jury_requests!inner(
            id,
            training_center_id,
            certification_title,
            certification_code,
            session_date,
            jury_id
          )
        `)
        .eq('jury_requests.training_center_id', centerId)
        .eq('rater_type', 'jury')
        .eq('status', 'active')
        .not('overall_rating', 'is', null)
        .order('created_at', { ascending: false });

      if (ratingsError) {
        console.error('Error fetching ratings received:', ratingsError);
        throw new Error('Erreur lors de la récupération des évaluations reçues');
      }

      // Calculate averages
      let averages = {
        overall: 0,
        communication: 0,
        punctuality: 0,
        expertise: 0
      };

      if (ratingsData && ratingsData.length > 0) {
        const totalRatings = ratingsData.length;
        const sumOverall = ratingsData.reduce((acc, r) => acc + Number(r.overall_rating), 0);
        const sumComm = ratingsData.reduce((acc, r) => acc + Number(r.communication_rating || 0), 0);
        const sumPunct = ratingsData.reduce((acc, r) => acc + Number(r.punctuality_rating || 0), 0);
        const sumExp = ratingsData.reduce((acc, r) => acc + Number(r.expertise_rating || 0), 0);

        averages = {
          overall: Math.round((sumOverall / totalRatings) * 10) / 10,
          communication: Math.round((sumComm / totalRatings) * 10) / 10,
          punctuality: Math.round((sumPunct / totalRatings) * 10) / 10,
          expertise: Math.round((sumExp / totalRatings) * 10) / 10
        };
      }

      // Get jury profiles for all raters
      const juryIds = ratingsData?.map((r: any) => r.rater_id).filter(Boolean) || [];
      const { data: juryProfilesData } = await supabase
        .from('jury_profiles')
        .select('user_id, first_name, last_name')
        .in('user_id', juryIds);

      const { data: usersData } = await supabase
        .from('users')
        .select('id, name')
        .in('id', juryIds);

      // Create lookup maps
      const juryProfilesMap = new Map(
        (juryProfilesData || []).map((jp: any) => [jp.user_id, jp])
      );
      const usersMap = new Map(
        (usersData || []).map((u: any) => [u.id, u])
      );

      // Format ratings data
      const formattedRatings = (ratingsData || []).map((rating: any) => {
        const juryRequest = Array.isArray(rating.jury_requests) 
          ? rating.jury_requests[0] 
          : rating.jury_requests;
        
        const juryProfile = juryProfilesMap.get(rating.rater_id);
        const user = usersMap.get(rating.rater_id);

        const juryName = juryProfile?.first_name && juryProfile?.last_name
          ? `${juryProfile.first_name} ${juryProfile.last_name}`
          : user?.name || 'Jury';

        const date = new Date(rating.created_at);
        const formattedDate = date.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });

        return {
          id: rating.id,
          communicationRating: rating.communication_rating,
          punctualityRating: rating.punctuality_rating,
          expertiseRating: rating.expertise_rating,
          overallRating: rating.overall_rating,
          comment: rating.comment,
          wouldRecommend: rating.would_recommend,
          juryName,
          certificationTitle: juryRequest?.certification_title || 'Certification',
          certificationCode: juryRequest?.certification_code,
          sessionDate: juryRequest?.session_date,
          date: formattedDate
        };
      });

      return {
        totalRatings: ratingsData?.length || 0,
        averages,
        ratings: formattedRatings
      };
    });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error in center ratings-received endpoint:', error);
    
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
