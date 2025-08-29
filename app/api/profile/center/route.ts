import { NextRequest, NextResponse } from 'next/server';
import { TrainingCenterService } from '@/lib/services/training-center-service';
import { withRLSContext } from '@/lib/auth/rls-context';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.userId;

    const result = await withRLSContext(userId, async () => {
      return await TrainingCenterService.getByUserId(userId);
    });

    if (!result) {
      return NextResponse.json({ error: 'Profil centre non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: result 
    });

  } catch (error) {
    console.error('Error fetching center profile:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du profil' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.userId;
    const profileData = await request.json();

    const result = await withRLSContext(userId, async () => {
      // Create training center profile
      const trainingCenterId = await TrainingCenterService.createProfile(userId, {
        siret: profileData.siret,
        name: profileData.establishmentName,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address,
        postalCode: profileData.postalCode,
        city: profileData.city,
        region: profileData.region,
        sector: profileData.sector,
        contactPersonName: profileData.responsiblePerson,
        contactPersonRole: profileData.responsibleRole,
        isCertificateur: profileData.isCertificateur || false,
        certificationDomains: Array.isArray(profileData.certificationDomains) ? profileData.certificationDomains : [],
        qualiopiCertified: profileData.qualiopiCertified || false,
        qualiopiStatus: profileData.qualiopiStatus,
        qualiopiLastChecked: profileData.qualiopiLastChecked ? new Date(profileData.qualiopiLastChecked) : null
      });

      // Mark user profile as completed
      await db
        .update(users)
        .set({ profileCompleted: true })
        .where(eq(users.id, userId));

      return { id: trainingCenterId };
    });

    return NextResponse.json({ 
      success: true, 
      data: result,
      message: 'Profil créé avec succès'
    });

  } catch (error) {
    console.error('Error creating center profile:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du profil' },
      { status: 500 }
    );
  }
}
