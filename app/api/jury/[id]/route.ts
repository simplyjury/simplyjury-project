import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { users, juryProfiles } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const juryUserId = parseInt(id);

    if (isNaN(juryUserId)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    // Fetch jury profile with user data
    const [juryData] = await db
      .select({
        userId: users.id,
        name: users.name,
        email: users.email,
        profileId: juryProfiles.id,
        firstName: juryProfiles.firstName,
        lastName: juryProfiles.lastName,
        profilePhotoUrl: juryProfiles.profilePhotoUrl,
        region: juryProfiles.region,
        city: juryProfiles.city,
        phone: juryProfiles.phone,
        bio: juryProfiles.bio,
        currentPosition: juryProfiles.currentPosition,
        experienceYears: juryProfiles.experienceYears,
        expertiseDomains: juryProfiles.expertiseDomains,
        romeCodes: juryProfiles.romeCodes,
        romeLabels: juryProfiles.romeLabels,
        certifications: juryProfiles.certifications,
        workModalities: juryProfiles.workModalities,
        interventionZones: juryProfiles.interventionZones,
        availabilityPreferences: juryProfiles.availabilityPreferences,
        hourlyRate: juryProfiles.hourlyRate,
      })
      .from(users)
      .innerJoin(juryProfiles, eq(juryProfiles.userId, users.id))
      .where(and(
        eq(users.id, juryUserId),
        isNull(users.deletedAt)
      ))
      .limit(1);

    if (!juryData) {
      return NextResponse.json({ error: 'Jury non trouvé' }, { status: 404 });
    }

    // Get jury ratings
    const ratingsResponse = await fetch(
      `${request.nextUrl.origin}/api/jury-ratings-summary?jury_ids=${juryUserId}`
    );
    const ratingsData = await ratingsResponse.json();
    const rating = ratingsData.success && ratingsData.data[juryUserId] 
      ? ratingsData.data[juryUserId].averageRating 
      : 0;
    const reviewCount = ratingsData.success && ratingsData.data[juryUserId]
      ? ratingsData.data[juryUserId].totalRatings
      : 0;

    // Format the response to match JuryProfile interface
    const profile = {
      id: juryData.profileId,
      userId: juryData.userId,
      name: juryData.name || `${juryData.firstName} ${juryData.lastName}`,
      location: `${juryData.city || ''}, ${juryData.region || ''}`.trim().replace(/^,\s*/, ''),
      rating,
      reviewCount,
      avatar: juryData.firstName && juryData.lastName 
        ? `${juryData.firstName[0]}${juryData.lastName[0]}`.toUpperCase()
        : 'JU',
      expertiseDomains: juryData.expertiseDomains || [],
      romeCodes: juryData.romeCodes || [],
      romeLabels: juryData.romeLabels || [],
      workModalities: juryData.workModalities || [],
      interventionZones: juryData.interventionZones || [],
      bio: juryData.bio || '',
      currentPosition: juryData.currentPosition || '',
      experienceYears: juryData.experienceYears || 0,
      hourlyRate: parseFloat(juryData.hourlyRate || '0'),
      profilePhotoUrl: juryData.profilePhotoUrl,
      email: juryData.email,
      phone: juryData.phone,
      certifications: juryData.certifications || [],
      availabilityPreferences: juryData.availabilityPreferences || [],
    };

    return NextResponse.json({
      success: true,
      data: profile,
    });

  } catch (error) {
    console.error('Error fetching jury profile:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du profil' },
      { status: 500 }
    );
  }
}
