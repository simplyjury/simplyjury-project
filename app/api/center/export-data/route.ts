import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSession } from '@/lib/auth/session';
import * as XLSX from 'xlsx';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getCurrentUser() {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return null;
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.userId)
      .single();

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
}

function formatDate(date: string | null): string {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('fr-FR');
}

function formatDateTime(date: string | null): string {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('fr-FR');
}

function translateStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': 'En attente',
    'accepted': 'Acceptée',
    'declined': 'Refusée',
    'completed': 'Terminée',
    'cancelled': 'Annulée',
  };
  return statusMap[status] || status;
}

function translateModality(modality: string): string {
  const modalityMap: Record<string, string> = {
    'presentiel': 'Présentiel',
    'visio': 'Visioconférence',
    'hybride': 'Hybride',
  };
  return modalityMap[modality] || modality;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Verify user is a training center
    if (user.user_type !== 'centre') {
      return NextResponse.json(
        { error: 'Accès non autorisé. Cette fonctionnalité est réservée aux centres de formation.' },
        { status: 403 }
      );
    }

    // Get training center profile
    const { data: trainingCenter, error: centerError } = await supabase
      .from('training_centers')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (centerError || !trainingCenter) {
      return NextResponse.json(
        { error: 'Profil du centre non trouvé' },
        { status: 404 }
      );
    }

    // Get all jury requests (sent by this center)
    const { data: juryRequests, error: requestsError } = await supabase
      .from('jury_requests')
      .select(`
        *,
        users!jury_requests_jury_id_fkey(
          id,
          name,
          email
        )
      `)
      .eq('training_center_id', trainingCenter.id)
      .order('created_at', { ascending: false });

    // Get ratings given by this center (to juries)
    const { data: ratingsGiven, error: ratingsGivenError } = await supabase
      .from('session_ratings')
      .select(`
        *,
        jury_requests!inner(
          id,
          certification_title,
          certification_code,
          session_date,
          jury_id,
          training_center_id
        ),
        users!session_ratings_rated_id_fkey(
          name,
          email
        )
      `)
      .eq('jury_requests.training_center_id', trainingCenter.id)
      .eq('rater_type', 'centre');

    // Get ratings received by this center (from juries)
    const { data: ratingsReceived, error: ratingsReceivedError } = await supabase
      .from('session_ratings')
      .select(`
        *,
        jury_requests!inner(
          id,
          certification_title,
          certification_code,
          session_date,
          jury_id,
          training_center_id
        ),
        users!session_ratings_rater_id_fkey(
          name,
          email
        )
      `)
      .eq('jury_requests.training_center_id', trainingCenter.id)
      .eq('rater_type', 'jury');

    // Get France Compétence certifications (if certificateur)
    let franceCompetenceCertifications = [];
    if (trainingCenter.is_certificateur) {
      const { data: certifications, error: certsError } = await supabase
        .from('france_competence_certifications')
        .select(`
          *,
          certification_stats(*)
        `)
        .eq('training_center_id', trainingCenter.id);

      if (!certsError && certifications) {
        franceCompetenceCertifications = certifications;
      }
    }

    // Create Excel workbook
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Center Information
    const centerInfoData = [
      ['INFORMATIONS DU CENTRE DE FORMATION'],
      [''],
      ['Nom de l\'établissement', trainingCenter.name],
      ['SIRET', trainingCenter.siret],
      ['Email', trainingCenter.email],
      ['Téléphone', trainingCenter.phone || 'Non renseigné'],
      ['Adresse', trainingCenter.address || 'Non renseignée'],
      ['Ville', trainingCenter.city || 'Non renseignée'],
      ['Code postal', trainingCenter.postal_code || 'Non renseigné'],
      ['Région', trainingCenter.region || 'Non renseignée'],
      ['Site web', trainingCenter.website || 'Non renseigné'],
      [''],
      ['Personne référente', trainingCenter.contact_person_name || 'Non renseignée'],
      ['Rôle', trainingCenter.contact_person_role || 'Non renseigné'],
      ['Email référent', trainingCenter.contact_person_email || 'Non renseigné'],
      ['Téléphone référent', trainingCenter.contact_person_phone || 'Non renseigné'],
      [''],
      ['Certificateur', trainingCenter.is_certificateur ? 'Oui' : 'Non'],
      ['Certifié Qualiopi', trainingCenter.qualiopi_certified ? 'Oui' : 'Non'],
      ['Plan d\'abonnement', trainingCenter.subscription_tier || 'Gratuit'],
      [''],
      ['Date de création du compte', formatDateTime(trainingCenter.created_at)],
      ['Dernière mise à jour', formatDateTime(trainingCenter.updated_at)],
    ];

    const centerInfoSheet = XLSX.utils.aoa_to_sheet(centerInfoData);
    centerInfoSheet['!cols'] = [{ wch: 30 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(workbook, centerInfoSheet, 'Informations Centre');

    // Sheet 2: All Jury Requests
    const requestsData = [
      ['ID', 'Jury', 'Email Jury', 'Certification', 'Date de session', 'Heure début', 'Heure fin', 'Modalité', 'Lieu', 'Nombre de candidats', 'Statut', 'Date de création', 'Dernière mise à jour']
    ];

    if (juryRequests && juryRequests.length > 0) {
      juryRequests.forEach((req: any) => {
        requestsData.push([
          req.id,
          req.users?.name || 'N/A',
          req.users?.email || 'N/A',
          req.certification_type || 'N/A',
          formatDate(req.session_date),
          req.start_time || 'N/A',
          req.end_time || 'N/A',
          translateModality(req.modality || ''),
          req.location || 'N/A',
          req.candidate_count || 0,
          translateStatus(req.status),
          formatDateTime(req.created_at),
          formatDateTime(req.updated_at),
        ]);
      });
    }

    const requestsSheet = XLSX.utils.aoa_to_sheet(requestsData);
    requestsSheet['!cols'] = [
      { wch: 8 }, { wch: 25 }, { wch: 30 }, { wch: 30 }, { wch: 15 },
      { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 30 }, { wch: 12 },
      { wch: 15 }, { wch: 20 }, { wch: 20 }
    ];
    XLSX.utils.book_append_sheet(workbook, requestsSheet, 'Demandes Envoyées');

    // Sheet 3: Completed Sessions Only
    const completedSessions = juryRequests?.filter((req: any) => req.status === 'completed') || [];
    const sessionsData = [
      ['ID', 'Jury', 'Certification', 'Date de session', 'Heure début', 'Heure fin', 'Modalité', 'Lieu', 'Nombre de candidats', 'Date de création']
    ];

    completedSessions.forEach((req: any) => {
      sessionsData.push([
        req.id,
        req.users?.name || 'N/A',
        req.certification_type || 'N/A',
        formatDate(req.session_date),
        req.start_time || 'N/A',
        req.end_time || 'N/A',
        translateModality(req.modality || ''),
        req.location || 'N/A',
        req.candidate_count || 0,
        formatDateTime(req.created_at),
      ]);
    });

    const sessionsSheet = XLSX.utils.aoa_to_sheet(sessionsData);
    sessionsSheet['!cols'] = [
      { wch: 8 }, { wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 12 },
      { wch: 12 }, { wch: 15 }, { wch: 30 }, { wch: 12 }, { wch: 20 }
    ];
    XLSX.utils.book_append_sheet(workbook, sessionsSheet, 'Sessions Réalisées');

    // Sheet 4: Ratings Given
    const ratingsGivenData = [
      ['ID Évaluation', 'Jury', 'Certification', 'Date de session', 'Note globale', 'Ponctualité', 'Expertise', 'Communication', 'Commentaire', 'Date d\'évaluation']
    ];

    if (ratingsGiven && ratingsGiven.length > 0) {
      ratingsGiven.forEach((rating: any) => {
        ratingsGivenData.push([
          rating.id,
          rating.users?.name || 'N/A',
          rating.jury_requests?.certification_title || rating.jury_requests?.certification_code || 'N/A',
          formatDate(rating.jury_requests?.session_date),
          rating.overall_rating || 'N/A',
          rating.punctuality_rating || 'N/A',
          rating.expertise_rating || 'N/A',
          rating.communication_rating || 'N/A',
          rating.comment || 'Aucun commentaire',
          formatDateTime(rating.created_at),
        ]);
      });
    }

    const ratingsGivenSheet = XLSX.utils.aoa_to_sheet(ratingsGivenData);
    ratingsGivenSheet['!cols'] = [
      { wch: 12 }, { wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 12 },
      { wch: 12 }, { wch: 18 }, { wch: 12 }, { wch: 50 }, { wch: 20 }
    ];
    XLSX.utils.book_append_sheet(workbook, ratingsGivenSheet, 'Évaluations Données');

    // Sheet 5: Ratings Received
    const ratingsReceivedData = [
      ['ID Évaluation', 'Jury', 'Certification', 'Date de session', 'Note globale', 'Communication', 'Ponctualité', 'Expertise', 'Commentaire', 'Date d\'évaluation']
    ];

    if (ratingsReceived && ratingsReceived.length > 0) {
      ratingsReceived.forEach((rating: any) => {
        ratingsReceivedData.push([
          rating.id,
          rating.users?.name || 'N/A',
          rating.jury_requests?.certification_title || rating.jury_requests?.certification_code || 'N/A',
          formatDate(rating.jury_requests?.session_date),
          rating.overall_rating || 'N/A',
          rating.communication_rating || 'N/A',
          rating.punctuality_rating || 'N/A',
          rating.expertise_rating || 'N/A',
          rating.comment || 'Aucun commentaire',
          formatDateTime(rating.created_at),
        ]);
      });
    }

    const ratingsReceivedSheet = XLSX.utils.aoa_to_sheet(ratingsReceivedData);
    ratingsReceivedSheet['!cols'] = [
      { wch: 12 }, { wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 12 },
      { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 50 }, { wch: 20 }
    ];
    XLSX.utils.book_append_sheet(workbook, ratingsReceivedSheet, 'Évaluations Reçues');

    // Sheet 6: France Compétence Certifications (if certificateur)
    if (trainingCenter.is_certificateur && franceCompetenceCertifications.length > 0) {
      const certificationsData = [
        ['ID Certification', 'Titre', 'Code', 'Niveau', 'Domaine', 'Statut', 'Date de début', 'Date de fin', 'Dernière mise à jour']
      ];

      franceCompetenceCertifications.forEach((cert: any) => {
        certificationsData.push([
          cert.fc_certification_id || 'N/A',
          cert.title || 'N/A',
          cert.code || 'N/A',
          cert.level || 'N/A',
          cert.domain || 'N/A',
          cert.status || 'N/A',
          formatDate(cert.validity_start),
          formatDate(cert.validity_end),
          formatDateTime(cert.last_updated),
        ]);
      });

      const certificationsSheet = XLSX.utils.aoa_to_sheet(certificationsData);
      certificationsSheet['!cols'] = [
        { wch: 15 }, { wch: 50 }, { wch: 15 }, { wch: 15 }, { wch: 30 },
        { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }
      ];
      XLSX.utils.book_append_sheet(workbook, certificationsSheet, 'Certifications FC');
    }

    // Sheet 7: Statistics
    const totalRequests = juryRequests?.length || 0;
    const pendingRequests = juryRequests?.filter((r: any) => r.status === 'pending').length || 0;
    const acceptedRequests = juryRequests?.filter((r: any) => r.status === 'accepted').length || 0;
    const declinedRequests = juryRequests?.filter((r: any) => r.status === 'declined').length || 0;
    const completedSessionsCount = completedSessions.length;
    const cancelledRequests = juryRequests?.filter((r: any) => r.status === 'cancelled').length || 0;

    const statsData = [
      ['STATISTIQUES GLOBALES'],
      [''],
      ['Indicateur', 'Valeur'],
      ['Total de demandes envoyées', totalRequests],
      ['Demandes en attente', pendingRequests],
      ['Demandes acceptées', acceptedRequests],
      ['Demandes refusées', declinedRequests],
      ['Sessions terminées', completedSessionsCount],
      ['Demandes annulées', cancelledRequests],
      [''],
      ['Taux d\'acceptation', totalRequests > 0 ? `${((acceptedRequests / totalRequests) * 100).toFixed(1)}%` : '0%'],
      ['Taux de complétion', acceptedRequests > 0 ? `${((completedSessionsCount / acceptedRequests) * 100).toFixed(1)}%` : '0%'],
      [''],
      ['Évaluations données', ratingsGiven?.length || 0],
      ['Évaluations reçues', ratingsReceived?.length || 0],
      [''],
      ['Date d\'export', formatDateTime(new Date().toISOString())],
    ];

    const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
    statsSheet['!cols'] = [{ wch: 35 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, statsSheet, 'Statistiques');

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Create filename with center name and date
    const fileName = `SimplyJury_Export_${trainingCenter.name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Return Excel file
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });

  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export des données' },
      { status: 500 }
    );
  }
}
