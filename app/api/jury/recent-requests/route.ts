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
      // Calculate the date 10 days ago
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
      const tenDaysAgoISO = tenDaysAgo.toISOString();

      // Get recent requests (last 10 days, limit 3, ordered by creation date desc)
      const { data: recentRequests, error: requestsError } = await supabase
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
          training_centers!inner(
            name,
            contact_person_name
          )
        `)
        .eq('jury_id', user.id)
        .gte('created_at', tenDaysAgoISO)
        .order('created_at', { ascending: false })
        .limit(3);

      if (requestsError) {
        console.error('Error fetching recent requests:', requestsError);
        throw new Error('Erreur lors de la récupération des demandes récentes');
      }

      // Format the data for the frontend
      const formattedRequests = recentRequests?.map(request => {
        // Handle the training_centers relation (it's an object, not an array)
        const trainingCenter = request.training_centers as any;
        
        return {
          id: request.id,
          certificationName: request.certification_title || request.certification_code || 'Certification non spécifiée',
          certificationCode: request.certification_code,
          centerName: trainingCenter?.name || 'Centre non spécifié',
          contactPerson: trainingCenter?.contact_person_name || '',
          status: request.status,
          sessionDate: request.session_date,
          candidateCount: request.candidate_count,
          modality: request.modality,
          createdAt: request.created_at,
          // Format the date for display
          date: new Date(request.created_at).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })
        };
      }) || [];

      return formattedRequests;
    });

    if (result === null) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des demandes récentes' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error in jury recent requests endpoint:', error);
    
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
