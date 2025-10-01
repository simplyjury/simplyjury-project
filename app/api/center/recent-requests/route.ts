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

      // Get recent requests (last 10 days, limit 3)
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

      const { data: requestsData, error: requestsError } = await supabase
        .from('jury_requests')
        .select(`
          id,
          status,
          certification_title,
          certification_code,
          session_date,
          candidate_count,
          modality,
          created_at,
          jury_id,
          users!jury_requests_jury_id_fkey(
            name,
            jury_profiles(first_name, last_name)
          )
        `)
        .eq('training_center_id', centerId)
        .gte('created_at', tenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(3);

      if (requestsError) {
        console.error('Error fetching recent requests:', requestsError);
        throw new Error('Erreur lors de la récupération des demandes récentes');
      }

      // Format the data
      const formattedRequests = (requestsData || []).map((row: any) => {
        // Format jury name - jury_profiles is now nested under users
        const juryProfile = row.users?.jury_profiles;
        const juryName = juryProfile?.first_name && juryProfile?.last_name
          ? `${juryProfile.first_name} ${juryProfile.last_name}`
          : row.users?.name || 'Jury';

        // Format date
        const date = new Date(row.created_at);
        const formattedDate = date.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });

        return {
          id: row.id,
          status: row.status,
          certificationName: row.certification_title || row.certification_code || 'Certification',
          certificationCode: row.certification_code,
          sessionDate: row.session_date,
          candidateCount: row.candidate_count,
          modality: row.modality,
          juryName,
          date: formattedDate,
          createdAt: row.created_at
        };
      });

      return formattedRequests;
    });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error in center recent requests endpoint:', error);
    
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
