import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { trainingCenters, users } from '@/lib/db/schema';
import { eq, and, ilike, or } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    // Get current user and verify they are a jury
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    if (user.userType !== 'jury') {
      return NextResponse.json(
        { error: 'Accès réservé aux jurys' },
        { status: 403 }
      );
    }

    // Get search query parameter
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    // Build base conditions
    const baseConditions = and(
      eq(users.userType, 'centre'),
      eq(users.validationStatus, 'validated')
    );

    // Add search conditions if provided
    const searchConditions = search.trim() 
      ? and(
          baseConditions,
          or(
            ilike(trainingCenters.name, `%${search}%`),
            ilike(trainingCenters.city, `%${search}%`),
            ilike(trainingCenters.region, `%${search}%`)
          )
        )
      : baseConditions;

    // Build and execute query - exclude ALL confidential contact information for jury access
    const centers = await db
      .select({
        id: trainingCenters.id,
        name: trainingCenters.name,
        // Exclude ALL contact information - email and phone are confidential
        // email: trainingCenters.email,
        // phone: trainingCenters.phone,
        city: trainingCenters.city,
        region: trainingCenters.region,
        sector: trainingCenters.sector,
        website: trainingCenters.website,
        description: trainingCenters.description,
        // Exclude confidential contact person fields for jury access
        // contactPersonName: trainingCenters.contactPersonName,
        // contactPersonRole: trainingCenters.contactPersonRole,
        // contactPersonEmail: trainingCenters.contactPersonEmail,
        // contactPersonPhone: trainingCenters.contactPersonPhone,
        isCertificateur: trainingCenters.isCertificateur,
        certificationDomains: trainingCenters.certificationDomains,
        qualiopiCertified: trainingCenters.qualiopiCertified,
        createdAt: trainingCenters.createdAt,
        userName: users.name,
        userValidationStatus: users.validationStatus
      })
      .from(trainingCenters)
      .leftJoin(users, eq(trainingCenters.userId, users.id))
      .where(searchConditions);

    return NextResponse.json({
      centers,
      count: centers.length
    });

  } catch (error) {
    console.error('Error fetching training centers:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des centres' },
      { status: 500 }
    );
  }
}
