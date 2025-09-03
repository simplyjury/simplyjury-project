import { Resend } from 'resend';
import { WelcomeEmail } from '@/components/emails/welcome-email';
import { VerificationEmail } from '@/components/emails/verification-email';
import { PasswordResetEmail } from '@/components/emails/password-reset-email';
import { ProfileValidationEmail } from '@/components/emails/profile-validation-email';

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
}
