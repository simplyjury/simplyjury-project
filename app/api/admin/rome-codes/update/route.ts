import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

/**
 * API Route: Update ROME Codes
 * 
 * POST /api/admin/rome-codes/update
 * 
 * Triggers the script to fetch and update ROME codes from France Travail Open Data
 */

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting ROME codes update...');
    
    // Run the fetch script
    const scriptPath = path.join(process.cwd(), 'scripts/fetch-rome-codes-from-open-data.js');
    
    if (!fs.existsSync(scriptPath)) {
      return NextResponse.json(
        { error: 'Update script not found' },
        { status: 500 }
      );
    }

    // Execute the script with extended timeout
    const { stdout, stderr } = await execAsync(`node ${scriptPath}`, {
      cwd: process.cwd(),
      timeout: 120000 // 120 second timeout (2 minutes)
    });

    console.log('Script output:', stdout);
    if (stderr) {
      console.error('Script errors:', stderr);
    }

    // Check if the JSON file was created/updated
    const jsonPath = path.join(process.cwd(), 'lib/data/rome-codes.json');
    
    if (!fs.existsSync(jsonPath)) {
      return NextResponse.json(
        { error: 'Update failed - JSON file not created' },
        { status: 500 }
      );
    }

    // Read the updated data
    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    const romeData = JSON.parse(jsonData);

    console.log(`✅ ROME codes updated successfully: ${romeData.totalCodes} codes`);

    return NextResponse.json({
      success: true,
      totalCodes: romeData.totalCodes,
      version: romeData.version,
      fetchedAt: romeData.fetchedAt,
      message: 'ROME codes updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating ROME codes:', error);
    
    // Check if it's a timeout error
    if (error.killed || error.signal === 'SIGTERM') {
      return NextResponse.json(
        { 
          error: 'Délai d\'attente dépassé',
          message: 'L\'opération a pris trop de temps. Veuillez vérifier si la mise à jour a réussi en rafraîchissant la page.'
        },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Échec de la mise à jour des codes ROME',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
