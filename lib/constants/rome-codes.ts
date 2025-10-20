/**
 * ROME Codes Reference
 * 
 * Complete list of ROME codes (Répertoire Opérationnel des Métiers et des Emplois)
 * from France Travail (Pôle Emploi).
 * 
 * Source: ROME Arborescence Principale 24M06.xlsx
 * Generated: 2025-10-15T18:07:57.372Z
 * Total codes: 0
 * 
 * @see https://www.pole-emploi.fr/employeur/vos-recrutements/le-rome-et-les-fiches-metiers.html
 */

export interface RomeCode {
  code: string;
  label: string;
  categoryCode: string;
  domain?: string;
}

export const ROME_CODES: RomeCode[] = [

];

/**
 * Search ROME codes by query string
 */
export function searchRomeCodes(query: string, limit: number = 10): RomeCode[] {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();
  
  return ROME_CODES.filter(rome => {
    const codeMatch = rome.code.toLowerCase().includes(normalizedQuery);
    const labelMatch = rome.label.toLowerCase().includes(normalizedQuery);
    return codeMatch || labelMatch;
  }).slice(0, limit);
}

/**
 * Get ROME code by exact code
 */
export function getRomeByCode(code: string): RomeCode | undefined {
  return ROME_CODES.find(rome => rome.code === code);
}

/**
 * Get all ROME codes for a category (e.g., "M18" for IT)
 */
export function getRomesByCategory(categoryCode: string): RomeCode[] {
  return ROME_CODES.filter(rome => rome.categoryCode === categoryCode);
}
