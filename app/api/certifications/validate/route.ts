import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route: Validate RNCP Code
 * 
 * Validates an RNCP code against Mission Apprentissage API
 * and returns certification details if valid
 */

const API_URL = 'https://api.apprentissage.beta.gouv.fr/api';
const API_TOKEN = process.env.MISSION_APPRENTISSAGE_API_TOKEN;

interface CertificationResponse {
  identifiant: {
    rncp: string;
    cfd: string | null;
  };
  intitule: {
    rncp: string;
    cfd: string | null;
    niveau: {
      rncp: {
        europeen: string | null;
      } | null;
    };
  };
  periode_validite: {
    rncp: {
      actif: boolean;
      fin_enregistrement: string | null;
    };
  };
  domaines: {
    nsf: {
      rncp: Array<{
        code: string;
        intitule: string;
      }>;
    };
  };
  continuite?: {
    rncp: Array<{
      code: string;
      actif: boolean;
      activation: string | null;
      fin_enregistrement: string | null;
      courant: boolean;
    }>;
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rncpCode = searchParams.get('code');

    // Validate input
    if (!rncpCode) {
      return NextResponse.json(
        { error: 'Code RNCP requis' },
        { status: 400 }
      );
    }

    // Validate RNCP format
    const rncpRegex = /^RNCP\d{3,5}$/;
    if (!rncpRegex.test(rncpCode)) {
      return NextResponse.json(
        { 
          error: 'Format de code RNCP invalide',
          message: 'Le code doit être au format RNCP suivi de 3 à 5 chiffres (ex: RNCP31114)'
        },
        { status: 400 }
      );
    }

    // Check API token
    if (!API_TOKEN) {
      console.error('Mission Apprentissage API token not configured');
      return NextResponse.json(
        { error: 'Configuration API manquante' },
        { status: 500 }
      );
    }

    // Call Mission Apprentissage API
    const response = await fetch(
      `${API_URL}/certification/v1?identifiant.rncp=${rncpCode}`,
      {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Accept': 'application/json',
          'User-Agent': 'SimplyJury/1.0'
        },
        // Add timeout
        signal: AbortSignal.timeout(10000) // 10 seconds
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        console.error('Mission Apprentissage API: Unauthorized');
        return NextResponse.json(
          { error: 'Erreur d\'authentification API' },
          { status: 500 }
        );
      }
      
      if (response.status === 404) {
        return NextResponse.json(
          { 
            error: 'Code RNCP non trouvé',
            message: 'Ce code RNCP n\'existe pas dans le référentiel'
          },
          { status: 404 }
        );
      }

      throw new Error(`API returned ${response.status}`);
    }

    const certifications: CertificationResponse[] = await response.json();

    // No certifications found
    if (!certifications || certifications.length === 0) {
      return NextResponse.json(
        { 
          error: 'Code RNCP non trouvé',
          message: 'Ce code RNCP n\'existe pas dans le référentiel'
        },
        { status: 404 }
      );
    }

    // Find active certification
    const activeCert = certifications.find(cert => 
      cert.periode_validite?.rncp?.actif === true
    );

    const cert = activeCert || certifications[0];

    // Extract certification details
    const title = cert.intitule?.rncp || 'Titre non disponible';
    const level = cert.intitule?.niveau?.rncp?.europeen || null;
    const isActive = cert.periode_validite?.rncp?.actif || false;
    const endDate = cert.periode_validite?.rncp?.fin_enregistrement;
    const domain = cert.domaines?.nsf?.rncp?.[0]?.intitule || null;

    // Find replacement certification (if inactive)
    let replacementCode = null;
    let replacementTitle = null;
    
    if (!isActive && cert.continuite?.rncp) {
      // Find the active replacement in the continuity chain
      const activeReplacement = cert.continuite.rncp.find(
        (c: any) => c.actif === true && c.code !== rncpCode
      );
      
      if (activeReplacement) {
        replacementCode = activeReplacement.code;
        
        // Fetch replacement certification details
        try {
          const replacementResponse = await fetch(
            `${API_URL}/certification/v1?identifiant.rncp=${replacementCode}`,
            {
              headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Accept': 'application/json'
              },
              signal: AbortSignal.timeout(5000)
            }
          );
          
          if (replacementResponse.ok) {
            const replacementData = await replacementResponse.json();
            if (replacementData && replacementData.length > 0) {
              replacementTitle = replacementData[0].intitule?.rncp || null;
            }
          }
        } catch (error) {
          console.error('Error fetching replacement certification:', error);
          // Continue without replacement title
        }
      }
    }

    // Return certification details
    return NextResponse.json({
      valid: true,
      code: rncpCode,
      title,
      level,
      domain,
      isActive,
      endDate,
      warning: !isActive ? 'Cette certification n\'est plus active' : null,
      replacement: replacementCode ? {
        code: replacementCode,
        title: replacementTitle
      } : null
    });

  } catch (error) {
    console.error('Error validating RNCP code:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Délai d\'attente dépassé lors de la validation' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Erreur lors de la validation',
        message: 'Une erreur est survenue lors de la vérification du code RNCP'
      },
      { status: 500 }
    );
  }
}
