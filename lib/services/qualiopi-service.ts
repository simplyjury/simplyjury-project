import { promises as fs } from 'fs';
import path from 'path';

interface QualiopiRecord {
  siret: string;
  raisonSociale: string;
  qualiopiActionFormation: boolean;
  qualiopiBilanCompetences: boolean;
  qualiopiVae: boolean;
  qualiopiApprentissage: boolean;
  dateObtention?: string;
  dateFinValidite?: string;
}

export class QualiopiService {
  private static annuaireApiUrl = 'https://recherche-entreprises.api.gouv.fr/search';
  private static cacheFile = path.join(process.cwd(), 'data', 'qualiopi-cache.json');
  private static cacheDuration = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Check Qualiopi status using Annuaire des Entreprises API
   */
  static async checkQualiopiWithAPI(siret: string): Promise<QualiopiRecord | null> {
    try {
      console.log('Checking Qualiopi via Annuaire API for SIRET:', siret);
      
      const response = await fetch(`${this.annuaireApiUrl}?q=${siret}`);
      
      if (!response.ok) {
        console.error('Annuaire API error:', response.status, response.statusText);
        return null;
      }

      const data = await response.json();
      
      if (!data.results || data.results.length === 0) {
        console.log('No results found for SIRET:', siret);
        return null;
      }

      const result = data.results[0];
      const complements = result.complements || {};
      
      // Check if organization is Qualiopi certified
      const isQualiopi = complements.est_qualiopi === true;
      const isOrganismeFormation = complements.est_organisme_formation === true;

      return {
        siret,
        raisonSociale: result.nom_complet || result.nom_raison_sociale || '',
        qualiopiActionFormation: isQualiopi && isOrganismeFormation,
        qualiopiBilanCompetences: isQualiopi,
        qualiopiVae: isQualiopi,
        qualiopiApprentissage: isQualiopi
      };

    } catch (error) {
      console.error('Error checking Qualiopi with API:', error);
      return null;
    }
  }

  /**
   * Parse CSV text into structured data
   */
  private static parseCsv(csvText: string): QualiopiRecord[] {
    const lines = csvText.split('\n');
    const headers = lines[0].split(';').map(h => h.replace(/"/g, '').trim());
    
    console.log('CSV Headers:', headers);
    
    const records: QualiopiRecord[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(';').map(v => v.replace(/"/g, '').trim());
      
      // Map CSV columns to our structure
      const record: QualiopiRecord = {
        siret: values[headers.indexOf('siret')] || '',
        raisonSociale: values[headers.indexOf('raison_sociale')] || '',
        qualiopiActionFormation: values[headers.indexOf('action_formation')] === 'true',
        qualiopiBilanCompetences: values[headers.indexOf('bilan_competences')] === 'true',
        qualiopiVae: values[headers.indexOf('validation_acquis_experience')] === 'true',
        qualiopiApprentissage: values[headers.indexOf('apprentissage')] === 'true',
        dateObtention: values[headers.indexOf('date_obtention')] || undefined,
        dateFinValidite: values[headers.indexOf('date_fin_validite')] || undefined
      };
      
      if (record.siret) {
        records.push(record);
      }
    }
    
    console.log(`Parsed ${records.length} Qualiopi records`);
    return records;
  }

  /**
   * Get cached data or download fresh data if cache is expired
   */
  static async getCachedQualiopiData(): Promise<QualiopiRecord[]> {
    try {
      // Check if cache file exists and is recent
      const cacheExists = await fs.access(this.cacheFile).then(() => true).catch(() => false);
      
      if (cacheExists) {
        const stats = await fs.stat(this.cacheFile);
        const cacheAge = Date.now() - stats.mtime.getTime();
        
        if (cacheAge < this.cacheDuration) {
          console.log('Using cached Qualiopi data');
          const cacheContent = await fs.readFile(this.cacheFile, 'utf-8');
          return JSON.parse(cacheContent);
        }
      }
      
      // Use API-based approach instead of CSV download
      console.log('Cache expired, using API-based approach');
      return [];
    } catch (error) {
      console.error('Error getting Qualiopi data:', error);
      throw error;
    }
  }

  /**
   * Check if a SIRET has Qualiopi certification
   */
  static async checkQualiopiStatus(siret: string): Promise<{
    isQualiopi: boolean;
    record?: QualiopiRecord;
    error?: string;
  }> {
    try {
      const cleanSiret = siret.replace(/\s/g, '');
      
      if (!/^\d{14}$/.test(cleanSiret)) {
        return {
          isQualiopi: false,
          error: 'SIRET invalide (doit contenir 14 chiffres)'
        };
      }
      
      // Use API-based approach instead of CSV
      const record = await this.checkQualiopiWithAPI(cleanSiret);
      
      if (!record) {
        return {
          isQualiopi: false,
          error: 'SIRET non trouvé dans la base Qualiopi'
        };
      }
      
      // Check if any Qualiopi certification is active
      const hasQualiopi = record.qualiopiActionFormation || 
                         record.qualiopiBilanCompetences || 
                         record.qualiopiVae || 
                         record.qualiopiApprentissage;
      
      return {
        isQualiopi: hasQualiopi,
        record
      };
    } catch (error) {
      console.error('Error checking Qualiopi status:', error);
      return {
        isQualiopi: false,
        error: 'Erreur lors de la vérification Qualiopi'
      };
    }
  }

  /**
   * Get detailed Qualiopi information for a SIRET
   */
  static async getQualiopiDetails(siret: string) {
    const result = await this.checkQualiopiStatus(siret);
    
    if (!result.record) {
      return {
        siret,
        isQualiopi: false,
        certifications: [],
        error: result.error
      };
    }
    
    const certifications = [];
    if (result.record.qualiopiActionFormation) certifications.push('Actions de formation');
    if (result.record.qualiopiBilanCompetences) certifications.push('Bilans de compétences');
    if (result.record.qualiopiVae) certifications.push('Validation des acquis de l\'expérience');
    if (result.record.qualiopiApprentissage) certifications.push('Apprentissage');
    
    return {
      siret,
      raisonSociale: result.record.raisonSociale,
      isQualiopi: result.isQualiopi,
      certifications,
      dateObtention: result.record.dateObtention,
      dateFinValidite: result.record.dateFinValidite,
      lastChecked: new Date().toISOString()
    };
  }
}
