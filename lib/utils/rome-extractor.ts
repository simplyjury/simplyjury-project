/**
 * ROME Code Extraction Utilities
 * 
 * Extracts ROME codes from certification details stored in the database.
 * ROME codes come from the Mission Apprentissage API and are stored in
 * the certification_details JSONB field.
 */

export interface RomeCode {
  code: string;
  label: string;
  categoryCode: string; // First 3 chars (e.g., "M18" from "M1805")
  categoryLabel?: string;
  count?: number; // For popularity tracking
}

/**
 * Extract unique ROME codes from an array of certifications
 */
export function extractRomeCodesFromCertifications(
  certifications: any[]
): RomeCode[] {
  const romeMap = new Map<string, RomeCode>();

  certifications.forEach((cert) => {
    try {
      // Access ROME codes from certification_details JSONB
      const romeData =
        cert.certification_details?.domaines?.rome?.rncp || 
        cert.certificationDetails?.domaines?.rome?.rncp || // Handle both snake_case and camelCase
        [];

      romeData.forEach((rome: any) => {
        if (rome.code && rome.intitule) {
          const code = rome.code.trim();
          const label = rome.intitule.trim();
          const categoryCode = code.substring(0, 3); // e.g., "M18" from "M1805"

          if (romeMap.has(code)) {
            // Increment count if already exists
            const existing = romeMap.get(code)!;
            existing.count = (existing.count || 1) + 1;
          } else {
            // Add new ROME code
            romeMap.set(code, {
              code,
              label,
              categoryCode,
              count: 1,
            });
          }
        }
      });
    } catch (error) {
      console.error('Error extracting ROME codes from certification:', error);
    }
  });

  // Convert to array and sort by popularity (count)
  return Array.from(romeMap.values()).sort((a, b) => {
    const countDiff = (b.count || 0) - (a.count || 0);
    if (countDiff !== 0) return countDiff;
    // If same count, sort alphabetically by code
    return a.code.localeCompare(b.code);
  });
}

/**
 * Search ROME codes by query string
 * Searches in both code and label
 */
export function searchRomeCodes(
  romeCodes: RomeCode[],
  query: string
): RomeCode[] {
  if (!query || query.trim().length === 0) {
    return romeCodes;
  }

  const normalizedQuery = query.toLowerCase().trim();

  return romeCodes.filter((rome) => {
    const codeMatch = rome.code.toLowerCase().includes(normalizedQuery);
    const labelMatch = rome.label.toLowerCase().includes(normalizedQuery);
    return codeMatch || labelMatch;
  });
}

/**
 * Get popular ROME codes (top N by count)
 */
export function getPopularRomeCodes(
  romeCodes: RomeCode[],
  limit: number = 12
): RomeCode[] {
  return romeCodes
    .sort((a, b) => (b.count || 0) - (a.count || 0))
    .slice(0, limit);
}

/**
 * Group ROME codes by category (first 3 characters)
 */
export function groupRomeCodesByCategory(
  romeCodes: RomeCode[]
): Map<string, RomeCode[]> {
  const grouped = new Map<string, RomeCode[]>();

  romeCodes.forEach((rome) => {
    const category = rome.categoryCode;
    if (!grouped.has(category)) {
      grouped.set(category, []);
    }
    grouped.get(category)!.push(rome);
  });

  return grouped;
}

/**
 * Get ROME category label from code
 * This is a simplified mapping - in production, you might want to fetch this from an API
 */
export function getRomeCategoryLabel(categoryCode: string): string {
  // Simplified mapping of ROME category codes to labels
  const categoryLabels: Record<string, string> = {
    'A': 'Agriculture et Pêche',
    'B': 'Arts et Façonnage d\'ouvrages d\'art',
    'C': 'Artisanat',
    'D': 'Commerce, Vente et Grande distribution',
    'E': 'Communication, Média et Multimédia',
    'F': 'Construction, Bâtiment et Travaux publics',
    'G': 'Hôtellerie-Restauration, Tourisme, Loisirs et Animation',
    'H': 'Industrie',
    'I': 'Installation et Maintenance',
    'J': 'Santé',
    'K': 'Services à la personne et à la collectivité',
    'L': 'Spectacle',
    'M': 'Support à l\'entreprise',
    'N': 'Transport et Logistique',
  };

  const firstLetter = categoryCode.charAt(0).toUpperCase();
  return categoryLabels[firstLetter] || 'Autre';
}

/**
 * Validate ROME code format
 */
export function isValidRomeCode(code: string): boolean {
  // ROME code format: 1 letter + 4 digits (e.g., M1805, D1202)
  const romeRegex = /^[A-Z]\d{4}$/i;
  return romeRegex.test(code);
}

/**
 * Format ROME code for display
 */
export function formatRomeCodeDisplay(code: string, label: string): string {
  return `${code} - ${label}`;
}
