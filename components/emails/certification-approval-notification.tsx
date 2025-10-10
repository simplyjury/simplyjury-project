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

interface CertificationApprovalNotificationProps {
  centerName: string;
  certificationTitle: string;
  certificationCode: string;
  approvalComment?: string;
  dashboardUrl: string;
}

export const CertificationApprovalNotification = ({
  centerName,
  certificationTitle,
  certificationCode,
  approvalComment,
  dashboardUrl,
}: CertificationApprovalNotificationProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        Votre certification {certificationCode} a été approuvée
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>✅ Certification approuvée</Heading>
          
          <Text style={text}>
            Bonjour,
          </Text>
          
          <Text style={text}>
            Nous avons le plaisir de vous informer que votre certification RNCP a été approuvée par notre équipe administrative.
          </Text>

          <Section style={successBox}>
            <Text style={successTitle}>📋 Certification approuvée</Text>
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
              <Text style={commentTitle}>💬 Commentaire de l'administrateur</Text>
              <Text style={commentText}>{approvalComment}</Text>
            </Section>
          )}

          <Text style={text}>
            Cette certification est maintenant visible sur votre profil public et les jurys pourront la consulter lors de leurs recherches.
          </Text>

          <Section style={buttonContainer}>
            <Link href={dashboardUrl} style={button}>
              Voir mon profil
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

export default CertificationApprovalNotification;

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

const successBox = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #86efac',
  borderRadius: '8px',
  margin: '24px 40px',
  padding: '20px',
};

const successTitle = {
  color: '#166534',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const commentBox = {
  backgroundColor: '#f0f7ff',
  border: '1px solid #bfdbfe',
  borderRadius: '8px',
  margin: '24px 40px',
  padding: '20px',
};

const commentTitle = {
  color: '#1e40af',
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
