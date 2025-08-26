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

interface WelcomeEmailProps {
  name: string;
  userType: 'centre' | 'jury';
}

export const WelcomeEmail = ({ name, userType }: WelcomeEmailProps) => {
  const userTypeLabel = userType === 'centre' ? 'centre de formation' : 'jury professionnel';
  
  return (
    <Html>
      <Head />
      <Preview>Bienvenue sur SimplyJury - Votre plateforme de mise en relation</Preview>
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
          
          <Heading style={h1}>Bienvenue sur SimplyJury !</Heading>
          
          <Text style={text}>
            Bonjour {name},
          </Text>
          
          <Text style={text}>
            Félicitations ! Votre compte {userTypeLabel} a été créé avec succès sur SimplyJury.
          </Text>
          
          {userType === 'centre' ? (
            <Text style={text}>
              En tant que centre de formation, vous pouvez maintenant :
              <br />• Rechercher des jurys professionnels qualifiés
              <br />• Publier vos besoins de certification
              <br />• Gérer vos demandes et contacts
            </Text>
          ) : (
            <Text style={text}>
              En tant que jury professionnel, vous pouvez maintenant :
              <br />• Compléter votre profil d'expertise
              <br />• Recevoir des propositions de mission
              <br />• Gérer vos disponibilités
            </Text>
          )}
          
          <Section style={buttonContainer}>
            <Link
              style={button}
              href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`}
            >
              Accéder à mon tableau de bord
            </Link>
          </Section>
          
          <Text style={text}>
            Pour toute question, n'hésitez pas à nous contacter à{' '}
            <Link href="mailto:support@simplyjury.com" style={link}>
              support@simplyjury.com
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
  backgroundColor: '#5469d4',
  borderRadius: '4px',
  color: '#fff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: '15px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '210px',
  padding: '14px 7px',
  margin: '0 auto',
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
