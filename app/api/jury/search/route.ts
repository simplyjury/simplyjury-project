import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { users, juryProfiles } from '@/lib/db/schema';
import { eq, and, ilike, or, sql } from 'drizzle-orm';
import { createClient } from '@supabase/supabase-js';
import { getUser } from '@/lib/db/queries';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get current user and verify they are a center
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    if (user.userType !== 'centre') {
      return NextResponse.json(
        { error: 'Accès réservé aux centres de formation' },
        { status: 403 }
      );
    }
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
          ilike(users.name, `%${query}%`), // Add user.name to search
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
      // Check if certification is an RNCP code (starts with "RNCP")
      if (certification.toUpperCase().startsWith('RNCP')) {
        console.log('🔍 Filtering by RNCP:', certification);
        
        // Fetch ROME codes for this RNCP from Mission Apprentissage API
        try {
          const apiToken = process.env.MISSION_APPRENTISSAGE_API_TOKEN;
          const headers: HeadersInit = {
            'Accept': 'application/json',
            'User-Agent': 'SimplyJury/1.0'
          };
          
          // Add authorization if token is available
          if (apiToken) {
            headers['Authorization'] = `Bearer ${apiToken}`;
            console.log('✅ Using Mission Apprentissage API token');
          } else {
            console.warn('⚠️ No Mission Apprentissage API token found');
          }
          
          const rncpResponse = await fetch(
            `https://api.apprentissage.beta.gouv.fr/api/certification/v1?identifiant.rncp=${certification.toUpperCase()}`,
            {
              headers,
              signal: AbortSignal.timeout(5000)
            }
          );

          if (rncpResponse.ok) {
            const certifications = await rncpResponse.json();
            
            if (certifications && certifications.length > 0) {
              // Find active certification
              const activeCert = certifications.find((cert: any) => 
                cert.periode_validite?.rncp?.actif === true
              );
              const cert = activeCert || certifications[0];
              
              // Extract ROME codes
              const romeCodes = cert.domaines?.rome?.rncp?.map((r: any) => r.code) || [];
              
              console.log('📋 RNCP ROME codes:', romeCodes);
              
              if (romeCodes.length > 0) {
                // Filter juries that have at least one matching ROME code
                // Use sql.raw to properly format the array literal
                const romeCodesArray = `{${romeCodes.join(',')}}`;
                conditions.push(sql`
                  EXISTS (
                    SELECT 1 FROM unnest(${juryProfiles.romeCodes}) AS jury_rome
                    WHERE jury_rome = ANY(${romeCodesArray}::text[])
                  )
                `);
              } else {
                console.log('⚠️ No ROME codes found for RNCP:', certification);
                // If no ROME codes, return no results
                conditions.push(sql`false`);
              }
            } else {
              console.log('⚠️ RNCP not found:', certification);
              // If RNCP not found, return no results
              conditions.push(sql`false`);
            }
          } else {
            console.error('❌ RNCP API error:', rncpResponse.status);
            // On API error, don't filter by certification
          }
        } catch (error) {
          console.error('❌ Error fetching RNCP data:', error);
          // On error, don't filter by certification
        }
      } else {
        // Direct ROME code filtering (legacy support)
        conditions.push(sql`${certification} = ANY(${juryProfiles.romeCodes})`);
      }
    }

    if (modality) {
      if (modality === 'hybride') {
        // For hybrid, jury must have both "presentiel" and "visio" modalities
        conditions.push(sql`
          ${juryProfiles.workModalities}::text ILIKE '%presentiel%' 
          AND ${juryProfiles.workModalities}::text ILIKE '%visio%'
        `);
      } else {
        // For other modalities, check if the array contains the specific modality
        conditions.push(sql`${juryProfiles.workModalities}::text ILIKE ${'%' + modality + '%'}`);
      }
    }

    // Add availability filter
    if (availability === 'immediate') {
      // Filter for juries that have current availability (available now)
      conditions.push(sql`
        EXISTS (
          SELECT 1 FROM jsonb_array_elements(${juryProfiles.availabilityPreferences}) AS pref
          WHERE (pref->>'startDate')::date <= CURRENT_DATE 
          AND (pref->>'endDate')::date >= CURRENT_DATE
        )
      `);
    } else if (availability === 'planifiee') {
      // Filter for juries that have future availability (planned)
      conditions.push(sql`
        EXISTS (
          SELECT 1 FROM jsonb_array_elements(${juryProfiles.availabilityPreferences}) AS pref
          WHERE (pref->>'startDate')::date > CURRENT_DATE
        )
      `);
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
        romeCodes: juryProfiles.romeCodes,
        romeLabels: juryProfiles.romeLabels,
        certifications: juryProfiles.certifications,
        experienceYears: juryProfiles.experienceYears,
        currentPosition: juryProfiles.currentPosition,
        workModalities: juryProfiles.workModalities,
        interventionZones: juryProfiles.interventionZones,
        hourlyRate: juryProfiles.hourlyRate,
        bio: juryProfiles.bio,
        availabilityPreferences: juryProfiles.availabilityPreferences,
        email: users.email,
        validationStatus: users.validationStatus,
        displayName: users.name
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

    // Fetch ratings for all juries in one query
    const juryUserIds = juries.map(jury => jury.userId);
    let ratingsMap: Record<number, { averageRating: number; totalRatings: number }> = {};
    
    if (juryUserIds.length > 0) {
      const { data: ratings } = await supabase
        .from('session_ratings')
        .select('rated_id, overall_rating')
        .in('rated_id', juryUserIds)
        .eq('rater_type', 'centre')
        .eq('status', 'active');

      // Group ratings by jury user ID and calculate averages
      if (ratings) {
        const groupedRatings = ratings.reduce((acc: Record<number, number[]>, rating) => {
          if (!acc[rating.rated_id]) {
            acc[rating.rated_id] = [];
          }
          acc[rating.rated_id].push(parseFloat(rating.overall_rating));
          return acc;
        }, {});

        ratingsMap = Object.keys(groupedRatings).reduce((acc, juryId) => {
          const juryIdNum = parseInt(juryId);
          const juryRatings = groupedRatings[juryIdNum];
          const averageRating = juryRatings.reduce((sum, rating) => sum + rating, 0) / juryRatings.length;
          
          acc[juryIdNum] = {
            averageRating: Math.round(averageRating * 10) / 10,
            totalRatings: juryRatings.length
          };
          return acc;
        }, {} as Record<number, { averageRating: number; totalRatings: number }>);
      }
    }

    // Generate signed URLs for profile pictures
    const transformedJuries = await Promise.all(juries.map(async (jury) => {
      let signedPhotoUrl = null;
      
      if (jury.profilePhotoUrl) {
        console.log('🔍 SEARCH-API: Processing profile photo for', {
          juryName: `${jury.firstName} ${jury.lastName}`,
          originalUrl: jury.profilePhotoUrl,
          hasToken: jury.profilePhotoUrl.includes('token=')
        });
        
        // Check if it's already a signed URL (contains token parameter)
        if (jury.profilePhotoUrl.includes('token=')) {
          // Already a signed URL, use it directly
          signedPhotoUrl = jury.profilePhotoUrl;
          console.log('🔍 SEARCH-API: Using existing signed URL');
        } else {
          // Extract the file path from the URL - handle both public and sign URLs
          let filePath = null;
          
          // Try public URL format first
          let urlParts = jury.profilePhotoUrl.split('/storage/v1/object/public/profile-pictures/');
          if (urlParts.length > 1) {
            filePath = urlParts[1];
            console.log('🔍 SEARCH-API: Extracted path from public URL:', filePath);
          } else {
            // Try sign URL format
            urlParts = jury.profilePhotoUrl.split('/storage/v1/object/sign/profile-pictures/');
            if (urlParts.length > 1) {
              filePath = urlParts[1].split('?')[0]; // Remove any existing query parameters
              console.log('🔍 SEARCH-API: Extracted path from sign URL:', filePath);
            }
          }
          
          if (filePath) {
            const { data } = await supabase.storage
              .from('profile-pictures')
              .createSignedUrl(filePath, 3600); // 1 hour expiry
            
            signedPhotoUrl = data?.signedUrl || null;
            console.log('🔍 SEARCH-API: Generated new signed URL:', !!signedPhotoUrl);
          } else {
            console.log('🔍 SEARCH-API: Could not extract file path from URL');
          }
        }
      }
      
      console.log('🔍 SEARCH-API: Final result for', `${jury.firstName} ${jury.lastName}`, {
        hasProfilePhoto: !!signedPhotoUrl,
        profilePhotoUrl: signedPhotoUrl
      });

      return {
        id: jury.id,
        userId: jury.userId, // Add the user ID for API requests
        name: jury.displayName || `${jury.firstName} ${jury.lastName}`, // Use display name first, fallback to formal name
        displayName: jury.displayName,
        formalName: `${jury.firstName} ${jury.lastName}`,
        location: `${jury.city}, ${jury.region}`,
        rating: ratingsMap[jury.userId]?.averageRating || 0,
        reviewCount: ratingsMap[jury.userId]?.totalRatings || 0,
        avatar: getAvatarEmoji(jury.romeLabels?.[0] || jury.expertiseDomains?.[0] || ''),
        expertise: jury.romeLabels || jury.expertiseDomains || [], // Use ROME labels, fallback to old expertiseDomains
        expertiseDomains: jury.expertiseDomains || [],
        romeCodes: jury.romeCodes || [],
        romeLabels: jury.romeLabels || [],
        workModalities: jury.workModalities || [],
        status: getAvailabilityStatus(jury.availabilityPreferences),
        statusText: getAvailabilityText(jury.availabilityPreferences),
        experienceYears: jury.experienceYears,
        currentPosition: jury.currentPosition,
        hourlyRate: jury.hourlyRate,
        bio: jury.bio,
        profilePhotoUrl: signedPhotoUrl,
        interventionZones: jury.interventionZones,
        availabilityPreferences: jury.availabilityPreferences
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
  
  return 'Non disponible';
}
