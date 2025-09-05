import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AuthService } from '@/lib/auth/auth-service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface StructuredRequestData {
  juryId: number;
  certificationType: string;
  sessionDate: string;
  candidateCount: number;
  startTime: string;
  endTime: string;
  modality: 'presentiel' | 'visio' | 'hybride';
  location?: string;
  transportCovered: boolean;
  mealsCovered: boolean;
  accommodationCovered: boolean;
  customMessage: string;
}

async function getCurrentUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    const payload = await AuthService.verifyJWT(token);
    const userId = payload.userId;

    if (!userId) {
      return null;
    }

    return await AuthService.getUserWithProfile(payload.userId);
  } catch (error) {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Verify user is a training center
    if (user.userType !== 'centre') {
      return NextResponse.json(
        { error: 'Seuls les centres de formation peuvent créer des demandes' },
        { status: 403 }
      );
    }

    // Get training center info
    const { data: trainingCenter, error: centerError } = await supabase
      .from('training_centers')
      .select('id, subscription_tier')
      .eq('user_id', user.id)
      .single();

    if (centerError || !trainingCenter) {
      return NextResponse.json(
        { error: 'Centre de formation non trouvé' },
        { status: 404 }
      );
    }

    // Check if freemium user has already made a request (basic rate limiting)
    if (trainingCenter.subscription_tier === 'gratuit') {
      const { data: existingRequests, error: requestsError } = await supabase
        .from('jury_requests')
        .select('id')
        .eq('training_center_id', trainingCenter.id)
        .limit(1);

      if (requestsError) {
        console.error('Error checking existing requests:', requestsError);
        return NextResponse.json(
          { error: 'Erreur lors de la vérification des demandes existantes' },
          { status: 500 }
        );
      }

      if (existingRequests && existingRequests.length > 0) {
        return NextResponse.json(
          { 
            error: 'Limite atteinte pour le plan gratuit. Passez au plan Pro pour des contacts illimités.',
            code: 'FREEMIUM_LIMIT_REACHED'
          },
          { status: 403 }
        );
      }
    }

    const requestData: StructuredRequestData = await request.json();

    // Validate required fields
    const requiredFields = ['juryId', 'certificationType', 'sessionDate', 'candidateCount'];
    for (const field of requiredFields) {
      if (!requestData[field as keyof StructuredRequestData]) {
        return NextResponse.json(
          { error: `Le champ ${field} est requis` },
          { status: 400 }
        );
      }
    }

    // Validate modality-specific requirements
    if ((requestData.modality === 'presentiel' || requestData.modality === 'hybride') && !requestData.location) {
      return NextResponse.json(
        { error: 'Le lieu est requis pour les sessions en présentiel ou hybrides' },
        { status: 400 }
      );
    }

    // Verify jury exists and is validated
    const { data: jury, error: juryError } = await supabase
      .from('users')
      .select('id, user_type, validation_status')
      .eq('id', requestData.juryId)
      .eq('user_type', 'jury')
      .eq('validation_status', 'validated')
      .single();

    if (juryError || !jury) {
      return NextResponse.json(
        { error: 'Jury non trouvé ou non validé' },
        { status: 404 }
      );
    }

    // Set RLS context
    await supabase.rpc('set_current_user_id', { user_id: user.id });

    // Create the structured request
    const { data: juryRequest, error: insertError } = await supabase
      .from('jury_requests')
      .insert({
        training_center_id: trainingCenter.id,
        jury_id: requestData.juryId,
        request_type: 'structured',
        status: 'pending',
        certification_title: requestData.certificationType === 'autre' 
          ? 'Autre certification' 
          : requestData.certificationType,
        certification_code: requestData.certificationType !== 'autre' 
          ? requestData.certificationType 
          : null,
        session_date: requestData.sessionDate,
        candidate_count: requestData.candidateCount,
        session_start_time: requestData.startTime,
        session_end_time: requestData.endTime,
        modality: requestData.modality,
        session_location: requestData.location || null,
        transport_covered: requestData.transportCovered,
        meals_covered: requestData.mealsCovered,
        accommodation_covered: requestData.accommodationCovered,
        custom_message: requestData.customMessage || null
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating jury request:', insertError);
      return NextResponse.json(
        { error: 'Erreur lors de la création de la demande' },
        { status: 500 }
      );
    }

    // Create or get existing conversation
    let conversation;
    const { data: existingConversation, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .eq('training_center_id', trainingCenter.id)
      .eq('jury_id', requestData.juryId)
      .single();

    if (existingConversation) {
      conversation = existingConversation;
      
      // Update conversation with the new request
      await supabase
        .from('conversations')
        .update({ 
          jury_request_id: juryRequest.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingConversation.id);
    } else {
      // Create new conversation
      const { data: newConversation, error: newConvError } = await supabase
        .from('conversations')
        .insert({
          training_center_id: trainingCenter.id,
          jury_id: requestData.juryId,
          jury_request_id: juryRequest.id,
          subject: `Demande de jury - ${requestData.certificationType}`
        })
        .select()
        .single();

      if (newConvError) {
        console.error('Error creating conversation:', newConvError);
        // Don't fail the request if conversation creation fails
      } else {
        conversation = newConversation;
      }
    }

    // Create system message in conversation
    if (conversation) {
      const systemMessage = `Nouvelle demande structurée de jury créée pour la session du ${new Date(requestData.sessionDate).toLocaleDateString('fr-FR')} avec ${requestData.candidateCount} candidat(s).`;
      
      await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: user.id,
          sender_type: 'centre',
          content: systemMessage,
          message_type: 'system',
          metadata: {
            request_id: juryRequest.id,
            request_type: 'structured'
          }
        });

      // Add custom message if provided
      if (requestData.customMessage) {
        await supabase
          .from('messages')
          .insert({
            conversation_id: conversation.id,
            sender_id: user.id,
            sender_type: 'centre',
            content: requestData.customMessage,
            message_type: 'text'
          });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        requestId: juryRequest.id,
        conversationId: conversation?.id,
        message: 'Demande envoyée avec succès'
      }
    });

  } catch (error) {
    console.error('Error in jury request API:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Set RLS context
    await supabase.rpc('set_current_user_id', { user_id: user.id });

    let query = supabase
      .from('jury_requests')
      .select(`
        *,
        training_centers!inner(name, contact_person_name),
        users!jury_requests_jury_id_fkey(id, name),
        jury_profiles!inner(first_name, last_name, expertise_domains)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

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

    // Get total count for pagination
    let countQuery = supabase
      .from('jury_requests')
      .select('*', { count: 'exact', head: true });

    if (status) {
      countQuery = countQuery.eq('status', status);
    }

    const { count } = await countQuery;

    return NextResponse.json({
      success: true,
      data: requests,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in GET jury requests:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
