'use server';

import { createClient } from '@supabase/supabase-js';
import { EmailService } from '@/lib/email/resend-service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function sendJuryRequestResponseEmails(
  requestId: number,
  status: 'accepted' | 'rejected'
) {
  try {
    console.log(`Starting email notification process for request ${requestId} with status: ${status}`);

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

    // Prepare jury contact information
    const juryFullName = `${requestData.users.jury_profiles[0].first_name} ${requestData.users.jury_profiles[0].last_name}`;
    const juryPhone = requestData.users.jury_profiles[0].phone || 'Non renseigné';

    // Prepare request data for email templates
    const emailRequestData = {
      certificationType: requestData.certification_title || 'Non spécifiée',
      sessionDate: requestData.session_date,
      sessionAddress: requestData.session_location || 'Non spécifiée',
      candidateCount: requestData.candidate_count || 0,
      modality: requestData.modality || 'presentiel',
      rncp: requestData.certification_code || undefined,
    };

    console.log(`Sending emails to center: ${centerUserData.email} and jury: ${requestData.users.email}`);

    // Send emails using the EmailService
    const emailResults = await EmailService.sendJuryRequestResponseEmails(
      centerUserData.email,
      requestData.training_centers.name,
      centerUserData.name || 'Responsable',
      requestData.users.email,
      juryFullName,
      juryPhone,
      emailRequestData,
      status
    );

    // Check for any email errors
    if (emailResults.errors.length > 0) {
      console.warn('Some emails failed to send:', emailResults.errors);
      return {
        success: true,
        message: 'Emails sent with some warnings',
        details: {
          centerEmailSent: !!emailResults.centerEmail,
          juryEmailSent: !!emailResults.juryEmail,
          errors: emailResults.errors,
          requestId,
          status,
          juryName: juryFullName,
          centerName: requestData.training_centers.name,
        }
      };
    }

    console.log('All emails sent successfully');
    return {
      success: true,
      message: 'Notification emails sent successfully',
      details: {
        centerEmailSent: !!emailResults.centerEmail,
        juryEmailSent: !!emailResults.juryEmail,
        requestId,
        status,
        juryName: juryFullName,
        centerName: requestData.training_centers.name,
      }
    };

  } catch (error) {
    console.error('Error in sendJuryRequestResponseEmails:', error);
    return {
      success: false,
      error: 'Failed to send notification emails',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
