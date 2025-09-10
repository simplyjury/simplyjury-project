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
      const apiUrl = `https://api.pappers.fr/v2/entreprise?api_token=${process.env.API_PAPPERS_KEY}&siret=${cleanSiret}`;
      console.log('🔍 Calling API Pappers with URL:', apiUrl.replace(process.env.API_PAPPERS_KEY!, '[API_KEY_HIDDEN]'));
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('🔍 API Pappers response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Pappers error details:', errorText);
        return NextResponse.json(
          { error: 'SIRET non trouvé' },
          { status: 404 }
        );
      }

      const data = await response.json();
      console.log('🔍 Raw API Pappers response:', JSON.stringify(data, null, 2));

      // Map API Pappers response to our format
      const companyData = {
        name: data.nom_entreprise || data.denomination || 'Nom non disponible',
        address: data.siege?.adresse_ligne_1 || '',
        city: data.siege?.ville || '',
        postalCode: data.siege?.code_postal || '',
        sector: data.libelle_activite_principale || data.code_ape_entreprise || ''
      };

      console.log('🔍 Mapped company data for SIRET', cleanSiret, ':', companyData);

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
