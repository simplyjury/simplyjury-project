import { NextRequest, NextResponse } from 'next/server';
import { NewsletterService } from '@/lib/services/newsletter-service';
import { getUser } from '@/lib/db/queries';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 'dummy-key-for-build');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source = 'homepage' } = body;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Email invalide.' },
        { status: 400 }
      );
    }

    // Check if user is authenticated
    let userId: number | undefined;
    let userType: 'centre' | 'jury' | 'visitor' = 'visitor';

    try {
      const user = await getUser();
      if (user) {
        userId = user.id;
        userType = user.userType as 'centre' | 'jury';
      }
    } catch (error) {
      // User not authenticated, continue as visitor
    }

    // Subscribe to newsletter
    const result = await NewsletterService.subscribe({
      email,
      userId,
      source,
      userType,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    // Send confirmation email
    if (result.subscription) {
      const confirmUrl = `${process.env.NEXT_PUBLIC_APP_URL}/newsletter/confirm?token=${result.subscription.subscriptionToken}`;
      const fromEmail = `${process.env.FROM_NAME || 'SimplyJury'} <${process.env.FROM_EMAIL || 'onboarding@resend.dev'}>`;
      
      try {
        await resend.emails.send({
          from: fromEmail,
          to: email,
          subject: 'Confirmez votre inscription à la newsletter SimplyJury',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #0d4a70;">Confirmez votre inscription</h2>
              <p>Bonjour,</p>
              <p>Merci de votre intérêt pour <strong>SimplyJury</strong> !</p>
              <p>Pour confirmer votre inscription à notre newsletter, veuillez cliquer sur le bouton ci-dessous :</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmUrl}" style="background-color: #0d4a70; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Confirmer mon inscription
                </a>
              </div>
              <p style="color: #666; font-size: 14px;">Si vous n'avez pas demandé cette inscription, vous pouvez ignorer cet email.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="color: #999; font-size: 12px;">L'équipe SimplyJury</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // Don't fail the subscription if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'inscription.' },
      { status: 500 }
    );
  }
}
