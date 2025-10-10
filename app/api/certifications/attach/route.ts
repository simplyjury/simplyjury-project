import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { franceCompetenceCertifications, trainingCenters, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';

const API_URL = 'https://api.apprentissage.beta.gouv.fr/api';
const API_TOKEN = process.env.MISSION_APPRENTISSAGE_API_TOKEN;

async function getCurrentUser() {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return null;
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId)
    });

    return user;
  } catch (error) {
    return null;
  }
}

/**
 * POST /api/certifications/attach
 * Attach a certification to the training center
 */
export async function POST(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Get training center
    const trainingCenter = await db.query.trainingCenters.findFirst({
      where: eq(trainingCenters.userId, user.id)
    });

    if (!trainingCenter) {
      return NextResponse.json({ error: 'Centre de formation non trouvé' }, { status: 404 });
    }

    if (!trainingCenter.isCertificateur) {
      return NextResponse.json({ 
        error: 'Accès non autorisé. Seuls les centres certificateurs peuvent rattacher des certifications.' 
      }, { status: 403 });
    }

    // Get RNCP code from request
    const body = await request.json();
    const { rncpCode } = body;

    if (!rncpCode) {
      return NextResponse.json({ error: 'Code RNCP requis' }, { status: 400 });
    }

    // Validate RNCP format
    const rncpRegex = /^RNCP\d{3,5}$/;
    if (!rncpRegex.test(rncpCode)) {
      return NextResponse.json({ 
        error: 'Format de code RNCP invalide' 
      }, { status: 400 });
    }

    // Check API token
    if (!API_TOKEN) {
      console.error('Mission Apprentissage API token not configured');
      return NextResponse.json({ 
        error: 'Configuration API manquante' 
      }, { status: 500 });
    }

    // Fetch certification details from Mission Apprentissage API
    const apiResponse = await fetch(
      `${API_URL}/certification/v1?identifiant.rncp=${rncpCode}`,
      {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(10000)
      }
    );

    if (!apiResponse.ok) {
      return NextResponse.json({ 
        error: 'Erreur lors de la récupération des détails de la certification' 
      }, { status: apiResponse.status });
    }

    const certifications = await apiResponse.json();

    if (!certifications || certifications.length === 0) {
      return NextResponse.json({ 
        error: 'Certification non trouvée' 
      }, { status: 404 });
    }

    // Get the first (or active) certification
    const activeCert = certifications.find((c: any) => c.periode_validite?.rncp?.actif === true);
    const cert = activeCert || certifications[0];

    // Extract key information
    const title = cert.intitule?.rncp || 'Titre non disponible';
    const level = cert.intitule?.niveau?.rncp?.europeen || null;
    const domain = cert.domaines?.nsf?.rncp?.[0]?.intitule || null;
    const isActive = cert.periode_validite?.rncp?.actif || false;
    // Use debut_parcours (start of training) and fin_enregistrement (end of registration)
    const validityStart = cert.periode_validite?.rncp?.debut_parcours || cert.periode_validite?.rncp?.activation || null;
    const validityEnd = cert.periode_validite?.rncp?.fin_enregistrement || null;
    
    // Extract certificateurs information
    const certificateurs = cert.type?.certificateurs_rncp || [];
    const certificateurSiret = certificateurs.length > 0 ? certificateurs[0].siret : null;
    const certificateurName = certificateurs.length > 0 ? certificateurs[0].nom : null;
    
    // Check for SIRET mismatch
    const centerSiret = trainingCenter.siret;
    let siretMismatch = false;
    let approvalStatus = 'approved';
    let approvalRequestedAt = null;
    
    if (certificateurSiret && centerSiret) {
      const certSirets = certificateurs.map((c: any) => c.siret);
      siretMismatch = !certSirets.includes(centerSiret);
      
      if (siretMismatch) {
        approvalStatus = 'pending';
        approvalRequestedAt = new Date();
      }
    }

    // Check if certification already exists for this training center
    const existing = await db.query.franceCompetenceCertifications.findFirst({
      where: eq(franceCompetenceCertifications.fcCertificationId, rncpCode)
    });

    if (existing && existing.trainingCenterId === trainingCenter.id) {
      return NextResponse.json({ 
        error: 'Cette certification est déjà rattachée à votre centre' 
      }, { status: 409 });
    }

    // Insert certification into database
    const [newCertification] = await db
      .insert(franceCompetenceCertifications)
      .values({
        trainingCenterId: trainingCenter.id,
        fcCertificationId: rncpCode,
        title,
        code: rncpCode,
        level: level?.toString() || null,
        domain,
        status: isActive ? 'active' : 'inactive',
        validityStart: validityStart ? new Date(validityStart) : null,
        validityEnd: validityEnd ? new Date(validityEnd) : null,
        certificationDetails: cert, // Store complete API response
        // Approval workflow fields
        approvalStatus,
        siretMismatch,
        certificateurSiret,
        certificateurName,
        centerSiret,
        approvalRequestedAt,
        lastUpdated: new Date(),
        createdAt: new Date()
      })
      .returning();

    // Send email notification to admins if SIRET mismatch detected
    if (siretMismatch && certificateurName && certificateurSiret) {
      // Import dynamically to avoid issues
      const { sendCertificationValidationEmail } = await import('@/lib/actions/send-certification-validation-email');
      
      // Send email asynchronously (don't wait for it)
      sendCertificationValidationEmail({
        centerName: trainingCenter.name,
        certificationTitle: title,
        certificationCode: rncpCode,
        centerSiret: centerSiret || 'Non renseigné',
        certificateurName,
        certificateurSiret,
      }).catch((error) => {
        console.error('Failed to send certification validation email:', error);
        // Don't fail the request if email fails
      });
    }

    return NextResponse.json({
      success: true,
      certification: {
        id: newCertification.id,
        code: newCertification.code,
        title: newCertification.title,
        level: newCertification.level,
        domain: newCertification.domain,
        status: newCertification.status,
        validityEnd: newCertification.validityEnd,
        approvalStatus: newCertification.approvalStatus,
        siretMismatch: newCertification.siretMismatch,
        details: newCertification.certificationDetails
      },
      message: siretMismatch 
        ? 'Certification rattachée avec succès. Elle est en attente d\'approbation en raison d\'une non-concordance du SIRET.'
        : 'Certification rattachée avec succès.'
    });

  } catch (error) {
    console.error('Error attaching certification:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({ 
        error: 'Délai d\'attente dépassé' 
      }, { status: 504 });
    }

    return NextResponse.json({ 
      error: 'Erreur lors du rattachement de la certification' 
    }, { status: 500 });
  }
}
