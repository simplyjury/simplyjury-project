'use server';

import { Resend } from 'resend';
import { CertificationApprovalNotification } from '@/components/emails/certification-approval-notification';
import { CertificationRejectionNotification } from '@/components/emails/certification-rejection-notification';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendCertificationDecisionEmailParams {
  centerName: string;
  centerEmail: string;
  certificationTitle: string;
  certificationCode: string;
  decision: 'approved' | 'rejected';
  approvalComment?: string;
}

export async function sendCertificationDecisionEmail(
  params: SendCertificationDecisionEmailParams
) {
  try {
    const {
      centerName,
      centerEmail,
      certificationTitle,
      certificationCode,
      decision,
      approvalComment,
    } = params;

    // URLs for email links
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/center/certifications`;
    const supportUrl = `${process.env.NEXT_PUBLIC_APP_URL}/contact`;

    // Prepare email content based on decision
    const isApproved = decision === 'approved';
    const subject = isApproved
      ? `✅ Certification approuvée - ${certificationCode}`
      : `❌ Certification non approuvée - ${certificationCode}`;

    const emailComponent = isApproved
      ? CertificationApprovalNotification({
          centerName,
          certificationTitle,
          certificationCode,
          approvalComment,
          dashboardUrl,
        })
      : CertificationRejectionNotification({
          centerName,
          certificationTitle,
          certificationCode,
          approvalComment,
          supportUrl,
        });

    // Send email
    const { data, error } = await resend.emails.send({
      from: 'SimplyJury <notifications@simplyjury.com>',
      to: centerEmail,
      subject,
      react: emailComponent,
    });

    if (error) {
      console.error(`Failed to send certification decision email to ${centerEmail}:`, error);
      return { success: false, error };
    }

    console.log(`Certification ${decision} email sent to ${centerEmail}`);
    return { success: true, data };
  } catch (error) {
    console.error('Error in sendCertificationDecisionEmail:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
