import React from 'react';

interface ContactFormNotificationProps {
  centerName: string;
  contactName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export function ContactFormNotification({
  centerName,
  contactName,
  email,
  phone,
  subject,
  message
}: ContactFormNotificationProps) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Nouveau message de contact - SimplyJury</title>
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
            background: linear-gradient(135deg, #13d090, #10b87a);
            border-radius: 15px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: 700;
            color: white;
            margin-bottom: 20px;
            box-shadow: 0 8px 25px rgba(19, 208, 144, 0.4);
          }
          
          .header h1 {
            color: white;
            font-size: 28px;
            font-weight: 700;
            margin: 0;
            text-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          
          .content {
            padding: 40px 30px;
          }
          
          .greeting {
            font-size: 18px;
            color: #0d4a70;
            margin-bottom: 20px;
            font-weight: 600;
          }
          
          .message-text {
            color: #475569;
            font-size: 16px;
            line-height: 1.8;
            margin-bottom: 30px;
          }
          
          .info-card {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-left: 4px solid #13d090;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 25px;
          }
          
          .info-row {
            display: flex;
            margin-bottom: 12px;
            align-items: flex-start;
          }
          
          .info-row:last-child {
            margin-bottom: 0;
          }
          
          .info-label {
            font-weight: 600;
            color: #0d4a70;
            min-width: 120px;
            font-size: 14px;
          }
          
          .info-value {
            color: #475569;
            font-size: 14px;
            flex: 1;
          }
          
          .message-box {
            background: #ffffff;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            margin-top: 20px;
          }
          
          .message-box h3 {
            color: #0d4a70;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 12px;
          }
          
          .message-content {
            color: #475569;
            font-size: 15px;
            line-height: 1.7;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          
          .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          
          .footer-text {
            color: #64748b;
            font-size: 14px;
            margin-bottom: 15px;
          }
          
          .brand {
            color: #0d4a70;
            font-weight: 700;
            font-size: 18px;
            margin-bottom: 10px;
          }
          
          .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #e2e8f0, transparent);
            margin: 25px 0;
          }
          
          .badge {
            display: inline-block;
            background: linear-gradient(135deg, #13d090, #10b87a);
            color: white;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 20px;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <div className="logo">SJ</div>
            <h1>Nouveau message de contact</h1>
          </div>
          
          <div className="content">
            <div className="badge">📧 Formulaire de contact</div>
            
            <p className="greeting">Bonjour,</p>
            
            <p className="message-text">
              Vous avez reçu un nouveau message via le formulaire de contact de SimplyJury.
            </p>
            
            <div className="info-card">
              <div className="info-row">
                <span className="info-label">Centre :</span>
                <span className="info-value"><strong>{centerName}</strong></span>
              </div>
              <div className="info-row">
                <span className="info-label">Contact :</span>
                <span className="info-value">{contactName}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Email :</span>
                <span className="info-value">
                  <a href={`mailto:${email}`} style={{ color: '#0d4a70', textDecoration: 'none' }}>
                    {email}
                  </a>
                </span>
              </div>
              {phone && (
                <div className="info-row">
                  <span className="info-label">Téléphone :</span>
                  <span className="info-value">
                    <a href={`tel:${phone}`} style={{ color: '#0d4a70', textDecoration: 'none' }}>
                      {phone}
                    </a>
                  </span>
                </div>
              )}
              <div className="info-row">
                <span className="info-label">Sujet :</span>
                <span className="info-value"><strong>{subject}</strong></span>
              </div>
            </div>
            
            <div className="message-box">
              <h3>Message :</h3>
              <div className="message-content">{message}</div>
            </div>
            
            <div className="divider"></div>
            
            <p className="message-text" style={{ fontSize: '14px', color: '#64748b' }}>
              💡 <strong>Action requise :</strong> Veuillez répondre à ce message dans les plus brefs délais pour assurer une expérience client optimale.
            </p>
          </div>
          
          <div className="footer">
            <div className="brand">SimplyJury</div>
            <p className="footer-text">
              La plateforme qui simplifie la mise en relation entre centres de formation et jurys qualifiés
            </p>
            <p className="footer-text" style={{ fontSize: '12px', marginTop: '15px' }}>
              © {new Date().getFullYear()} SimplyJury. Tous droits réservés.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
