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

interface PasswordResetEmailProps {
  name: string;
  resetUrl: string;
}

export const PasswordResetEmail = ({ name, resetUrl }: PasswordResetEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Réinitialisation de votre mot de passe - SimplyJury</Preview>
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
          
          <Heading style={h1}>Réinitialisation de mot de passe</Heading>
          
          <Text style={text}>
            Bonjour {name},
          </Text>
          
          <Text style={text}>
            Vous avez demandé la réinitialisation de votre mot de passe SimplyJury. 
            Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
          </Text>
          
          <Section style={buttonContainer}>
            <Link
              style={button}
              href={resetUrl}
            >
              Réinitialiser mon mot de passe
            </Link>
          </Section>
          
          <Text style={text}>
            Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :
          </Text>
          
          <Text style={linkText}>
            {resetUrl}
          </Text>
          
          <Text style={text}>
            <strong>Important :</strong> Ce lien de réinitialisation expirera dans 24 heures pour des raisons de sécurité.
          </Text>
          
          <Text style={text}>
            Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email. 
            Votre mot de passe actuel restera inchangé.
          </Text>
          
          <Text style={text}>
            Pour toute question concernant la sécurité de votre compte, contactez-nous à{' '}
            <Link href="mailto:security@simplyjury.com" style={link}>
              security@simplyjury.com
            </Link>
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

const link = {
  color: '#5469d4',
  textDecoration: 'underline',
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
