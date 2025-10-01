import React from 'react';

interface JuryRequestResponseJuryProps {
  juryName: string;
  centerName: string;
  certificationType: string;
  sessionDate: string;
  sessionAddress: string;
  candidateCount: number;
  modality: string;
  rncp?: string;
  status: 'accepted' | 'rejected';
  dashboardUrl: string;
}

export function JuryRequestResponseJury({
  juryName,
  centerName,
  certificationType,
  sessionDate,
  sessionAddress,
  candidateCount,
  modality,
  rncp,
  status,
  dashboardUrl
}: JuryRequestResponseJuryProps) {
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

  const isAccepted = status === 'accepted';
  const statusText = isAccepted ? 'acceptée' : 'refusée';
  const statusColor = isAccepted ? '#13d090' : '#ef4444';
  const statusBgColor = isAccepted ? 'rgba(19, 208, 144, 0.1)' : 'rgba(239, 68, 68, 0.1)';

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Confirmation de réponse - SimplyJury</title>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Plus Jakarta Sans', Arial, sans-serif;
            line-height: 1.6;
            color: #0d4a70;
            background-color: #f8fafc;
          }
          
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(13, 74, 112, 0.1);
          }
          
          .header {
            background: linear-gradient(135deg, #0d4a70 0%, #1a5a8a 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200px;
            height: 200px;
            background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
            border-radius: 50%;
          }
          
          .logo {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #bea1e5, #cfbaed);
            border-radius: 15px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: 700;
            color: white;
            margin-bottom: 20px;
            box-shadow: 0 8px 25px rgba(190, 161, 229, 0.4);
          }
          
          .header h1 {
            color: white;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
          }
          
          .header p {
            color: rgba(255, 255, 255, 0.9);
            font-size: 16px;
            font-weight: 400;
          }
          
          .content {
            padding: 40px 30px;
          }
          
          .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #0d4a70;
            margin-bottom: 20px;
          }
          
          .message {
            font-size: 16px;
            line-height: 1.8;
            color: #0d4a70;
            margin-bottom: 30px;
          }
          
          .status-badge {
            background: ${statusBgColor};
            border: 2px solid ${statusColor}33;
            border-radius: 12px;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
          }
          
          .status-icon {
            width: 50px;
            height: 50px;
            background: ${statusColor};
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 15px;
            color: white;
            font-size: 24px;
            font-weight: 700;
          }
          
          .status-text {
            font-size: 18px;
            font-weight: 600;
            color: #0d4a70;
            margin-bottom: 10px;
          }
          
          .status-subtext {
            font-size: 14px;
            color: #64748b;
          }
          
          .mission-summary-card {
            background: linear-gradient(135deg, #f8fafc, #f1f5f9);
            border: 2px solid rgba(13, 74, 112, 0.2);
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
          }
          
          .mission-summary-title {
            font-size: 18px;
            font-weight: 700;
            color: #0d4a70;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
          }
          
          .mission-summary-title::before {
            content: '';
            width: 4px;
            height: 20px;
            background: #0d4a70;
            border-radius: 2px;
            margin-right: 12px;
          }
          
          .summary-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            font-size: 16px;
            padding: 12px 0;
            border-bottom: 1px solid rgba(226, 232, 240, 0.5);
          }
          
          .summary-item:last-child {
            margin-bottom: 0;
            border-bottom: none;
          }
          
          .summary-label {
            font-weight: 600;
            color: #64748b;
          }
          
          .summary-value {
            color: #0d4a70;
            font-weight: 600;
            text-align: right;
          }
          
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #13d090, #0ea472);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            box-shadow: 0 4px 15px rgba(19, 208, 144, 0.3);
            transition: all 0.3s ease;
          }
          
          .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(19, 208, 144, 0.4);
          }
          
          .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          
          .footer p {
            font-size: 14px;
            color: #64748b;
            margin-bottom: 10px;
          }
          
          .footer-logo {
            font-size: 18px;
            font-weight: 700;
            color: #0d4a70;
            margin-bottom: 5px;
          }
          
          .tagline {
            font-size: 12px;
            color: #94a3b8;
            font-style: italic;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <div className="logo">SJ</div>
            <h1>Réponse confirmée</h1>
            <p>Votre réponse a été transmise au centre</p>
          </div>
          
          <div className="content">
            <div className="greeting">
              Bonjour {juryName},
            </div>
            
            <div className="status-badge">
              <div className="status-icon">{isAccepted ? '✓' : '✕'}</div>
              <div className="status-text">Mission {statusText}</div>
              <div className="status-subtext">
                {isAccepted 
                  ? 'Le centre de formation va recevoir vos coordonnées'
                  : 'Le centre de formation a été informé de votre refus'
                }
              </div>
            </div>
            
            <div className="message">
              Votre réponse concernant la mission proposée par <strong>{centerName}</strong> a été {statusText} et transmise au centre de formation.
            </div>
            
            <div className="mission-summary-card">
              <div className="mission-summary-title">Résumé de la mission</div>
              
              <div className="summary-item">
                <span className="summary-label">Centre demandeur</span>
                <span className="summary-value">{centerName}</span>
              </div>
              
              <div className="summary-item">
                <span className="summary-label">Certification</span>
                <span className="summary-value">{certificationType}</span>
              </div>
              
              {rncp && (
                <div className="summary-item">
                  <span className="summary-label">Code RNCP</span>
                  <span className="summary-value">{rncp}</span>
                </div>
              )}
              
              <div className="summary-item">
                <span className="summary-label">Date de session</span>
                <span className="summary-value">{formattedDate}</span>
              </div>
              
              <div className="summary-item">
                <span className="summary-label">Lieu</span>
                <span className="summary-value">{sessionAddress}</span>
              </div>
              
              <div className="summary-item">
                <span className="summary-label">Modalité</span>
                <span className="summary-value">{modalityText}</span>
              </div>
              
              <div className="summary-item">
                <span className="summary-label">Candidats</span>
                <span className="summary-value">{candidateCount} candidat{candidateCount > 1 ? 's' : ''}</span>
              </div>
            </div>
            
            <div className="message">
              {isAccepted 
                ? 'Le centre de formation va pouvoir vous contacter directement pour finaliser les détails de la mission. Vous pouvez suivre vos missions acceptées depuis votre tableau de bord.'
                : 'Vous pouvez continuer à consulter d\'autres demandes de missions depuis votre tableau de bord.'
              }
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <a href={dashboardUrl} className="cta-button">
                Accéder au tableau de bord
              </a>
            </div>
            
            <div className="message" style={{ fontSize: '14px', color: '#64748b', marginTop: '30px' }}>
              {isAccepted 
                ? 'Merci de votre engagement ! Le centre vous contactera prochainement.'
                : 'Merci d\'avoir pris le temps de répondre à cette demande.'
              }
            </div>
          </div>
          
          <div className="footer">
            <div className="footer-logo">SimplyJury</div>
            <div className="tagline">Trouvez un jury qualifié n'a jamais été aussi simple.</div>
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
    </html>
  );
}
