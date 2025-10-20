import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * API Route: Get Popular ROME Codes
 * 
 * GET /api/rome/popular?limit=12
 * 
 * Returns a curated list of popular ROME codes from the JSON file.
 */

// Curated list of popular ROME codes (most common professions)
const POPULAR_ROME_CODES = [
  'M1805', // Études et développement informatique
  'H1206', // Management et ingénierie études...
  'M1201', // Analyse financière
  'M1803', // Direction des systèmes d'information
  'H2914', // Réalisation et montage en tuyauterie
  'K1303', // Assistance auprès d'enfants
  'M1203', // Comptabilité
  'K2111', // Formation professionnelle
  'M1205', // Direction administrative et financière
  'C1202', // Analyse de crédits et risques bancaires
  'C1203', // Relation clients banque/finance
  'M1402', // Conseil en organisation et management
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '12');

    // Load ROME codes from JSON file
    const jsonPath = path.join(process.cwd(), 'lib/data/rome-codes.json');
    
    if (!fs.existsSync(jsonPath)) {
      return NextResponse.json({
        codes: [],
        total: 0,
        error: 'ROME codes not available'
      });
    }
    
    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    const romeData = JSON.parse(jsonData);
    
    // Filter to get only the popular codes with their actual labels
    const popularCodes = POPULAR_ROME_CODES
      .slice(0, limit)
      .map(code => romeData.codes.find((r: any) => r.code === code))
      .filter(Boolean); // Remove any not found

    return NextResponse.json({
      codes: popularCodes,
      total: popularCodes.length,
    });

  } catch (error) {
    console.error('Error fetching popular ROME codes:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors du chargement',
        message: 'Une erreur est survenue lors du chargement des codes ROME populaires'
      },
      { status: 500 }
    );
  }
}
