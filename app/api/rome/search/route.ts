import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * API Route: Search ROME Codes
 * 
 * GET /api/rome/search?q=développeur&limit=10
 * 
 * Searches for ROME codes from a JSON file fetched from France Travail Open Data.
 * The JSON file is updated by running: node scripts/fetch-rome-codes-from-open-data.js
 */

// Cache the ROME codes in memory for performance
let romeCodesCache: any = null;
let lastLoadTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

function loadRomeCodes() {
  const now = Date.now();
  
  // Return cached data if still valid
  if (romeCodesCache && (now - lastLoadTime) < CACHE_DURATION) {
    return romeCodesCache;
  }
  
  try {
    const jsonPath = path.join(process.cwd(), 'lib/data/rome-codes.json');
    
    if (!fs.existsSync(jsonPath)) {
      console.warn('⚠️  ROME codes JSON file not found. Run: node scripts/fetch-rome-codes-from-open-data.js');
      return null;
    }
    
    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    romeCodesCache = JSON.parse(jsonData);
    lastLoadTime = now;
    
    return romeCodesCache;
  } catch (error) {
    console.error('Error loading ROME codes:', error);
    return null;
  }
}

/**
 * Normalize text for fuzzy search:
 * - Remove accents (é → e, à → a)
 * - Lowercase
 * - Remove gender markers (ère → er, euse → eur)
 */
function normalizeText(text: string): string {
  let normalized = text.toLowerCase();
  
  // First, handle gender variations BEFORE removing accents
  normalized = normalized
    .replace(/ière\b/g, 'ier')        // financière → financier
    .replace(/euse\b/g, 'eur')        // développeuse → développeur  
    .replace(/trice\b/g, 'teur');     // directrice → directeur
  
  // Then remove accents
  normalized = normalized
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remove accents
  
  return normalized.trim();
}

/**
 * Fuzzy search: split query into keywords and match if ANY keyword appears
 */
function fuzzyMatch(searchText: string, targetText: string): boolean {
  const normalizedSearch = normalizeText(searchText);
  const normalizedTarget = normalizeText(targetText);
  
  // Split search into keywords (remove short words like "de", "et", etc.)
  const keywords = normalizedSearch
    .split(/\s+/)
    .filter(word => word.length > 2); // Ignore words shorter than 3 chars
  
  // Match if ANY keyword appears in target
  return keywords.some(keyword => normalizedTarget.includes(keyword));
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    // If no query, return empty
    if (!query.trim()) {
      return NextResponse.json({ 
        results: [],
        message: 'Veuillez entrer un terme de recherche'
      });
    }

    // Load ROME codes from JSON file
    const romeData = loadRomeCodes();
    
    if (!romeData || !romeData.codes) {
      return NextResponse.json({
        results: [],
        total: 0,
        query,
        error: 'ROME codes not available. Please run the fetch script.'
      });
    }

    // Fuzzy search in ROME codes
    const results = romeData.codes.filter((rome: any) => {
      // Exact match on code (e.g., "M1805")
      if (rome.code.toUpperCase() === query.toUpperCase().trim()) {
        return true;
      }
      
      // Fuzzy match on label
      return fuzzyMatch(query, rome.label) || fuzzyMatch(query, rome.code);
    }).slice(0, limit);

    return NextResponse.json({
      results,
      total: results.length,
      query,
      dataVersion: romeData.version,
      lastUpdated: romeData.fetchedAt
    });

  } catch (error) {
    console.error('Error searching ROME codes:', error);
    
    return NextResponse.json({
      results: [],
      total: 0,
      query: request.nextUrl.searchParams.get('q') || '',
    });
  }
}

