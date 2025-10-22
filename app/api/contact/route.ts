import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { ContactFormNotification } from '@/components/emails/contact-form-notification';

const resend = new Resend(process.env.RESEND_API_KEY || 'dummy-key-for-build');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { centerName, contactName, email, phone, subject, message } = body;

    // Validation
    if (!centerName || !contactName || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Adresse email invalide' },
        { status: 400 }
      );
    }

    // Check API key
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'dummy-key-for-build') {
      console.error('RESEND_API_KEY is not configured');
      return NextResponse.json(
        { error: 'Service email non configuré' },
        { status: 500 }
      );
    }

    // Check FROM_EMAIL
    if (!process.env.FROM_EMAIL) {
      console.error('FROM_EMAIL is not configured');
      return NextResponse.json(
        { error: 'Service email non configuré' },
        { status: 500 }
      );
    }

    const fromEmail = `${process.env.FROM_NAME || 'SimplyJury'} <${process.env.FROM_EMAIL}>`;
    const adminEmail = process.env.FROM_EMAIL; // Send to the same email configured in FROM_EMAIL

    // Send email to admin
    const result = await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `[Contact] ${subject}`,
      react: ContactFormNotification({
        centerName,
        contactName,
        email,
        phone,
        subject,
        message,
      }),
      // Add reply-to so admin can reply directly to the sender
      replyTo: email,
    });

    console.log('Contact form email sent successfully:', result);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Message envoyé avec succès'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'envoi du message' },
      { status: 500 }
    );
  }
}
