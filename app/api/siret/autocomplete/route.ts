import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { siret } = await request.json();

    if (!siret || !/^\d{14}$/.test(siret.replace(/\s/g, ''))) {
      return NextResponse.json(
        { error: 'SIRET invalide' },
        { status: 400 }
      );
    }

    const cleanSiret = siret.replace(/\s/g, '');

    // Check if API key is configured
    if (!process.env.API_PAPPERS_KEY) {
      console.error('API_PAPPERS_KEY not configured');
      return NextResponse.json(
        { error: 'Service temporairement indisponible' },
        { status: 503 }
      );
    }

    try {
      // Call API Pappers
      const response = await fetch(
        `https://api.pappers.fr/v2/entreprise?api_token=${process.env.API_PAPPERS_KEY}&siret=${cleanSiret}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error('API Pappers error:', response.status, response.statusText);
        return NextResponse.json(
          { error: 'SIRET non trouvé' },
          { status: 404 }
        );
      }

      const data = await response.json();

      // Map API Pappers response to our format
      const companyData = {
        name: data.nom_entreprise || data.denomination || 'Nom non disponible',
        address: data.siege?.adresse_ligne_1 || '',
        city: data.siege?.ville || '',
        postalCode: data.siege?.code_postal || '',
        sector: data.libelle_activite_principale || data.code_ape_entreprise || ''
      };

      console.log('API Pappers response for SIRET', cleanSiret, ':', companyData);

      return NextResponse.json(companyData);
    } catch (apiError) {
      console.error('API Pappers call failed:', apiError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des données SIRET' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erreur API SIRET:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données SIRET' },
      { status: 500 }
    );
  }
}
