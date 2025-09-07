import React from 'react';

interface JuryRequestNotificationProps {
  juryName: string;
  centerName: string;
  certificationType: string;
  sessionDate: string;
  loginUrl: string;
}

export function JuryRequestNotification({
  juryName,
  centerName,
  certificationType,
  sessionDate,
  loginUrl
}: JuryRequestNotificationProps) {
  const formattedDate = new Date(sessionDate).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Nouvelle demande de jury - SimplyJury</title>
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
          
          .details-card {
            background: linear-gradient(135deg, #f8fafc, #f1f5f9);
            border: 2px solid rgba(19, 208, 144, 0.2);
            border-radius: 15px;
            padding: 25px;
            margin: 25px 0;
          }
          
          .detail-item {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            font-size: 16px;
          }
          
          .detail-item:last-child {
            margin-bottom: 0;
          }
          
          .detail-icon {
            width: 20px;
            height: 20px;
            background: #13d090;
            border-radius: 50%;
            margin-right: 12px;
            flex-shrink: 0;
          }
          
          .detail-label {
            font-weight: 600;
            color: #0d4a70;
            margin-right: 8px;
          }
          
          .detail-value {
            color: #0d4a70;
            font-weight: 500;
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
            <h1>Nouvelle demande de jury</h1>
            <p>Vous avez reçu une proposition de mission</p>
          </div>
          
          <div className="content">
            <div className="greeting">
              Bonjour {juryName},
            </div>
            
            <div className="message">
              Vous avez reçu une nouvelle demande de jury de la part du centre de formation <strong>{centerName}</strong>.
            </div>
            
            <div className="details-card">
              <div className="detail-item">
                <div className="detail-icon"></div>
                <span className="detail-label">Certification :</span>
                <span className="detail-value">{certificationType}</span>
              </div>
              <div className="detail-item">
                <div className="detail-icon"></div>
                <span className="detail-label">Date de session :</span>
                <span className="detail-value">{formattedDate}</span>
              </div>
              <div className="detail-item">
                <div className="detail-icon"></div>
                <span className="detail-label">Centre demandeur :</span>
                <span className="detail-value">{centerName}</span>
              </div>
            </div>
            
            <div className="message">
              Pour consulter tous les détails de cette demande et y répondre, connectez-vous à votre espace jury.
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <a href={loginUrl} className="cta-button">
                Consulter la demande
              </a>
            </div>
            
            <div className="message" style={{ fontSize: '14px', color: '#64748b', marginTop: '30px' }}>
              Cette demande contient des informations détaillées sur la mission, les modalités et les conditions proposées.
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
