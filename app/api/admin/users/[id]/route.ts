import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/session';
import { db } from '@/lib/db/drizzle';
import { users, juryProfiles, trainingCenters } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const sessionCookie = request.cookies.get('session');
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const session = await verifyToken(sessionCookie.value);
    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Verify user is admin
    const adminUser = await db
      .select({ userType: users.userType })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!adminUser[0] || adminUser[0].userType !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Get user with detailed profile information
    const userDetails = await db
      .select({
        // User basic info
        id: users.id,
        name: users.name,
        email: users.email,
        userType: users.userType,
        validationStatus: users.validationStatus,
        lastLogin: users.lastLogin,
        emailVerified: users.emailVerified,
        profileCompleted: users.profileCompleted,
        createdAt: users.createdAt,
        deletedAt: users.deletedAt,
        
        // Jury profile info
        juryFirstName: juryProfiles.firstName,
        juryLastName: juryProfiles.lastName,
        juryProfilePhotoUrl: juryProfiles.profilePhotoUrl,
        juryRegion: juryProfiles.region,
        juryCity: juryProfiles.city,
        juryPhone: juryProfiles.phone,
        juryExpertiseDomains: juryProfiles.expertiseDomains,
        juryCertifications: juryProfiles.certifications,
        juryExperienceYears: juryProfiles.experienceYears,
        juryCurrentPosition: juryProfiles.currentPosition,
        juryCurrentCompany: juryProfiles.currentCompany,
        juryAvailabilityPreferences: juryProfiles.availabilityPreferences,
        juryWorkModalities: juryProfiles.workModalities,
        juryInterventionZones: juryProfiles.interventionZones,
        juryHourlyRate: juryProfiles.hourlyRate,
        juryBio: juryProfiles.bio,
        
        // Training center info
        centerName: trainingCenters.name,
        centerSiret: trainingCenters.siret,
        centerEmail: trainingCenters.email,
        centerPhone: trainingCenters.phone,
        centerAddress: trainingCenters.address,
        centerCity: trainingCenters.city,
        centerPostalCode: trainingCenters.postalCode,
        centerRegion: trainingCenters.region,
        centerContactPersonName: trainingCenters.contactPersonName,
        centerContactPersonRole: trainingCenters.contactPersonRole,
        centerContactPersonPhone: trainingCenters.contactPersonPhone,
        centerContactPersonEmail: trainingCenters.contactPersonEmail,
        centerLogoUrl: trainingCenters.logoUrl,
        centerWebsite: trainingCenters.website,
        centerDescription: trainingCenters.description,
        centerIsCertificateur: trainingCenters.isCertificateur,
        centerCertificationDomains: trainingCenters.certificationDomains,
        centerQualiopiCertified: trainingCenters.qualiopiCertified,
        centerQualiopiStatus: trainingCenters.qualiopiStatus,
        centerSector: trainingCenters.sector,
        centerSubscriptionTier: trainingCenters.subscriptionTier,
      })
      .from(users)
      .leftJoin(juryProfiles, eq(users.id, juryProfiles.userId))
      .leftJoin(trainingCenters, eq(users.id, trainingCenters.userId))
      .where(eq(users.id, userId))
      .limit(1);

    if (!userDetails[0]) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: userDetails[0],
    });

  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user details' },
      { status: 500 }
    );
  }
}
