import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface CertificationRejectionNotificationProps {
  centerName: string;
  certificationTitle: string;
  certificationCode: string;
  approvalComment?: string;
  supportUrl: string;
}

export const CertificationRejectionNotification = ({
  centerName,
  certificationTitle,
  certificationCode,
  approvalComment,
  supportUrl,
}: CertificationRejectionNotificationProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        Votre certification {certificationCode} n'a pas été approuvée
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>❌ Certification non approuvée</Heading>
          
          <Text style={text}>
            Bonjour,
          </Text>
          
          <Text style={text}>
            Nous vous informons que votre demande d'ajout de certification RNCP n'a pas pu être approuvée par notre équipe administrative.
          </Text>

          <Section style={rejectionBox}>
            <Text style={rejectionTitle}>📋 Certification concernée</Text>
            <Text style={infoText}>
              <strong>Certification :</strong> {certificationTitle}
            </Text>
            <Text style={infoText}>
              <strong>Code RNCP :</strong> {certificationCode}
            </Text>
            <Text style={infoText}>
              <strong>Centre :</strong> {centerName}
            </Text>
          </Section>

          {approvalComment && (
            <Section style={commentBox}>
              <Text style={commentTitle}>💬 Raison du refus</Text>
              <Text style={commentText}>{approvalComment}</Text>
            </Section>
          )}

          <Section style={alertBox}>
            <Text style={alertText}>
              <strong>Que faire maintenant ?</strong>
            </Text>
            <Text style={alertText}>
              Si vous pensez qu'il s'agit d'une erreur ou si vous disposez de documents justificatifs supplémentaires (convention de partenariat, habilitation, etc.), n'hésitez pas à contacter notre support.
            </Text>
          </Section>

          <Section style={buttonContainer}>
            <Link href={supportUrl} style={button}>
              Contacter le support
            </Link>
          </Section>

          <Text style={footer}>
            Vous recevez cet email car vous avez ajouté une certification à votre profil SimplyJury.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default CertificationRejectionNotification;

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
  color: '#0d4a70',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 40px',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
  padding: '0 40px',
};

const rejectionBox = {
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '8px',
  margin: '24px 40px',
  padding: '20px',
};

const rejectionTitle = {
  color: '#991b1b',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const commentBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fcd34d',
  borderRadius: '8px',
  margin: '24px 40px',
  padding: '20px',
};

const commentTitle = {
  color: '#92400e',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const commentText = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '8px 0',
  fontStyle: 'italic',
};

const alertBox = {
  backgroundColor: '#eff6ff',
  border: '1px solid #93c5fd',
  borderRadius: '8px',
  margin: '24px 40px',
  padding: '20px',
};

const alertText = {
  color: '#1e40af',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '8px 0',
};

const infoText = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '8px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 40px',
};

const button = {
  backgroundColor: '#13d090',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '24px 0',
  padding: '0 40px',
  textAlign: 'center' as const,
};
