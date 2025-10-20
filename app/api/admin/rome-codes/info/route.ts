import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * API Route: Get ROME Codes Info
 * 
 * GET /api/admin/rome-codes/info
 * 
 * Returns information about the current ROME codes data
 */

export async function GET(request: NextRequest) {
  try {
    const jsonPath = path.join(process.cwd(), 'lib/data/rome-codes.json');
    
    if (!fs.existsSync(jsonPath)) {
      return NextResponse.json({
        exists: false,
        totalCodes: 0,
        version: null,
        lastUpdated: null,
        source: null
      });
    }
    
    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    const romeData = JSON.parse(jsonData);
    
    return NextResponse.json({
      exists: true,
      totalCodes: romeData.totalCodes || 0,
      version: romeData.version || 'unknown',
      lastUpdated: romeData.fetchedAt || null,
      source: romeData.source || 'France Travail Open Data',
      sourceUrl: romeData.sourceUrl || null
    });

  } catch (error) {
    console.error('Error reading ROME codes info:', error);
    return NextResponse.json(
      { error: 'Failed to read ROME codes information' },
      { status: 500 }
    );
  }
}
