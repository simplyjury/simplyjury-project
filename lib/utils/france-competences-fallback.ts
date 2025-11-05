/**
 * France Compétences Fallback Utility
 * 
 * Provides fallback RNCP validation by scraping France Compétences website
 * when Mission Apprentissage API returns no results
 */

import { load } from 'cheerio';

interface FranceCompetencesCertification {
  valid: true;
  code: string;
  title: string;
  level: string | null;
  domain: string | null;
  isActive: boolean;
  endDate: string | null;
  certificateurs: Array<{ nom: string }>;
  source: 'france_competences_fallback';
}

/**
 * Fetches RNCP certification data from France Compétences website
 * as a fallback when Mission Apprentissage API returns no results
 */
export async function fetchFromFranceCompetences(
  rncpCode: string
): Promise<FranceCompetencesCertification | null> {
  try {
    console.log(`🔄 Fallback: Fetching ${rncpCode} from France Compétences website...`);

    // France Compétences search URL
    const searchUrl = `https://www.francecompetences.fr/recherche-resultats/?search=${rncpCode}&pageType=certification&active=1&exactSearch=1`;

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SimplyJury/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
      },
      signal: AbortSignal.timeout(15000), // 15 seconds timeout
    });

    if (!response.ok) {
      console.error(`❌ France Compétences returned ${response.status}`);
      return null;
    }

    const html = await response.text();
    const $ = load(html);

    // Check if we have results by looking for the result count
    const resultCountText = $('.banner--results__number').text();
    const hasResults = resultCountText.includes('1') || resultCountText.includes('résultat');
    
    if (!hasResults) {
      console.log(`❌ No results found on France Compétences for ${rncpCode}`);
      return null;
    }

    console.log(`✅ Found result on France Compétences for ${rncpCode}`);

    // Extract certification data from the card
    const certificationCard = $('.card--results--certification--essential__content').first();
    
    if (certificationCard.length === 0) {
      console.log(`❌ Could not find certification card for ${rncpCode}`);
      return null;
    }

    // Extract title from h4 element
    let title = certificationCard.find('h4.card--results--certification--essential__content__title').first().text().trim();
    
    // Fallback: try to find title in the card text
    if (!title) {
      const fullCardText = certificationCard.text().trim();
      const titleMatch = fullCardText.match(/RNCP\d+\s*-\s*ACTIVE\s+(.+?)(?:\n|Niveau)/i);
      title = titleMatch ? titleMatch[1].trim() : 'Certification trouvée';
    }

    // Extract level (look for "Niveau" text)
    let level: string | null = null;
    const levelText = $('body').text();
    const levelMatch = levelText.match(/Niveau\s+(\d+|[IVX]+)/i);
    if (levelMatch) {
      level = levelMatch[1];
    }

    // Extract active status
    const isActive = html.includes('ACTIVE') || 
                     html.includes('Actif') || 
                     !html.includes('Inactive') ||
                     !html.includes('Inactif');

    // Extract end date if available
    let endDate: string | null = null;
    const dateMatch = html.match(/(\d{2}[/-]\d{2}[/-]\d{4})/);
    if (dateMatch) {
      endDate = dateMatch[1];
    }

    // Extract certificateur (look for ministry or organization name)
    const certificateurs: Array<{ nom: string }> = [];
    const certifText = html.match(/Certificateur[:\s]+([^<\n]+)/i);
    if (certifText && certifText[1]) {
      certificateurs.push({ nom: certifText[1].trim() });
    }

    console.log(`✅ Fallback successful: Found ${rncpCode} on France Compétences`);

    return {
      valid: true,
      code: rncpCode,
      title,
      level,
      domain: null, // Not easily extractable from HTML
      isActive,
      endDate,
      certificateurs,
      source: 'france_competences_fallback',
    };

  } catch (error) {
    console.error('❌ Error in France Compétences fallback:', error);
    return null;
  }
}
