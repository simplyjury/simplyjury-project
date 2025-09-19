import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AuthService } from '@/lib/auth/auth-service';
import { withRLSContext } from '@/lib/auth/rls-context';
import { sendRatingInvitationEmails } from '@/lib/actions/rating-invitation-actions';

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

    // Verify user is a training center
    if (user.userType !== 'centre') {
      return NextResponse.json(
        { success: false, error: 'Seuls les centres de formation peuvent marquer les sessions comme terminées' },
        { status: 403 }
      );
    }

    // Execute database operations with RLS context
    const result = await withRLSContext(user.id, async () => {
      // First, verify that the request exists and belongs to this center
      const { data: existingRequest, error: fetchError } = await supabase
        .from('jury_requests')
        .select(`
          id,
          status,
          session_date,
          training_center_id,
          training_centers!inner(
            id,
            name,
            user_id
          )
        `)
        .eq('id', requestId)
        .single();

      if (fetchError || !existingRequest) {
        throw new Error('Demande non trouvée');
      }

      // Verify the center owns this request
      if ((existingRequest.training_centers as any).user_id !== user.id) {
        throw new Error('Accès non autorisé à cette demande');
      }

      // Check if request is in accepted status
      if (existingRequest.status !== 'accepted') {
        throw new Error('Seules les sessions acceptées peuvent être marquées comme terminées');
      }

      // Check if session date has passed
      const sessionDate = new Date(existingRequest.session_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison

      if (sessionDate >= today) {
        throw new Error('La session ne peut être marquée comme terminée qu\'après la date prévue');
      }

      // Update the request status to completed
      const { data: updatedRequest, error: updateError } = await supabase
        .from('jury_requests')
        .update({
          status: 'completed',
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
          ),
          users!jury_requests_jury_id_fkey(
            id,
            name,
            email
          )
        `)
        .single();

      if (updateError) {
        console.error('Error updating jury request to completed:', updateError);
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
    console.log(`Jury request ${requestId} marked as completed by center user ${user.id}`);

    // Send rating invitation emails to both center and jury
    try {
      console.log(`Sending rating invitation emails for request ${requestId}`);
      const emailResult = await sendRatingInvitationEmails(requestId);
      
      if (emailResult.success) {
        console.log(`Rating invitation emails sent successfully for request ${requestId}:`, emailResult.details);
      } else {
        console.error(`Failed to send rating invitation emails for request ${requestId}:`, emailResult.error);
        // Don't fail the whole request if emails fail - just log the error
      }
    } catch (emailError) {
      console.error(`Error sending rating invitation emails for request ${requestId}:`, emailError);
      // Don't fail the whole request if emails fail - just log the error
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Session marquée comme terminée avec succès'
    });

  } catch (error) {
    console.error('Error in jury request completion:', error);
    
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
