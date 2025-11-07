import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSession } from '@/lib/auth/session';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getCurrentUser() {
  const session = await getSession();
  if (!session || !session.userId) {
    return null;
  }

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.userId)
    .single();

  return userData;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.user_type !== 'admin') {
      return NextResponse.json(
        { error: 'Accès réservé aux administrateurs' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const centerId = searchParams.get('centerId');
    const status = searchParams.get('status');

    if (!centerId) {
      return NextResponse.json(
        { error: 'ID du centre requis' },
        { status: 400 }
      );
    }

    // Build query - use the foreign key constraint name to join with users and jury_profiles
    let query = supabase
      .from('jury_requests')
      .select(`
        id,
        certification_title,
        session_date,
        status,
        users!jury_requests_jury_id_fkey(
          id,
          jury_profiles(first_name, last_name)
        )
      `)
      .eq('training_center_id', centerId)
      .order('created_at', { ascending: false });

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }

    const { data: requests, error } = await query;

    if (error) {
      console.error('Error fetching jury requests:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des demandes' },
        { status: 500 }
      );
    }

    // Transform data to include jury name
    const transformedRequests = requests?.map((req: any) => ({
      id: req.id,
      certification_title: req.certification_title,
      session_date: req.session_date,
      status: req.status,
      jury_name: req.users?.jury_profiles?.[0]
        ? `${req.users.jury_profiles[0].first_name} ${req.users.jury_profiles[0].last_name}`
        : 'N/A'
    })) || [];

    return NextResponse.json({
      success: true,
      data: transformedRequests
    });

  } catch (error) {
    console.error('Error in GET /api/admin/jury-requests:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
