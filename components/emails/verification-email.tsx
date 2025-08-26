import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface VerificationEmailProps {
  name: string;
  verificationUrl: string;
  isResend?: boolean;
}

export const VerificationEmail = ({ name, verificationUrl, isResend = false }: VerificationEmailProps) => {
  const subject = isResend ? 'Nouveau lien de vérification' : 'Vérifiez votre adresse email';
  
  return (
    <Html>
      <Head />
      <Preview>{subject} - SimplyJury</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src="https://vbnnjwgfbadvqavqnlhh.supabase.co/storage/v1/object/public/simplyjury-assets/logos/simplyjury-logo.png"
              width="200"
              alt="SimplyJury"
              style={logo}
            />
          </Section>
          
          <Heading style={h1}>
            {isResend ? 'Nouveau lien de vérification' : 'Vérifiez votre adresse email'}
          </Heading>
          
          <Text style={text}>
            Bonjour {name},
          </Text>
          
          <Text style={text}>
            {isResend 
              ? 'Voici votre nouveau lien de vérification d\'email pour SimplyJury.'
              : 'Merci de vous être inscrit sur SimplyJury ! Pour finaliser votre inscription, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous.'
            }
          </Text>
          
          <Section style={buttonContainer}>
            <Link
              style={button}
              href={verificationUrl}
            >
              Vérifier mon email
            </Link>
          </Section>
          
          <Text style={text}>
            Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :
          </Text>
          
          <Text style={linkText}>
            {verificationUrl}
          </Text>
          
          <Text style={text}>
            <strong>Important :</strong> Ce lien de vérification expirera dans 24 heures pour des raisons de sécurité.
          </Text>
          
          <Text style={text}>
            Si vous n'avez pas créé de compte sur SimplyJury, vous pouvez ignorer cet email.
          </Text>
          
          <Text style={footer}>
            L'équipe SimplyJury
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#edf6f9',
  fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(13, 74, 112, 0.1)',
};

const logoContainer = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const logo = {
  margin: '0 auto',
};

const h1 = {
  color: '#0d4a70',
  fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '32px 0',
  padding: '0',
  textAlign: 'center' as const,
  lineHeight: '1.3',
};

const text = {
  color: '#0d4a70',
  fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  fontSize: '16px',
  margin: '20px 0',
  padding: '0 40px',
  lineHeight: '1.6',
};

const buttonContainer = {
  padding: '27px 0 27px',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#0d4a70',
  borderRadius: '12px',
  color: '#ffffff',
  fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '240px',
  padding: '16px 24px',
  margin: '0 auto',
  transition: 'background-color 0.3s ease',
};

const linkText = {
  color: '#0d4a70',
  fontFamily: '"Plus Jakarta Sans", monospace',
  fontSize: '13px',
  margin: '16px 40px',
  padding: '12px 16px',
  wordBreak: 'break-all' as const,
  backgroundColor: '#edf6f9',
  borderRadius: '6px',
};

const footer = {
  color: '#0d4a70',
  fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  fontSize: '14px',
  fontWeight: '600',
  margin: '32px 0 0 0',
  padding: '0 40px',
  textAlign: 'center' as const,
};
