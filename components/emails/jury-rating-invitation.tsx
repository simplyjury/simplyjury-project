import React from 'react';

interface JuryRatingInvitationProps {
  juryFirstName: string;
  juryLastName: string;
  centerName: string;
  contactPersonName: string;
  certificationType: string;
  sessionDate: string;
  sessionAddress: string;
  candidateCount: number;
  modality: string;
  rncp?: string;
  dashboardUrl: string;
}

export function JuryRatingInvitation({
  juryFirstName,
  juryLastName,
  centerName,
  contactPersonName,
  certificationType,
  sessionDate,
  sessionAddress,
  candidateCount,
  modality,
  rncp,
  dashboardUrl
}: JuryRatingInvitationProps) {
  const formattedDate = new Date(sessionDate).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const modalityText = {
    'presentiel': 'Présentiel',
    'visio': 'Visioconférence',
    'hybride': 'Hybride'
  }[modality] || modality;

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#13d090',
        color: 'white',
        padding: '24px',
        textAlign: 'center'
      }}>
        <h1 style={{
          margin: '0',
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          Évaluez le centre de formation
        </h1>
        <p style={{
          margin: '8px 0 0 0',
          fontSize: '16px',
          opacity: '0.9'
        }}>
          Votre mission de jury est terminée
        </p>
      </div>

      {/* Content */}
      <div style={{ padding: '24px' }}>
        <p style={{
          fontSize: '16px',
          lineHeight: '1.5',
          color: '#374151',
          margin: '0 0 16px 0'
        }}>
          Bonjour {juryFirstName},
        </p>

        <p style={{
          fontSize: '16px',
          lineHeight: '1.5',
          color: '#374151',
          margin: '0 0 24px 0'
        }}>
          Votre mission de jury s'est achevée avec succès. Nous espérons que tout s'est bien déroulé avec le centre de formation.
        </p>

        {/* Session Details Card */}
        <div style={{
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '20px',
          margin: '0 0 24px 0'
        }}>
          <h3 style={{
            margin: '0 0 16px 0',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#0d4a70'
          }}>
            Détails de la mission
          </h3>
          
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#374151' }}>Certification :</strong>
            <span style={{ marginLeft: '8px', color: '#6b7280' }}>
              {certificationType} {rncp && `(${rncp})`}
            </span>
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#374151' }}>Date :</strong>
            <span style={{ marginLeft: '8px', color: '#6b7280' }}>{formattedDate}</span>
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#374151' }}>Centre :</strong>
            <span style={{ marginLeft: '8px', color: '#6b7280' }}>{centerName}</span>
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#374151' }}>Contact :</strong>
            <span style={{ marginLeft: '8px', color: '#6b7280' }}>{contactPersonName}</span>
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#374151' }}>Modalité :</strong>
            <span style={{ marginLeft: '8px', color: '#6b7280' }}>{modalityText}</span>
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#374151' }}>Candidats :</strong>
            <span style={{ marginLeft: '8px', color: '#6b7280' }}>{candidateCount}</span>
          </div>
          
          {sessionAddress && (
            <div>
              <strong style={{ color: '#374151' }}>Lieu :</strong>
              <span style={{ marginLeft: '8px', color: '#6b7280' }}>{sessionAddress}</span>
            </div>
          )}
        </div>

        {/* Rating Invitation */}
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          padding: '20px',
          margin: '0 0 24px 0'
        }}>
          <h3 style={{
            margin: '0 0 12px 0',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#15803d'
          }}>
            Votre retour nous intéresse
          </h3>
          
          <p style={{
            fontSize: '16px',
            lineHeight: '1.5',
            color: '#374151',
            margin: '0 0 16px 0'
          }}>
            Prenez quelques instants pour évaluer le centre <strong>{centerName}</strong> avec qui vous avez travaillé pour cette mission. Votre évaluation nous aide à maintenir la qualité de notre réseau de centres de formation.
          </p>
          
          <p style={{
            fontSize: '14px',
            lineHeight: '1.4',
            color: '#6b7280',
            margin: '0'
          }}>
            Vous pourrez donner une note globale au centre, ainsi que laisser un commentaire sur votre expérience de collaboration.
          </p>
        </div>

        {/* Call to Action */}
        <div style={{ textAlign: 'center', margin: '0 0 24px 0' }}>
          <a
            href={`${dashboardUrl}/dashboard/missions`}
            style={{
              display: 'inline-block',
              backgroundColor: '#13d090',
              color: 'white',
              padding: '14px 28px',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'background-color 0.2s'
            }}
          >
            Évaluer le centre
          </a>
        </div>

        <p style={{
          fontSize: '14px',
          lineHeight: '1.4',
          color: '#6b7280',
          margin: '0 0 16px 0',
          textAlign: 'center'
        }}>
          Vous pouvez également accéder à vos missions depuis votre tableau de bord
        </p>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid #e5e7eb',
          paddingTop: '16px',
          marginTop: '24px'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: '0 0 8px 0'
          }}>
            Merci de votre professionnalisme,
          </p>
          <p style={{
            fontSize: '14px',
            color: '#13d090',
            fontWeight: 'bold',
            margin: '0'
          }}>
            L'équipe SimplyJury
          </p>
        </div>
      </div>

      {/* Bottom Banner */}
      <div style={{
        backgroundColor: '#f3f4f6',
        padding: '16px',
        textAlign: 'center',
        borderTop: '1px solid #e5e7eb'
      }}>
        <p style={{
          fontSize: '12px',
          color: '#6b7280',
          margin: '0'
        }}>
          Cet email a été envoyé automatiquement. Pour toute question, contactez notre support.
        </p>
      </div>
    </div>
  );
}
