import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { trainingCenters, users, franceCompetenceCertifications } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params;
    const centerId = parseInt(resolvedParams.id);
    
    if (isNaN(centerId)) {
      return NextResponse.json(
        { error: 'ID de centre invalide' },
        { status: 400 }
      );
    }

    // Fetch center details - exclude confidential information
    const centerResults = await db
      .select({
        id: trainingCenters.id,
        name: trainingCenters.name,
        siret: trainingCenters.siret,
        // Exclude email and phone - confidential
        address: trainingCenters.address,
        city: trainingCenters.city,
        postalCode: trainingCenters.postalCode,
        region: trainingCenters.region,
        // Exclude contact person details - confidential
        isCertificateur: trainingCenters.isCertificateur,
        certificationDomains: trainingCenters.certificationDomains,
        qualiopiCertified: trainingCenters.qualiopiCertified,
        qualiopiStatus: trainingCenters.qualiopiStatus,
        sector: trainingCenters.sector,
        website: trainingCenters.website,
        description: trainingCenters.description,
        logoUrl: trainingCenters.logoUrl,
        createdAt: trainingCenters.createdAt,
        userValidationStatus: users.validationStatus
      })
      .from(trainingCenters)
      .leftJoin(users, eq(trainingCenters.userId, users.id))
      .where(
        and(
          eq(trainingCenters.id, centerId),
          eq(users.userType, 'centre'),
          eq(users.validationStatus, 'validated')
        )
      );

    if (centerResults.length === 0) {
      return NextResponse.json(
        { error: 'Centre non trouvé' },
        { status: 404 }
      );
    }

    const center = centerResults[0];

    // Fetch attached RNCP certifications if center is certificateur
    let certifications: any[] = [];
    if (center.isCertificateur) {
      certifications = await db
        .select({
          id: franceCompetenceCertifications.id,
          fcCertificationId: franceCompetenceCertifications.fcCertificationId,
          title: franceCompetenceCertifications.title,
          code: franceCompetenceCertifications.code,
          level: franceCompetenceCertifications.level,
          domain: franceCompetenceCertifications.domain,
          status: franceCompetenceCertifications.status,
          validityStart: franceCompetenceCertifications.validityStart,
          validityEnd: franceCompetenceCertifications.validityEnd,
          approvalStatus: franceCompetenceCertifications.approvalStatus,
        })
        .from(franceCompetenceCertifications)
        .where(
          and(
            eq(franceCompetenceCertifications.trainingCenterId, centerId),
            eq(franceCompetenceCertifications.approvalStatus, 'approved')
          )
        );
    }

    // Generate signed URL for logo if exists
    let centerWithSignedUrl = { ...center };
    if (center.logoUrl) {
      try {
        const urlParts = center.logoUrl.split('/storage/v1/object/public/logo-centres/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          );
          
          const { data } = await supabase.storage
            .from('logo-centres')
            .createSignedUrl(filePath, 3600); // 1 hour expiry
          
          if (data?.signedUrl) {
            centerWithSignedUrl.logoUrl = data.signedUrl;
          }
        }
      } catch (error) {
        console.error('Error generating signed URL for center logo:', error);
      }
    }

    return NextResponse.json({
      center: centerWithSignedUrl,
      certifications
    });

  } catch (error) {
    console.error('Error fetching center details:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des détails du centre' },
      { status: 500 }
    );
  }
}
