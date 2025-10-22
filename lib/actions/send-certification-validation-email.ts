'use server';

import { Resend } from 'resend';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { CertificationValidationRequest } from '@/components/emails/certification-validation-request';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = `${process.env.FROM_NAME || 'SimplyJury'} <${process.env.FROM_EMAIL || 'onboarding@resend.dev'}>`;

interface SendCertificationValidationEmailParams {
  centerName: string;
  certificationTitle: string;
  certificationCode: string;
  centerSiret: string;
  certificateurName: string;
  certificateurSiret: string;
  resubmissionComment?: string;
}

export async function sendCertificationValidationEmail(
  params: SendCertificationValidationEmailParams
) {
  try {
    // Get all admin users
    const adminUsers = await db
      .select({
        email: users.email,
        name: users.name,
      })
      .from(users)
      .where(eq(users.userType, 'admin'));

    if (adminUsers.length === 0) {
      console.warn('No admin users found to send certification validation email');
      return { success: false, error: 'No admin users found' };
    }

    // Validation URL pointing to admin validation page
    const validationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/admin/validation-profils`;

    // Send email to all admin users
    const emailPromises = adminUsers.map(async (admin) => {
      try {
        const { data, error } = await resend.emails.send({
          from: FROM_EMAIL,
          to: admin.email,
          subject: params.resubmissionComment 
            ? `🔄 Redemande de validation - ${params.centerName}`
            : `🔔 Nouvelle certification à valider - ${params.centerName}`,
          react: CertificationValidationRequest({
            centerName: params.centerName,
            certificationTitle: params.certificationTitle,
            certificationCode: params.certificationCode,
            centerSiret: params.centerSiret,
            certificateurName: params.certificateurName,
            certificateurSiret: params.certificateurSiret,
            validationUrl,
            resubmissionComment: params.resubmissionComment,
          }),
        });

        if (error) {
          console.error(`Failed to send email to ${admin.email}:`, error);
          return { success: false, email: admin.email, error };
        }

        console.log(`Certification validation email sent to ${admin.email}`);
        return { success: true, email: admin.email, data };
      } catch (error) {
        console.error(`Error sending email to ${admin.email}:`, error);
        return { success: false, email: admin.email, error };
      }
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter((r) => r.success).length;

    console.log(
      `Certification validation emails sent: ${successCount}/${adminUsers.length}`
    );

    return {
      success: successCount > 0,
      totalAdmins: adminUsers.length,
      successCount,
      results,
    };
  } catch (error) {
    console.error('Error in sendCertificationValidationEmail:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
