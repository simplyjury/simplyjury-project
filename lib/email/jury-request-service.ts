import { Resend } from 'resend';
import { render } from '@react-email/render';
import { JuryRequestNotification } from '@/components/emails/jury-request-notification';
import { CenterRequestConfirmation } from '@/components/emails/center-request-confirmation';

const resend = new Resend(process.env.RESEND_API_KEY);

interface JuryRequestEmailData {
  // Jury data
  juryId: number;
  juryEmail: string;
  juryFirstName: string;
  juryLastName: string;
  
  // Center data
  centerName: string;
  centerEmail: string;
  centerCcEmail?: string; // Add optional CC email
  contactPersonName: string;
  
  // Request data
  certificationType: string;
  sessionDate: string;
  candidateCount: number;
  modality: 'presentiel' | 'visio' | 'hybride';
  
  // URLs
  juryLoginUrl?: string;
  centerDashboardUrl?: string;
}

export class JuryRequestEmailService {
  private static readonly FROM_EMAIL = process.env.FROM_EMAIL || 'SimplyJury <onboarding@resend.dev>';
  private static readonly REPLY_TO = process.env.FROM_EMAIL || 'onboarding@resend.dev';

  /**
   * Send notification email to jury about new request
   */
  static async sendJuryNotification(data: JuryRequestEmailData): Promise<boolean> {
    try {
      const juryName = `${data.juryFirstName} ${data.juryLastName}`;
      const loginUrl = data.juryLoginUrl || `${process.env.NEXT_PUBLIC_APP_URL}/sign-in`;

      const emailHtml = await render(JuryRequestNotification({
        juryName,
        centerName: data.centerName,
        certificationType: data.certificationType,
        sessionDate: data.sessionDate,
        loginUrl
      }));

      const result = await resend.emails.send({
        from: this.FROM_EMAIL,
        to: data.juryEmail,
        replyTo: this.REPLY_TO,
        subject: `Nouvelle demande de jury - ${data.certificationType}`,
        html: emailHtml,
        tags: [
          { name: 'type', value: 'jury-notification' },
          { name: 'jury_id', value: data.juryId.toString() },
          { name: 'certification', value: data.certificationType.replace(/[^a-zA-Z0-9_-]/g, '_') }
        ]
      });

      if (result.error) {
        console.error('Error sending jury notification email:', result.error);
        return false;
      }

      console.log('Jury notification email sent successfully:', result.data?.id);
      return true;

    } catch (error) {
      console.error('Failed to send jury notification email:', error);
      return false;
    }
  }

  /**
   * Send confirmation email to center about sent request
   */
  static async sendCenterConfirmation(data: JuryRequestEmailData): Promise<boolean> {
    try {
      const dashboardUrl = data.centerDashboardUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;

      const emailHtml = await render(CenterRequestConfirmation({
        centerName: data.centerName,
        contactPersonName: data.contactPersonName,
        juryFirstName: data.juryFirstName,
        juryLastName: data.juryLastName,
        certificationType: data.certificationType,
        sessionDate: data.sessionDate,
        candidateCount: data.candidateCount,
        modality: data.modality,
        dashboardUrl
      }));

      const emailConfig: any = {
        from: this.FROM_EMAIL,
        to: data.centerEmail,
        replyTo: this.REPLY_TO,
        subject: `Confirmation d'envoi - Demande de jury pour ${data.certificationType}`,
        html: emailHtml,
        tags: [
          { name: 'type', value: 'center-confirmation' },
          { name: 'center', value: data.centerName.replace(/[^a-zA-Z0-9_-]/g, '_') },
          { name: 'certification', value: data.certificationType.replace(/[^a-zA-Z0-9_-]/g, '_') }
        ]
      };

      // Add CC if provided and different from main recipient
      if (data.centerCcEmail && data.centerCcEmail !== data.centerEmail) {
        emailConfig.cc = data.centerCcEmail;
      }

      const result = await resend.emails.send(emailConfig);

      if (result.error) {
        console.error('Error sending center confirmation email:', result.error);
        return false;
      }

      console.log('Center confirmation email sent successfully:', result.data?.id);
      return true;

    } catch (error) {
      console.error('Failed to send center confirmation email:', error);
      return false;
    }
  }

  /**
   * Send both emails (jury notification + center confirmation)
   */
  static async sendBothEmails(data: JuryRequestEmailData): Promise<{ jurySuccess: boolean; centerSuccess: boolean }> {
    const [jurySuccess, centerSuccess] = await Promise.all([
      this.sendJuryNotification(data),
      this.sendCenterConfirmation(data)
    ]);

    return {
      jurySuccess,
      centerSuccess
    };
  }

  /**
   * Validate email data before sending
   */
  static validateEmailData(data: Partial<JuryRequestEmailData>): data is JuryRequestEmailData {
    const requiredFields: (keyof JuryRequestEmailData)[] = [
      'juryId', 'juryEmail', 'juryFirstName', 'juryLastName',
      'centerName', 'centerEmail', 'contactPersonName',
      'certificationType', 'sessionDate', 'candidateCount', 'modality'
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        console.error(`Missing required field for email: ${field}`);
        return false;
      }
    }

    // Validate email formats
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.juryEmail!)) {
      console.error('Invalid jury email format:', data.juryEmail);
      return false;
    }

    if (!emailRegex.test(data.centerEmail!)) {
      console.error('Invalid center email format:', data.centerEmail);
      return false;
    }

    return true;
  }
}
