import { Resend } from 'resend';
import { WelcomeEmail } from '@/components/emails/welcome-email';
import { VerificationEmail } from '@/components/emails/verification-email';
import { PasswordResetEmail } from '@/components/emails/password-reset-email';
import { ProfileValidationEmail } from '@/components/emails/profile-validation-email';
import { JuryValidationRequest } from '@/components/emails/jury-validation-request';
import { JuryProfileValidationEmail } from '@/components/emails/jury-profile-validation-email';
import { JuryRequestResponseCenter } from '@/components/emails/jury-request-response-center';
import { JuryRequestResponseJury } from '@/components/emails/jury-request-response-jury';
import { CenterRatingInvitation } from '@/components/emails/center-rating-invitation';
import { JuryRatingInvitation } from '@/components/emails/jury-rating-invitation';

const resend = new Resend(process.env.RESEND_API_KEY || 'dummy-key-for-build');

export class EmailService {
  private static FROM_EMAIL = `${process.env.FROM_NAME || 'SimplyJury'} <${process.env.FROM_EMAIL || 'onboarding@resend.dev'}>`;
  
  private static checkApiKey(): void {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'dummy-key-for-build') {
      throw new Error('RESEND_API_KEY environment variable is not configured');
    }
  }
  
  static async sendWelcomeEmail(email: string, name: string, userType: 'centre' | 'jury') {
    try {
      this.checkApiKey();
      return await resend.emails.send({
        from: this.FROM_EMAIL,
        to: email,
        subject: 'Bienvenue sur SimplyJury !',
        react: WelcomeEmail({ name, userType }),
      });
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw new Error('Failed to send welcome email');
    }
  }
  
  static async sendVerificationEmail(email: string, name: string, token: string) {
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
    
    try {
      this.checkApiKey();
      return await resend.emails.send({
        from: this.FROM_EMAIL,
        to: email,
        subject: 'Vérifiez votre adresse email - SimplyJury',
        react: VerificationEmail({ name, verificationUrl }),
      });
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }
  
  static async sendPasswordResetEmail(email: string, name: string, token: string) {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
    
    try {
      console.log('EmailService: Checking API key...');
      this.checkApiKey();
      
      console.log('EmailService: Preparing email data...');
      console.log(`- To: ${email}`);
      console.log(`- From: ${this.FROM_EMAIL}`);
      console.log(`- Reset URL: ${resetUrl}`);
      
      const emailData = {
        from: this.FROM_EMAIL,
        to: email,
        subject: 'Réinitialisation de votre mot de passe - SimplyJury',
        react: PasswordResetEmail({ name, resetUrl }),
      };
      
      console.log('EmailService: Sending email via Resend...');
      const result = await resend.emails.send(emailData);
      console.log('EmailService: Email sent successfully:', result);
      
      return result;
    } catch (error) {
      console.error('EmailService: Error sending password reset email:', error);
      console.error('EmailService: Error details:', JSON.stringify(error, null, 2));
      throw new Error('Failed to send password reset email');
    }
  }
  
  static async sendProfileValidationEmail(
    email: string, 
    name: string, 
    status: 'approved' | 'rejected',
    comment?: string
  ) {
    const subject = status === 'approved' 
      ? 'Votre profil a été validé ! - SimplyJury'
      : 'Votre profil nécessite des modifications - SimplyJury';
      
    try {
      this.checkApiKey();
      return await resend.emails.send({
        from: this.FROM_EMAIL,
        to: email,
        subject,
        react: ProfileValidationEmail({ name, status, comment }),
      });
    } catch (error) {
      console.error('Error sending profile validation email:', error);
      throw new Error('Failed to send profile validation email');
    }
  }

  static async sendResendVerificationEmail(email: string, name: string, token: string) {
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
    
    try {
      this.checkApiKey();
      return await resend.emails.send({
        from: this.FROM_EMAIL,
        to: email,
        subject: 'Nouveau lien de vérification - SimplyJury',
        react: VerificationEmail({ name, verificationUrl, isResend: true }),
      });
    } catch (error) {
      console.error('Error sending resend verification email:', error);
      throw new Error('Failed to send resend verification email');
    }
  }

  static async sendJuryValidationRequest(
    validatorEmail: string,
    validatorName: string,
    juryData: {
      firstName: string;
      lastName: string;
      region: string;
      city?: string;
      hourlyRate?: number;
      profilePhotoUrl?: string;
      expertiseDomains?: string[];
    }
  ) {
    const subject = `Nouveau profil jury à valider - ${juryData.firstName} ${juryData.lastName}`;
    
    try {
      this.checkApiKey();
      return await resend.emails.send({
        from: this.FROM_EMAIL,
        to: validatorEmail,
        subject,
        react: JuryValidationRequest({
          validatorName,
          juryFirstName: juryData.firstName,
          juryLastName: juryData.lastName,
          juryRegion: juryData.region,
          juryCity: juryData.city,
          juryHourlyRate: juryData.hourlyRate,
          juryProfilePhotoUrl: juryData.profilePhotoUrl,
          juryExpertiseDomains: juryData.expertiseDomains,
        }),
      });
    } catch (error) {
      console.error('Error sending jury validation request email:', error);
      throw new Error('Failed to send jury validation request email');
    }
  }

  static async sendJuryProfileValidationEmail(
    email: string, 
    juryName: string, 
    status: 'validated' | 'rejected',
    comment?: string
  ) {
    const subject = status === 'validated' 
      ? 'Félicitations ! Votre profil jury a été validé - SimplyJury'
      : 'Votre profil jury nécessite des modifications - SimplyJury';
      
    try {
      this.checkApiKey();
      return await resend.emails.send({
        from: this.FROM_EMAIL,
        to: email,
        subject,
        react: JuryProfileValidationEmail({ juryName, status, comment }),
      });
    } catch (error) {
      console.error('Error sending jury profile validation email:', error);
      throw new Error('Failed to send jury profile validation email');
    }
  }

  static async sendJuryRequestResponseEmails(
    centerEmail: string,
    centerName: string,
    contactPersonName: string,
    juryEmail: string,
    juryName: string,
    juryPhone: string,
    requestData: {
      certificationType: string;
      sessionDate: string;
      sessionAddress: string;
      candidateCount: number;
      modality: string;
      rncp?: string;
    },
    status: 'accepted' | 'declined'
  ) {
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;
    const isAccepted = status === 'accepted';
    
    try {
      this.checkApiKey();
      
      // Send email to center
      const centerSubject = isAccepted 
        ? `Mission acceptée par ${juryName} - SimplyJury`
        : `Mission refusée par ${juryName} - SimplyJury`;
        
      const centerEmailPromise = resend.emails.send({
        from: this.FROM_EMAIL,
        to: centerEmail,
        subject: centerSubject,
        react: JuryRequestResponseCenter({
          centerName,
          contactPersonName,
          juryFirstName: juryName.split(' ')[0] || juryName,
          juryLastName: juryName.split(' ').slice(1).join(' ') || '',
          juryEmail,
          juryPhone,
          certificationType: requestData.certificationType,
          sessionDate: requestData.sessionDate,
          sessionAddress: requestData.sessionAddress,
          candidateCount: requestData.candidateCount,
          modality: requestData.modality,
          rncp: requestData.rncp,
          status,
          dashboardUrl,
        }),
      });

      // Send confirmation email to jury
      const jurySubject = isAccepted 
        ? 'Mission acceptée - Confirmation - SimplyJury'
        : 'Mission refusée - Confirmation - SimplyJury';
        
      const juryEmailPromise = resend.emails.send({
        from: this.FROM_EMAIL,
        to: juryEmail,
        subject: jurySubject,
        react: JuryRequestResponseJury({
          juryName,
          centerName,
          certificationType: requestData.certificationType,
          sessionDate: requestData.sessionDate,
          sessionAddress: requestData.sessionAddress,
          candidateCount: requestData.candidateCount,
          modality: requestData.modality,
          rncp: requestData.rncp,
          status,
          dashboardUrl,
        }),
      });

      // Send both emails in parallel
      const results = await Promise.allSettled([centerEmailPromise, juryEmailPromise]);
      
      const centerResult = results[0];
      const juryResult = results[1];
      
      return {
        centerEmail: centerResult.status === 'fulfilled' ? centerResult.value : null,
        juryEmail: juryResult.status === 'fulfilled' ? juryResult.value : null,
        errors: [
          ...(centerResult.status === 'rejected' ? [`Center email: ${centerResult.reason}`] : []),
          ...(juryResult.status === 'rejected' ? [`Jury email: ${juryResult.reason}`] : [])
        ]
      };
      
    } catch (error) {
      console.error('Error sending jury request response emails:', error);
      throw new Error('Failed to send jury request response emails');
    }
  }

  static async sendRatingInvitationEmails(
    centerEmail: string,
    centerName: string,
    contactPersonName: string,
    juryEmail: string,
    juryFirstName: string,
    juryLastName: string,
    requestData: {
      certificationType: string;
      sessionDate: string;
      sessionAddress: string;
      candidateCount: number;
      modality: string;
      rncp?: string;
    }
  ) {
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}`;
    
    try {
      this.checkApiKey();
      
      // Send email to center (inviting to rate the jury)
      const centerSubject = `Évaluez votre jury - Session ${requestData.certificationType}`;
        
      const centerEmailPromise = resend.emails.send({
        from: this.FROM_EMAIL,
        to: centerEmail,
        subject: centerSubject,
        react: CenterRatingInvitation({
          centerName,
          contactPersonName,
          juryFirstName,
          juryLastName,
          certificationType: requestData.certificationType,
          sessionDate: requestData.sessionDate,
          sessionAddress: requestData.sessionAddress,
          candidateCount: requestData.candidateCount,
          modality: requestData.modality,
          rncp: requestData.rncp,
          dashboardUrl,
        }),
      });

      // Send email to jury (inviting to rate the center)
      const jurySubject = `Évaluez le centre de formation - Mission ${requestData.certificationType}`;
        
      const juryEmailPromise = resend.emails.send({
        from: this.FROM_EMAIL,
        to: juryEmail,
        subject: jurySubject,
        react: JuryRatingInvitation({
          juryFirstName,
          juryLastName,
          centerName,
          contactPersonName,
          certificationType: requestData.certificationType,
          sessionDate: requestData.sessionDate,
          sessionAddress: requestData.sessionAddress,
          candidateCount: requestData.candidateCount,
          modality: requestData.modality,
          rncp: requestData.rncp,
          dashboardUrl,
        }),
      });

      // Send both emails in parallel
      const results = await Promise.allSettled([centerEmailPromise, juryEmailPromise]);
      
      const centerResult = results[0];
      const juryResult = results[1];
      
      return {
        centerEmail: centerResult.status === 'fulfilled' ? centerResult.value : null,
        juryEmail: juryResult.status === 'fulfilled' ? juryResult.value : null,
        errors: [
          ...(centerResult.status === 'rejected' ? [`Center email: ${centerResult.reason}`] : []),
          ...(juryResult.status === 'rejected' ? [`Jury email: ${juryResult.reason}`] : [])
        ]
      };
      
    } catch (error) {
      console.error('Error sending rating invitation emails:', error);
      throw new Error('Failed to send rating invitation emails');
    }
  }
}
