import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { users, juryProfiles } from '@/lib/db/schema';
import { eq, and, ilike, or, sql } from 'drizzle-orm';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const region = searchParams.get('region') || '';
    const certification = searchParams.get('certification') || '';
    const modality = searchParams.get('modality') || '';
    const availability = searchParams.get('availability') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build the query conditions
    let conditions = [
      eq(users.userType, 'jury'),
      eq(users.validationStatus, 'validated') // Only show validated juries
    ];

    // Add search conditions
    if (query) {
      conditions.push(
        or(
          ilike(juryProfiles.firstName, `%${query}%`),
          ilike(juryProfiles.lastName, `%${query}%`),
          sql`${juryProfiles.expertiseDomains}::text ILIKE ${'%' + query + '%'}`,
          ilike(juryProfiles.region, `%${query}%`),
          ilike(juryProfiles.city, `%${query}%`)
        )!
      );
    }

    if (region) {
      conditions.push(ilike(juryProfiles.region, `%${region}%`));
    }

    if (certification) {
      conditions.push(sql`${juryProfiles.expertiseDomains}::text ILIKE ${'%' + certification + '%'}`);
    }

    if (modality) {
      conditions.push(sql`${juryProfiles.workModalities}::text ILIKE ${'%' + modality + '%'}`);
    }

    // Fetch jury profiles with user data
    const juries = await db
      .select({
        id: juryProfiles.id,
        userId: users.id,
        firstName: juryProfiles.firstName,
        lastName: juryProfiles.lastName,
        profilePhotoUrl: juryProfiles.profilePhotoUrl,
        region: juryProfiles.region,
        city: juryProfiles.city,
        expertiseDomains: juryProfiles.expertiseDomains,
        certifications: juryProfiles.certifications,
        experienceYears: juryProfiles.experienceYears,
        currentPosition: juryProfiles.currentPosition,
        workModalities: juryProfiles.workModalities,
        interventionZones: juryProfiles.interventionZones,
        hourlyRate: juryProfiles.hourlyRate,
        bio: juryProfiles.bio,
        availabilityPreferences: juryProfiles.availabilityPreferences,
        email: users.email,
        validationStatus: users.validationStatus
      })
      .from(users)
      .innerJoin(juryProfiles, eq(users.id, juryProfiles.userId))
      .where(and(...conditions))
      .limit(limit)
      .offset(offset)
      .orderBy(juryProfiles.createdAt);

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .innerJoin(juryProfiles, eq(users.id, juryProfiles.userId))
      .where(and(...conditions));

    const totalCount = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Generate signed URLs for profile pictures
    const transformedJuries = await Promise.all(juries.map(async (jury) => {
      let signedPhotoUrl = null;
      
      if (jury.profilePhotoUrl) {
        // Extract the file path from the URL
        const urlParts = jury.profilePhotoUrl.split('/storage/v1/object/public/profile-pictures/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          const { data } = await supabase.storage
            .from('profile-pictures')
            .createSignedUrl(filePath, 3600); // 1 hour expiry
          
          signedPhotoUrl = data?.signedUrl || null;
        }
      }

      return {
        id: jury.id,
        name: `${jury.firstName} ${jury.lastName}`,
        location: `${jury.city}, ${jury.region}`,
        rating: Math.random() * 1 + 4, // Mock rating between 4-5
        reviewCount: Math.floor(Math.random() * 50) + 5, // Mock review count
        avatar: getAvatarEmoji(jury.expertiseDomains?.[0] || ''),
        expertise: jury.expertiseDomains || [],
        workModalities: jury.workModalities || [],
        status: getAvailabilityStatus(jury.availabilityPreferences),
        statusText: getAvailabilityText(jury.availabilityPreferences),
        experienceYears: jury.experienceYears,
        currentPosition: jury.currentPosition,
        hourlyRate: jury.hourlyRate,
        bio: jury.bio,
        profilePhotoUrl: signedPhotoUrl,
        interventionZones: jury.interventionZones
      };
    }));

    return NextResponse.json({
      success: true,
      data: transformedJuries,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching jury profiles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch jury profiles' },
      { status: 500 }
    );
  }
}

// Helper functions
function getAvatarEmoji(expertise: string): string {
  const emojiMap: { [key: string]: string } = {
    'Management': '👨‍💼',
    'Commerce': '👩‍💼',
    'Informatique': '👩‍💻',
    'Développement Web': '👨‍💻',
    'Marketing Digital': '📱',
    'Communication': '📢',
    'Immobilier': '🏢',
    'Formation': '👨‍🏫',
    'Beauté': '👩‍🎨',
    'Bien-être': '🧘‍♀️',
    'Industrie': '👨‍🔬',
    'Qualité': '🔍',
    'Comptabilité': '📊',
    'Gestion': '📈'
  };
  
  return emojiMap[expertise] || '👤';
}

function getAvailabilityStatus(availabilityPreferences: any): 'available' | 'busy' {
  if (!availabilityPreferences || !Array.isArray(availabilityPreferences)) {
    return 'available';
  }
  
  const now = new Date();
  const hasCurrentAvailability = availabilityPreferences.some((pref: any) => {
    const startDate = new Date(pref.startDate);
    const endDate = new Date(pref.endDate);
    return now >= startDate && now <= endDate;
  });
  
  return hasCurrentAvailability ? 'available' : 'busy';
}

function getAvailabilityText(availabilityPreferences: any): string {
  const status = getAvailabilityStatus(availabilityPreferences);
  
  if (status === 'available') {
    return 'Disponible';
  }
  
  // Find next availability
  if (availabilityPreferences && Array.isArray(availabilityPreferences)) {
    const now = new Date();
    const futureAvailabilities = availabilityPreferences
      .filter((pref: any) => new Date(pref.startDate) > now)
      .sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    
    if (futureAvailabilities.length > 0) {
      const nextAvailability = futureAvailabilities[0];
      const startDate = new Date(nextAvailability.startDate);
      const month = startDate.toLocaleDateString('fr-FR', { month: 'long' });
      return `Disponible ${month}`;
    }
  }
  
  return 'Contactez-moi';
}
