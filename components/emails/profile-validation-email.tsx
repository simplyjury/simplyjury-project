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

interface ProfileValidationEmailProps {
  name: string;
  status: 'approved' | 'rejected';
  comment?: string;
}

export const ProfileValidationEmail = ({ name, status, comment }: ProfileValidationEmailProps) => {
  const isApproved = status === 'approved';
  const subject = isApproved 
    ? 'Votre profil a été validé !' 
    : 'Votre profil nécessite des modifications';
  
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
          
          <Heading style={h1}>{subject}</Heading>
          
          <Text style={text}>
            Bonjour {name},
          </Text>
          
          {isApproved ? (
            <>
              <Text style={text}>
                Excellente nouvelle ! Votre profil SimplyJury a été validé par notre équipe.
              </Text>
              
              <Text style={text}>
                Vous pouvez maintenant accéder à toutes les fonctionnalités de la plateforme :
                <br />• Rechercher et contacter des partenaires
                <br />• Recevoir des demandes de collaboration
                <br />• Gérer vos missions et disponibilités
              </Text>
              
              <Section style={buttonContainer}>
                <Link
                  style={approvedButton}
                  href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`}
                >
                  Accéder à mon tableau de bord
                </Link>
              </Section>
            </>
          ) : (
            <>
              <Text style={text}>
                Votre profil SimplyJury a été examiné par notre équipe. 
                Quelques modifications sont nécessaires avant validation.
              </Text>
              
              {comment && (
                <>
                  <Text style={text}>
                    <strong>Commentaires de l'équipe :</strong>
                  </Text>
                  <Text style={commentText}>
                    {comment}
                  </Text>
                </>
              )}
              
              <Text style={text}>
                Veuillez apporter les corrections demandées et soumettre à nouveau votre profil.
              </Text>
              
              <Section style={buttonContainer}>
                <Link
                  style={rejectedButton}
                  href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/profile`}
                >
                  Modifier mon profil
                </Link>
              </Section>
            </>
          )}
          
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

const commentText = {
  color: '#0d4a70',
  fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  fontSize: '15px',
  margin: '16px 40px',
  padding: '20px',
  backgroundColor: '#fff2bf',
  borderLeft: '4px solid #fdce0f',
  borderRadius: '8px',
  lineHeight: '1.5',
};

const buttonContainer = {
  padding: '27px 0 27px',
  textAlign: 'center' as const,
};

const approvedButton = {
  backgroundColor: '#22c55e',
  borderRadius: '4px',
  color: '#fff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  fontSize: '15px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '250px',
  padding: '14px 7px',
  margin: '0 auto',
};

const rejectedButton = {
  backgroundColor: '#13d090',
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
