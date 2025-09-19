import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AuthService } from '@/lib/auth/auth-service';
import { withRLSContext } from '@/lib/auth/rls-context';
import { sendJuryRequestResponseEmails } from '@/lib/actions/jury-request-actions';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const resolvedParams = await params;
    const requestId = parseInt(resolvedParams.id);

    if (isNaN(requestId)) {
      return NextResponse.json(
        { success: false, error: 'ID de demande invalide' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { status } = body;

    // Validate status
    if (!['accepted', 'declined'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Statut invalide. Utilisez "accepted" ou "declined".' },
        { status: 400 }
      );
    }

    // Execute database operations with RLS context
    const result = await withRLSContext(user.id, async () => {
      // First, verify that the request exists and belongs to this jury
      const { data: existingRequest, error: fetchError } = await supabase
        .from('jury_requests')
        .select(`
          id,
          status,
          jury_id
        `)
        .eq('id', requestId)
        .eq('jury_id', user.id)
        .single();

      if (fetchError || !existingRequest) {
        throw new Error('Demande non trouvée ou accès non autorisé');
      }

      // Check if request is still pending
      if (existingRequest.status !== 'pending') {
        throw new Error('Cette demande a déjà été traitée');
      }

      // Update the request status
      const { data: updatedRequest, error: updateError } = await supabase
        .from('jury_requests')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select(`
          id,
          status,
          certification_title,
          certification_code,
          session_date,
          session_start_time,
          session_end_time,
          candidate_count,
          modality,
          session_location,
          transport_covered,
          meals_covered,
          accommodation_covered,
          custom_message,
          created_at,
          updated_at,
          training_centers!inner(
            name,
            contact_person_name,
            contact_person_email
          )
        `)
        .single();

      if (updateError) {
        console.error('Error updating jury request status:', updateError);
        throw new Error('Erreur lors de la mise à jour du statut');
      }

      return updatedRequest;
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la mise à jour' },
        { status: 500 }
      );
    }

    // Log the status change for audit purposes
    console.log(`Jury request ${requestId} status changed to ${status} by user ${user.id}`);

    // Send notification emails to both parties
    try {
      console.log(`Sending notification emails for request ${requestId} with status: ${status}`);
      const emailResult = await sendJuryRequestResponseEmails(
        requestId,
        status === 'accepted' ? 'accepted' : 'declined'
      );
      
      if (emailResult.success) {
        console.log('Notification emails sent successfully:', emailResult.message);
      } else {
        console.warn('Failed to send notification emails:', emailResult.error);
        // Don't fail the request if emails fail - the status update was successful
      }
    } catch (emailError) {
      console.error('Error sending notification emails:', emailError);
      // Continue with success response even if emails fail
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: status === 'accepted' 
        ? 'Demande acceptée avec succès' 
        : 'Demande refusée avec succès'
    });

  } catch (error) {
    console.error('Error in jury request status update:', error);
    
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
