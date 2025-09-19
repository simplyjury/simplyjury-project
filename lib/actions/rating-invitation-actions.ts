'use server';

import { createClient } from '@supabase/supabase-js';
import { EmailService } from '@/lib/email/resend-service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function sendRatingInvitationEmails(requestId: number) {
  try {
    console.log(`Starting rating invitation email process for request ${requestId}`);

    // Get the jury request with all related data using Supabase
    const { data: requestData, error } = await supabase
      .from('jury_requests')
      .select(`
        *,
        training_centers!inner(
          id,
          name,
          contact_person_name,
          contact_person_email,
          user_id
        ),
        users!jury_requests_jury_id_fkey(
          id,
          name,
          email,
          jury_profiles!inner(
            first_name,
            last_name,
            phone
          )
        )
      `)
      .eq('id', requestId)
      .single();

    if (error || !requestData) {
      console.error('Jury request not found for ID:', requestId, error);
      return { success: false, error: 'Jury request not found' };
    }

    // Get center user data
    const { data: centerUserData, error: centerUserError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('id', requestData.training_centers.user_id)
      .single();

    if (centerUserError || !centerUserData) {
      console.error('Center user not found:', centerUserError);
      return { success: false, error: 'Center user not found' };
    }

    // Prepare session data
    const sessionData = {
      certificationType: requestData.certification_title,
      sessionDate: requestData.session_date,
      sessionAddress: requestData.session_location || 'Visioconférence',
      candidateCount: requestData.candidate_count,
      modality: requestData.modality,
      rncp: requestData.certification_code
    };

    // Send rating invitation emails using EmailService
    const emailResult = await EmailService.sendRatingInvitationEmails(
      centerUserData.email,
      requestData.training_centers.name,
      requestData.training_centers.contact_person_name || centerUserData.name,
      requestData.users.email,
      requestData.users.jury_profiles[0]?.first_name || requestData.users.name.split(' ')[0],
      requestData.users.jury_profiles[0]?.last_name || requestData.users.name.split(' ')[1] || '',
      sessionData
    );

    console.log('Rating invitation emails sent:', emailResult);

    // Check if at least one email was sent successfully
    const centerEmailSuccess = emailResult.centerEmail !== null;
    const juryEmailSuccess = emailResult.juryEmail !== null;
    const overallSuccess = centerEmailSuccess || juryEmailSuccess;
    
    if (overallSuccess) {
      console.log(`Rating invitation emails process completed for request ${requestId}`);
      return { 
        success: true, 
        message: 'Rating invitation emails sent successfully',
        details: {
          centerEmail: centerEmailSuccess,
          juryEmail: juryEmailSuccess,
          errors: emailResult.errors
        }
      };
    } else {
      return { 
        success: false, 
        error: 'Failed to send both rating invitation emails',
        details: {
          errors: emailResult.errors
        }
      };
    }

  } catch (error) {
    console.error('Error in sendRatingInvitationEmails:', error);
    return { 
      success: false, 
      error: 'Internal server error while sending rating invitation emails' 
    };
  }
}

// Helper function to check if a session is eligible for rating invitations
export async function canSendRatingInvitations(requestId: number): Promise<boolean> {
  try {
    const { data: requestData, error } = await supabase
      .from('jury_requests')
      .select('id, status, session_date')
      .eq('id', requestId)
      .single();

    if (error || !requestData) {
      return false;
    }

    // Check if status is 'completed' and session date is in the past
    const sessionDate = new Date(requestData.session_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return requestData.status === 'completed' && sessionDate <= today;
  } catch (error) {
    console.error('Error checking rating invitation eligibility:', error);
    return false;
  }
}
