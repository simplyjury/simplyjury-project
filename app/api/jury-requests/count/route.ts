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
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Only jury users can get their request count
    if (user.user_type !== 'jury') {
      return NextResponse.json({ count: 0 });
    }

    // Set RLS context
    await supabase.rpc('set_current_user_id', { user_id: user.id });

    // Get count of pending requests for this jury
    const { count, error } = await supabase
      .from('jury_requests')
      .select('*', { count: 'exact', head: true })
      .eq('jury_id', user.id)
      .eq('status', 'pending');

    if (error) {
      console.error('Error fetching jury request count:', error);
      return NextResponse.json({ error: 'Erreur lors de la récupération du nombre de demandes' }, { status: 500 });
    }

    return NextResponse.json({ count: count || 0 });

  } catch (error) {
    console.error('Error in jury request count API:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
