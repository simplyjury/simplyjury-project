import React from 'react';

interface CenterRequestConfirmationProps {
  centerName: string;
  contactPersonName: string;
  juryFirstName: string;
  juryLastName: string;
  certificationType: string;
  sessionDate: string;
  candidateCount: number;
  modality: string;
  dashboardUrl: string;
}

export function CenterRequestConfirmation({
  centerName,
  contactPersonName,
  juryFirstName,
  juryLastName,
  certificationType,
  sessionDate,
  candidateCount,
  modality,
  dashboardUrl
}: CenterRequestConfirmationProps) {
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
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Confirmation d'envoi - SimplyJury</title>
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
          
          .success-badge {
            background: linear-gradient(135deg, rgba(19, 208, 144, 0.1), rgba(19, 208, 144, 0.05));
            border: 2px solid rgba(19, 208, 144, 0.2);
            border-radius: 12px;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
          }
          
          .success-icon {
            width: 50px;
            height: 50px;
            background: #13d090;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 15px;
            color: white;
            font-size: 24px;
            font-weight: 700;
          }
          
          .success-text {
            font-size: 18px;
            font-weight: 600;
            color: #0d4a70;
            margin-bottom: 10px;
          }
          
          .success-subtext {
            font-size: 14px;
            color: #64748b;
          }
          
          .details-card {
            background: linear-gradient(135deg, #f8fafc, #f1f5f9);
            border: 2px solid rgba(19, 208, 144, 0.2);
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
          }
          
          .details-title {
            font-size: 18px;
            font-weight: 700;
            color: #0d4a70;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
          }
          
          .details-title::before {
            content: '';
            width: 4px;
            height: 20px;
            background: #13d090;
            border-radius: 2px;
            margin-right: 12px;
          }
          
          .detail-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            font-size: 16px;
            padding: 12px 0;
            border-bottom: 1px solid rgba(226, 232, 240, 0.5);
          }
          
          .detail-item:last-child {
            margin-bottom: 0;
            border-bottom: none;
          }
          
          .detail-label {
            font-weight: 600;
            color: #64748b;
          }
          
          .detail-value {
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
          
          .next-steps {
            background: rgba(253, 206, 15, 0.1);
            border: 1px solid rgba(253, 206, 15, 0.3);
            border-radius: 12px;
            padding: 20px;
            margin: 25px 0;
          }
          
          .next-steps h3 {
            color: #0d4a70;
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 15px;
          }
          
          .next-steps ul {
            list-style: none;
            padding: 0;
          }
          
          .next-steps li {
            font-size: 14px;
            color: #0d4a70;
            margin-bottom: 8px;
            padding-left: 20px;
            position: relative;
          }
          
          .next-steps li::before {
            content: '✓';
            position: absolute;
            left: 0;
            color: #13d090;
            font-weight: 700;
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
            <h1>Demande envoyée</h1>
            <p>Votre demande a été transmise au jury</p>
          </div>
          
          <div className="content">
            <div className="greeting">
              Bonjour {contactPersonName},
            </div>
            
            <div className="success-badge">
              <div className="success-icon">✓</div>
              <div className="success-text">Demande envoyée avec succès !</div>
              <div className="success-subtext">Le jury va recevoir une notification et pourra consulter votre proposition</div>
            </div>
            
            <div className="message">
              Voici un récapitulatif de votre demande :
            </div>
            
            <div className="details-card">
              <div className="details-title">Récapitulatif de la demande</div>
              
              <div className="detail-item">
                <span className="detail-label">Jury contacté</span>
                <span className="detail-value">{juryFirstName} {juryLastName}</span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">Certification</span>
                <span className="detail-value">{certificationType}</span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">Date de session</span>
                <span className="detail-value">{formattedDate}</span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">Nombre de candidats</span>
                <span className="detail-value">{candidateCount} candidat{candidateCount > 1 ? 's' : ''}</span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">Modalité</span>
                <span className="detail-value">{modalityText}</span>
              </div>
            </div>
            
            <div className="next-steps">
              <h3>Prochaines étapes :</h3>
              <ul>
                <li>Le jury va recevoir une notification par email</li>
                <li>Il pourra consulter tous les détails de votre demande</li>
                <li>Vous recevrez une notification dès qu'il aura répondu</li>
                <li>Vous pourrez suivre l'évolution dans votre tableau de bord</li>
              </ul>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <a href={dashboardUrl} className="cta-button">
                Accéder au tableau de bord
              </a>
            </div>
            
            <div className="message" style={{ fontSize: '14px', color: '#64748b', marginTop: '30px' }}>
              Vous pouvez suivre le statut de cette demande et toutes vos autres demandes depuis votre tableau de bord.
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
