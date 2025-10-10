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

interface CertificationValidationRequestProps {
  centerName: string;
  certificationTitle: string;
  certificationCode: string;
  centerSiret: string;
  certificateurName: string;
  certificateurSiret: string;
  validationUrl: string;
}

export const CertificationValidationRequest = ({
  centerName,
  certificationTitle,
  certificationCode,
  centerSiret,
  certificateurName,
  certificateurSiret,
  validationUrl,
}: CertificationValidationRequestProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        Nouvelle certification à valider - {centerName}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🔔 Nouvelle certification à valider</Heading>
          
          <Text style={text}>
            Bonjour,
          </Text>
          
          <Text style={text}>
            Un centre de formation a ajouté une certification RNCP à son profil qui nécessite une validation administrative.
          </Text>

          <Section style={infoBox}>
            <Text style={infoTitle}>📋 Informations du centre</Text>
            <Text style={infoText}>
              <strong>Centre :</strong> {centerName}
            </Text>
            <Text style={infoText}>
              <strong>SIRET du centre :</strong> {centerSiret}
            </Text>
          </Section>

          <Section style={warningBox}>
            <Text style={warningTitle}>⚠️ Certification ajoutée</Text>
            <Text style={infoText}>
              <strong>Certification :</strong> {certificationTitle}
            </Text>
            <Text style={infoText}>
              <strong>Code RNCP :</strong> {certificationCode}
            </Text>
            <Text style={infoText}>
              <strong>Certificateur :</strong> {certificateurName}
            </Text>
            <Text style={infoText}>
              <strong>SIRET du certificateur :</strong> {certificateurSiret}
            </Text>
          </Section>

          <Section style={alertBox}>
            <Text style={alertText}>
              ⚠️ <strong>Attention :</strong> Le SIRET du centre ne correspond pas au SIRET du certificateur enregistré auprès de France Compétences.
            </Text>
            <Text style={alertText}>
              Cette certification nécessite une validation manuelle avant d'être visible sur le profil du centre.
            </Text>
          </Section>

          <Section style={buttonContainer}>
            <Link href={validationUrl} style={button}>
              Valider la certification
            </Link>
          </Section>

          <Text style={footer}>
            Vous recevez cet email car vous êtes administrateur de la plateforme SimplyJury.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default CertificationValidationRequest;

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

const infoBox = {
  backgroundColor: '#f0f7ff',
  border: '1px solid #bfdbfe',
  borderRadius: '8px',
  margin: '24px 40px',
  padding: '20px',
};

const warningBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fcd34d',
  borderRadius: '8px',
  margin: '24px 40px',
  padding: '20px',
};

const alertBox = {
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '8px',
  margin: '24px 40px',
  padding: '20px',
};

const infoTitle = {
  color: '#1e40af',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const warningTitle = {
  color: '#92400e',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const infoText = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '8px 0',
};

const alertText = {
  color: '#991b1b',
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
