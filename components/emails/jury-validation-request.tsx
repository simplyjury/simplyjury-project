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
  Row,
  Column,
} from '@react-email/components';
import * as React from 'react';

interface JuryValidationRequestProps {
  validatorName: string;
  juryFirstName: string;
  juryLastName: string;
  juryRegion: string;
  juryCity?: string;
  juryHourlyRate?: number;
  juryProfilePhotoUrl?: string;
  juryExpertiseDomains?: string[];
}

export const JuryValidationRequest = ({
  validatorName,
  juryFirstName,
  juryLastName,
  juryRegion,
  juryCity,
  juryHourlyRate,
  juryProfilePhotoUrl,
  juryExpertiseDomains = []
}: JuryValidationRequestProps) => {
  const subject = `Nouveau profil jury à valider - ${juryFirstName} ${juryLastName}`;
  
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
          
          <Heading style={h1}>Nouveau profil jury à valider</Heading>
          
          <Text style={text}>
            Bonjour {validatorName},
          </Text>
          
          <Text style={text}>
            Un nouveau jury professionnel vient de compléter son profil sur SimplyJury et attend votre validation.
          </Text>

          {/* Jury Profile Card */}
          <Section style={profileCard}>
            <Row>
              <Column style={avatarColumn}>
                {juryProfilePhotoUrl ? (
                  <Img
                    src={juryProfilePhotoUrl}
                    width="80"
                    height="80"
                    alt={`${juryFirstName} ${juryLastName}`}
                    style={profilePhoto}
                  />
                ) : (
                  <div style={avatarPlaceholder}>
                    {juryFirstName.charAt(0)}{juryLastName.charAt(0)}
                  </div>
                )}
              </Column>
              <Column style={profileInfo}>
                <Text style={juryName}>
                  {juryFirstName} {juryLastName}
                </Text>
                <Text style={juryLocation}>
                  📍 {juryCity ? `${juryCity}, ` : ''}{juryRegion}
                </Text>
                {juryHourlyRate && (
                  <Text style={juryRate}>
                    💰 {juryHourlyRate}€/heure
                  </Text>
                )}
              </Column>
            </Row>
            
            {juryExpertiseDomains.length > 0 && (
              <Section style={expertiseSection}>
                <Text style={expertiseTitle}>Domaines d'expertise :</Text>
                <Text style={expertiseList}>
                  {juryExpertiseDomains.join(' • ')}
                </Text>
              </Section>
            )}
          </Section>
          
          <Text style={text}>
            Veuillez examiner ce profil et procéder à sa validation ou demander des modifications si nécessaire.
          </Text>
          
          <Section style={buttonContainer}>
            <Link
              style={validateButton}
              href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/admin/validation-profils`}
            >
              Valider le profil
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

const profileCard = {
  backgroundColor: '#f8fafc',
  border: '2px solid #e2e8f0',
  borderRadius: '16px',
  margin: '32px 40px',
  padding: '24px',
};

const avatarColumn = {
  width: '100px',
  verticalAlign: 'top' as const,
};

const profilePhoto = {
  borderRadius: '50%',
  objectFit: 'cover' as const,
};

const avatarPlaceholder = {
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  backgroundColor: '#bea1e5',
  color: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '24px',
  fontWeight: 'bold',
  fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const profileInfo = {
  verticalAlign: 'top' as const,
  paddingLeft: '20px',
};

const juryName = {
  color: '#0d4a70',
  fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
  lineHeight: '1.2',
};

const juryLocation = {
  color: '#64748b',
  fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  fontSize: '14px',
  margin: '4px 0',
  lineHeight: '1.4',
};

const juryRate = {
  color: '#059669',
  fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  fontSize: '14px',
  fontWeight: '600',
  margin: '4px 0',
  lineHeight: '1.4',
};

const expertiseSection = {
  marginTop: '20px',
  paddingTop: '20px',
  borderTop: '1px solid #e2e8f0',
};

const expertiseTitle = {
  color: '#0d4a70',
  fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 8px 0',
};

const expertiseList = {
  color: '#64748b',
  fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  fontSize: '14px',
  margin: '0',
  lineHeight: '1.5',
};

const buttonContainer = {
  padding: '32px 0',
  textAlign: 'center' as const,
};

const validateButton = {
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
};

const link = {
  color: '#5469d4',
  textDecoration: 'underline',
};

const footer = {
  color: '#0d4a70',
  fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segue UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  fontSize: '14px',
  fontWeight: '600',
  margin: '32px 0 0 0',
  padding: '0 40px',
  textAlign: 'center' as const,
};
