import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface WaitingListNotificationProps {
  email: string;
  centerName?: string;
  desiredTier: 'basic' | 'pro';
  triggeredBy: string;
  currentContactsUsed?: number;
  dashboardUrl: string;
}

export const WaitingListNotification = ({
  email,
  centerName,
  desiredTier,
  triggeredBy,
  currentContactsUsed,
  dashboardUrl,
}: WaitingListNotificationProps) => {
  const tierName = desiredTier === 'basic' ? 'Basic (5 contacts/mois)' : 'Pro (15 contacts/mois)';
  
  const getTriggerContext = () => {
    switch (triggeredBy) {
      case 'limit_reached':
        return `🚨 L'utilisateur a atteint sa limite de contacts (${currentContactsUsed} contacts utilisés)`;
      case 'pricing_page':
        return '💰 Inscription depuis la page tarifs';
      case 'dashboard_cta':
        return '📊 Inscription depuis le tableau de bord';
      case 'manual':
        return '✍️ Inscription manuelle';
      default:
        return '📝 Nouvelle inscription';
    }
  };

  return (
    <Html>
      <Head />
      <Preview>
        Nouvelle inscription à la liste d'attente - {tierName}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            🎯 Nouvelle inscription à la liste d'attente
          </Heading>
          
          <Text style={text}>
            Bonjour,
          </Text>
          
          <Text style={text}>
            Un utilisateur vient de manifester son intérêt pour un abonnement payant sur SimplyJury.
          </Text>

          <Section style={infoBox}>
            <Text style={infoTitle}>📋 Détails de l'inscription</Text>
            
            <Text style={infoItem}>
              <strong>Email :</strong> {email}
            </Text>
            
            {centerName && (
              <Text style={infoItem}>
                <strong>Centre :</strong> {centerName}
              </Text>
            )}
            
            <Text style={infoItem}>
              <strong>Formule souhaitée :</strong> {tierName}
            </Text>
            
            <Text style={infoItem}>
              <strong>Contexte :</strong> {getTriggerContext()}
            </Text>
            
            {currentContactsUsed !== undefined && (
              <Text style={infoItem}>
                <strong>Contacts utilisés :</strong> {currentContactsUsed}
              </Text>
            )}
          </Section>

          <Section style={urgencyBox}>
            {triggeredBy === 'limit_reached' ? (
              <>
                <Text style={urgencyText}>
                  ⚠️ <strong>Action recommandée :</strong> Cet utilisateur a atteint sa limite de contacts 
                  et est bloqué. Contactez-le rapidement pour convertir son intérêt en abonnement.
                </Text>
              </>
            ) : (
              <Text style={urgencyText}>
                💡 <strong>Opportunité :</strong> Cet utilisateur est intéressé par une formule payante. 
                Contactez-le pour discuter de ses besoins et finaliser l'abonnement.
              </Text>
            )}
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={dashboardUrl}>
              Voir la liste d'attente
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Vous recevez cet email car vous êtes administrateur de SimplyJury.
            <br />
            Connectez-vous à votre tableau de bord pour gérer la liste d'attente.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default WaitingListNotification;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const h1 = {
  color: '#1e3a8a',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 40px',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 40px',
};

const infoBox = {
  backgroundColor: '#f0f9ff',
  border: '1px solid #bae6fd',
  borderRadius: '8px',
  margin: '24px 40px',
  padding: '20px',
};

const infoTitle = {
  color: '#0c4a6e',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
};

const infoItem = {
  color: '#334155',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '8px 0',
};

const urgencyBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fbbf24',
  borderRadius: '8px',
  margin: '24px 40px',
  padding: '16px',
};

const urgencyText = {
  color: '#78350f',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 40px',
};

const button = {
  backgroundColor: '#1e3a8a',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 40px',
};

const footer = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '16px 40px',
  textAlign: 'center' as const,
};
