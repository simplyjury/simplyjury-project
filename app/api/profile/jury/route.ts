import { NextRequest, NextResponse } from 'next/server';
import { JuryProfileService } from '@/lib/services/jury-profile-service';
import { withRLSContext } from '@/lib/auth/rls-context';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const profile = await JuryProfileService.getByUserId(session.userId);
    
    if (!profile) {
      return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error('Get jury profile error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du profil' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    
    // Update profile
    await JuryProfileService.updateProfile(session.userId, body);
    
    // Get updated profile
    const updatedProfile = await JuryProfileService.getByUserId(session.userId);
    
    return NextResponse.json({ success: true, data: updatedProfile });
  } catch (error) {
    console.error('Update jury profile error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du profil' },
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
      // Create jury profile
      const juryProfileId = await JuryProfileService.createProfile(userId, {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        profilePhotoUrl: profileData.profilePhotoUrl || null,
        region: profileData.region,
        city: profileData.city || null,
        expertiseDomains: Array.isArray(profileData.expertiseDomains) ? profileData.expertiseDomains : [],
        certifications: profileData.certifications ? [profileData.certifications] : [],
        experienceYears: profileData.yearsExperience ? parseInt(profileData.yearsExperience) : null,
        currentPosition: profileData.currentPosition || null,
        availabilityPreferences: profileData.availabilityPeriods || null,
        workModalities: Array.isArray(profileData.workModes) ? profileData.workModes : [],
        interventionZones: Array.isArray(profileData.interventionZones) ? profileData.interventionZones : [],
        hourlyRate: profileData.hourlyRate ? profileData.hourlyRate.toString() : null,
        bio: profileData.bio || null,
      });

      // Mark user profile as completed
      await db
        .update(users)
        .set({ profileCompleted: true })
        .where(eq(users.id, userId));

      return { id: juryProfileId };
    });

    return NextResponse.json({ 
      success: true, 
      data: result,
      message: 'Profil créé avec succès'
    });

  } catch (error) {
    console.error('Error creating jury profile:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du profil' },
      { status: 500 }
    );
  }
}
