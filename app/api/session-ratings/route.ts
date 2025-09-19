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

// GET - Fetch ratings for a session or user
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const juryRequestId = searchParams.get('jury_request_id');
    const userId = searchParams.get('user_id');
    const type = searchParams.get('type'); // 'given' or 'received'

    let query = supabase
      .from('session_ratings')
      .select(`
        *,
        jury_requests!inner(
          id,
          session_date,
          certification_title,
          training_center_id,
          jury_id,
          training_centers(name),
          users!jury_requests_jury_id_fkey(name)
        ),
        rater:users!session_ratings_rater_id_fkey(id, name),
        rated:users!session_ratings_rated_id_fkey(id, name)
      `);

    if (juryRequestId) {
      query = query.eq('jury_request_id', juryRequestId);
    }

    if (userId && type) {
      if (type === 'given') {
        query = query.eq('rater_id', userId);
      } else if (type === 'received') {
        query = query.eq('rated_id', userId);
      }
    }

    const { data: ratings, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching ratings:', error);
      return NextResponse.json({ error: 'Erreur lors de la récupération des évaluations' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: ratings });

  } catch (error) {
    console.error('Error in session-ratings GET:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

// POST - Create a new rating
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const {
      jury_request_id,
      rated_id,
      communication_rating,
      punctuality_rating,
      expertise_rating,
      comment,
      would_recommend
    } = body;

    // Validate required fields
    if (!jury_request_id || !rated_id || !communication_rating || !punctuality_rating || !expertise_rating) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    // Validate rating values (1-5)
    const ratings = [communication_rating, punctuality_rating, expertise_rating];
    if (ratings.some(rating => rating < 1 || rating > 5)) {
      return NextResponse.json({ error: 'Les notes doivent être entre 1 et 5' }, { status: 400 });
    }

    // Verify the jury request exists and user is authorized to rate
    const { data: juryRequest, error: requestError } = await supabase
      .from('jury_requests')
      .select(`
        *,
        training_centers(user_id)
      `)
      .eq('id', jury_request_id)
      .single();

    if (requestError || !juryRequest) {
      return NextResponse.json({ error: 'Demande de jury non trouvée' }, { status: 404 });
    }

    // Check if session is eligible for rating (completed and date passed)
    if (juryRequest.status !== 'completed' || new Date(juryRequest.session_date) >= new Date()) {
      return NextResponse.json({ error: 'Cette session n\'est pas encore éligible pour une évaluation' }, { status: 400 });
    }

    // Determine rater type and validate authorization
    let raterType: 'centre' | 'jury';
    if (user.user_type === 'centre' && juryRequest.training_centers?.user_id === user.id) {
      raterType = 'centre';
      // Center rating jury - verify rated_id is the jury
      if (rated_id !== juryRequest.jury_id) {
        return NextResponse.json({ error: 'Utilisateur évalué invalide' }, { status: 400 });
      }
    } else if (user.user_type === 'jury' && juryRequest.jury_id === user.id) {
      raterType = 'jury';
      // Jury rating center - verify rated_id is the center user
      if (rated_id !== juryRequest.training_centers?.user_id) {
        return NextResponse.json({ error: 'Utilisateur évalué invalide' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'Non autorisé à évaluer cette session' }, { status: 403 });
    }

    // Check if user has already rated this session
    const { data: existingRating } = await supabase
      .from('session_ratings')
      .select('id')
      .eq('jury_request_id', jury_request_id)
      .eq('rater_id', user.id)
      .single();

    if (existingRating) {
      return NextResponse.json({ error: 'Vous avez déjà évalué cette session' }, { status: 400 });
    }

    // Create the rating
    const { data: rating, error: ratingError } = await supabase
      .from('session_ratings')
      .insert({
        jury_request_id,
        rater_id: user.id,
        rated_id,
        rater_type: raterType,
        communication_rating,
        punctuality_rating,
        expertise_rating,
        comment: comment || null,
        would_recommend: would_recommend || null
      })
      .select()
      .single();

    if (ratingError) {
      console.error('Error creating rating:', ratingError);
      return NextResponse.json({ error: 'Erreur lors de la création de l\'évaluation' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: rating });

  } catch (error) {
    console.error('Error in session-ratings POST:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

// PUT - Update an existing rating
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const {
      rating_id,
      communication_rating,
      punctuality_rating,
      expertise_rating,
      comment,
      would_recommend
    } = body;

    if (!rating_id) {
      return NextResponse.json({ error: 'ID de l\'évaluation requis' }, { status: 400 });
    }

    // Validate rating values if provided
    const ratings = [communication_rating, punctuality_rating, expertise_rating].filter(r => r !== undefined);
    if (ratings.some(rating => rating < 1 || rating > 5)) {
      return NextResponse.json({ error: 'Les notes doivent être entre 1 et 5' }, { status: 400 });
    }

    // Verify the rating exists and belongs to the current user
    const { data: existingRating, error: fetchError } = await supabase
      .from('session_ratings')
      .select('*')
      .eq('id', rating_id)
      .eq('rater_id', user.id)
      .single();

    if (fetchError || !existingRating) {
      return NextResponse.json({ error: 'Évaluation non trouvée ou non autorisée' }, { status: 404 });
    }

    // Check if rating is still editable (within 24 hours)
    const ratingAge = Date.now() - new Date(existingRating.created_at).getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    if (ratingAge > twentyFourHours) {
      return NextResponse.json({ error: 'Cette évaluation ne peut plus être modifiée (délai de 24h dépassé)' }, { status: 400 });
    }

    // Update the rating
    const updateData: any = {};
    if (communication_rating !== undefined) updateData.communication_rating = communication_rating;
    if (punctuality_rating !== undefined) updateData.punctuality_rating = punctuality_rating;
    if (expertise_rating !== undefined) updateData.expertise_rating = expertise_rating;
    if (comment !== undefined) updateData.comment = comment;
    if (would_recommend !== undefined) updateData.would_recommend = would_recommend;

    const { data: updatedRating, error: updateError } = await supabase
      .from('session_ratings')
      .update(updateData)
      .eq('id', rating_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating rating:', updateError);
      return NextResponse.json({ error: 'Erreur lors de la mise à jour de l\'évaluation' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: updatedRating });

  } catch (error) {
    console.error('Error in session-ratings PUT:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
