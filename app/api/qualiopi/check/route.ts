import { NextRequest, NextResponse } from 'next/server';
import { QualiopiService } from '@/lib/services/qualiopi-service';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const siret = searchParams.get('siret');

  if (!siret) {
    return NextResponse.json({ error: 'SIRET parameter is required' }, { status: 400 });
  }

  // Clean SIRET (remove spaces)
  const cleanSiret = siret.replace(/\s/g, '');

  if (!/^\d{14}$/.test(cleanSiret)) {
    return NextResponse.json({ error: 'Invalid SIRET format' }, { status: 400 });
  }

  try {
    console.log('Checking Qualiopi status for SIRET:', cleanSiret);
    
    // Use our new CSV-based Qualiopi service
    const qualiopiDetails = await QualiopiService.getQualiopiDetails(cleanSiret);
    
    if (qualiopiDetails.error) {
      console.log('Qualiopi check error:', qualiopiDetails.error);
      return NextResponse.json({
        siret: cleanSiret,
        status: 'not_found',
        message: qualiopiDetails.error,
        qualifications: [],
        lastChecked: new Date().toISOString()
      });
    }

    console.log('Qualiopi check result:', {
      siret: cleanSiret,
      isQualiopi: qualiopiDetails.isQualiopi,
      certifications: qualiopiDetails.certifications
    });

    return NextResponse.json({
      siret: cleanSiret,
      raisonSociale: qualiopiDetails.raisonSociale,
      status: qualiopiDetails.isQualiopi ? 'certified' : 'not_certified',
      qualifications: qualiopiDetails.certifications,
      dateObtention: qualiopiDetails.dateObtention,
      dateFinValidite: qualiopiDetails.dateFinValidite,
      lastChecked: qualiopiDetails.lastChecked
    });

  } catch (error) {
    console.error('Error checking Qualiopi status:', error);
    return NextResponse.json({
      siret: cleanSiret,
      status: 'error',
      message: 'Erreur lors de la vérification Qualiopi',
      qualifications: [],
      lastChecked: new Date().toISOString()
    }, { status: 500 });
  }
}
