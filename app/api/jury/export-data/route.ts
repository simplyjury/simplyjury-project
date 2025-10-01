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

    // Verify user is a jury
    if (user.user_type !== 'jury') {
      return NextResponse.json(
        { error: 'Accès non autorisé. Cette fonctionnalité est réservée aux jurys.' },
        { status: 403 }
      );
    }

    // Get jury profile
    const { data: juryProfile, error: profileError } = await supabase
      .from('jury_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError || !juryProfile) {
      return NextResponse.json(
        { error: 'Profil jury non trouvé' },
        { status: 404 }
      );
    }

    // Get all jury requests (received by this jury)
    const { data: juryRequests, error: requestsError } = await supabase
      .from('jury_requests')
      .select(`
        *,
        training_centers!inner(
          id,
          name,
          email,
          phone,
          city,
          region
        )
      `)
      .eq('jury_id', user.id)
      .order('created_at', { ascending: false });

    // Get ratings given by this jury to centers
    const { data: ratingsGiven, error: ratingsGivenError } = await supabase
      .from('center_ratings')
      .select(`
        *,
        jury_requests!inner(
          id,
          certification_type,
          session_date,
          training_center_id
        ),
        training_centers!center_ratings_training_center_id_fkey(
          name
        )
      `)
      .eq('jury_id', user.id);

    // Get ratings received by this jury from centers
    const { data: ratingsReceived, error: ratingsReceivedError } = await supabase
      .from('jury_ratings')
      .select(`
        *,
        jury_requests!inner(
          id,
          certification_type,
          session_date,
          training_center_id
        ),
        training_centers!jury_ratings_training_center_id_fkey(
          name
        )
      `)
      .eq('jury_id', user.id)
      .eq('rated_by_center', true);

    // Create Excel workbook
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Jury Profile Information
    const profileInfoData = [
      ['INFORMATIONS DU PROFIL JURY'],
      [''],
      ['Prénom', juryProfile.first_name],
      ['Nom', juryProfile.last_name],
      ['Email', user.email],
      ['Téléphone', juryProfile.phone || 'Non renseigné'],
      ['Région', juryProfile.region || 'Non renseignée'],
      ['Ville', juryProfile.city || 'Non renseignée'],
      [''],
      ['Poste actuel', juryProfile.current_position || 'Non renseigné'],
      ['Entreprise actuelle', juryProfile.current_company || 'Non renseignée'],
      ['Années d\'expérience', juryProfile.experience_years || 'Non renseigné'],
      ['Tarif horaire', juryProfile.hourly_rate ? `${juryProfile.hourly_rate} €` : 'Non renseigné'],
      [''],
      ['Domaines d\'expertise', juryProfile.expertise_domains?.join(', ') || 'Non renseignés'],
      ['Certifications', juryProfile.certifications?.join(', ') || 'Non renseignées'],
      ['Modalités de travail', juryProfile.work_modalities?.join(', ') || 'Non renseignées'],
      ['Zones d\'intervention', juryProfile.intervention_zones?.join(', ') || 'Non renseignées'],
      [''],
      ['Date de création du profil', formatDateTime(juryProfile.created_at)],
      ['Dernière mise à jour', formatDateTime(juryProfile.updated_at)],
    ];

    const profileInfoSheet = XLSX.utils.aoa_to_sheet(profileInfoData);
    profileInfoSheet['!cols'] = [{ wch: 30 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(workbook, profileInfoSheet, 'Profil Jury');

    // Sheet 2: All Jury Requests Received
    const requestsData = [
      ['ID', 'Centre de formation', 'Email Centre', 'Téléphone', 'Ville', 'Région', 'Certification', 'Date de session', 'Heure début', 'Heure fin', 'Modalité', 'Lieu', 'Nombre de candidats', 'Statut', 'Date de demande', 'Dernière mise à jour']
    ];

    if (juryRequests && juryRequests.length > 0) {
      juryRequests.forEach((req: any) => {
        const center = req.training_centers;
        requestsData.push([
          req.id,
          center?.name || 'N/A',
          center?.email || 'N/A',
          center?.phone || 'N/A',
          center?.city || 'N/A',
          center?.region || 'N/A',
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
      { wch: 8 }, { wch: 30 }, { wch: 30 }, { wch: 15 }, { wch: 20 },
      { wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 12 }, { wch: 12 },
      { wch: 15 }, { wch: 30 }, { wch: 12 }, { wch: 15 }, { wch: 20 }, { wch: 20 }
    ];
    XLSX.utils.book_append_sheet(workbook, requestsSheet, 'Demandes Reçues');

    // Sheet 3: Accepted Missions Only
    const acceptedMissions = juryRequests?.filter((req: any) => req.status === 'accepted') || [];
    const missionsData = [
      ['ID', 'Centre de formation', 'Certification', 'Date de session', 'Heure début', 'Heure fin', 'Modalité', 'Lieu', 'Nombre de candidats', 'Date d\'acceptation']
    ];

    acceptedMissions.forEach((req: any) => {
      const center = req.training_centers;
      missionsData.push([
        req.id,
        center?.name || 'N/A',
        req.certification_type || 'N/A',
        formatDate(req.session_date),
        req.start_time || 'N/A',
        req.end_time || 'N/A',
        translateModality(req.modality || ''),
        req.location || 'N/A',
        req.candidate_count || 0,
        formatDateTime(req.updated_at),
      ]);
    });

    const missionsSheet = XLSX.utils.aoa_to_sheet(missionsData);
    missionsSheet['!cols'] = [
      { wch: 8 }, { wch: 30 }, { wch: 30 }, { wch: 15 }, { wch: 12 },
      { wch: 12 }, { wch: 15 }, { wch: 30 }, { wch: 12 }, { wch: 20 }
    ];
    XLSX.utils.book_append_sheet(workbook, missionsSheet, 'Missions Acceptées');

    // Sheet 4: Completed Missions Only
    const completedMissions = juryRequests?.filter((req: any) => req.status === 'completed') || [];
    const completedData = [
      ['ID', 'Centre de formation', 'Certification', 'Date de session', 'Heure début', 'Heure fin', 'Modalité', 'Lieu', 'Nombre de candidats', 'Date de complétion']
    ];

    completedMissions.forEach((req: any) => {
      const center = req.training_centers;
      completedData.push([
        req.id,
        center?.name || 'N/A',
        req.certification_type || 'N/A',
        formatDate(req.session_date),
        req.start_time || 'N/A',
        req.end_time || 'N/A',
        translateModality(req.modality || ''),
        req.location || 'N/A',
        req.candidate_count || 0,
        formatDateTime(req.updated_at),
      ]);
    });

    const completedSheet = XLSX.utils.aoa_to_sheet(completedData);
    completedSheet['!cols'] = [
      { wch: 8 }, { wch: 30 }, { wch: 30 }, { wch: 15 }, { wch: 12 },
      { wch: 12 }, { wch: 15 }, { wch: 30 }, { wch: 12 }, { wch: 20 }
    ];
    XLSX.utils.book_append_sheet(workbook, completedSheet, 'Missions Réalisées');

    // Sheet 5: Ratings Given to Centers
    const ratingsGivenData = [
      ['ID Évaluation', 'Centre de formation', 'Certification', 'Date de session', 'Note globale', 'Communication', 'Organisation', 'Conditions', 'Commentaire', 'Date d\'évaluation']
    ];

    if (ratingsGiven && ratingsGiven.length > 0) {
      ratingsGiven.forEach((rating: any) => {
        ratingsGivenData.push([
          rating.id,
          rating.training_centers?.name || 'N/A',
          rating.jury_requests?.certification_type || 'N/A',
          formatDate(rating.jury_requests?.session_date),
          rating.overall_rating || 'N/A',
          rating.communication_rating || 'N/A',
          rating.organization_rating || 'N/A',
          rating.conditions_rating || 'N/A',
          rating.comment || 'Aucun commentaire',
          formatDateTime(rating.created_at),
        ]);
      });
    }

    const ratingsGivenSheet = XLSX.utils.aoa_to_sheet(ratingsGivenData);
    ratingsGivenSheet['!cols'] = [
      { wch: 12 }, { wch: 30 }, { wch: 30 }, { wch: 15 }, { wch: 12 },
      { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 50 }, { wch: 20 }
    ];
    XLSX.utils.book_append_sheet(workbook, ratingsGivenSheet, 'Évaluations Données');

    // Sheet 6: Ratings Received from Centers
    const ratingsReceivedData = [
      ['ID Évaluation', 'Centre de formation', 'Certification', 'Date de session', 'Note globale', 'Ponctualité', 'Professionnalisme', 'Pédagogie', 'Commentaire', 'Date d\'évaluation']
    ];

    if (ratingsReceived && ratingsReceived.length > 0) {
      ratingsReceived.forEach((rating: any) => {
        ratingsReceivedData.push([
          rating.id,
          rating.training_centers?.name || 'N/A',
          rating.jury_requests?.certification_type || 'N/A',
          formatDate(rating.jury_requests?.session_date),
          rating.overall_rating || 'N/A',
          rating.punctuality_rating || 'N/A',
          rating.professionalism_rating || 'N/A',
          rating.pedagogy_rating || 'N/A',
          rating.comment || 'Aucun commentaire',
          formatDateTime(rating.created_at),
        ]);
      });
    }

    const ratingsReceivedSheet = XLSX.utils.aoa_to_sheet(ratingsReceivedData);
    ratingsReceivedSheet['!cols'] = [
      { wch: 12 }, { wch: 30 }, { wch: 30 }, { wch: 15 }, { wch: 12 },
      { wch: 12 }, { wch: 18 }, { wch: 12 }, { wch: 50 }, { wch: 20 }
    ];
    XLSX.utils.book_append_sheet(workbook, ratingsReceivedSheet, 'Évaluations Reçues');

    // Sheet 7: Statistics
    const totalRequests = juryRequests?.length || 0;
    const pendingRequests = juryRequests?.filter((r: any) => r.status === 'pending').length || 0;
    const acceptedRequests = acceptedMissions.length;
    const declinedRequests = juryRequests?.filter((r: any) => r.status === 'declined').length || 0;
    const completedMissionsCount = completedMissions.length;
    const cancelledRequests = juryRequests?.filter((r: any) => r.status === 'cancelled').length || 0;

    const statsData = [
      ['STATISTIQUES GLOBALES'],
      [''],
      ['Indicateur', 'Valeur'],
      ['Total de demandes reçues', totalRequests],
      ['Demandes en attente', pendingRequests],
      ['Missions acceptées', acceptedRequests],
      ['Demandes refusées', declinedRequests],
      ['Missions réalisées', completedMissionsCount],
      ['Demandes annulées', cancelledRequests],
      [''],
      ['Taux d\'acceptation', totalRequests > 0 ? `${((acceptedRequests / totalRequests) * 100).toFixed(1)}%` : '0%'],
      ['Taux de complétion', acceptedRequests > 0 ? `${((completedMissionsCount / acceptedRequests) * 100).toFixed(1)}%` : '0%'],
      [''],
      ['Évaluations données aux centres', ratingsGiven?.length || 0],
      ['Évaluations reçues des centres', ratingsReceived?.length || 0],
      [''],
      ['Date d\'export', formatDateTime(new Date().toISOString())],
    ];

    const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
    statsSheet['!cols'] = [{ wch: 35 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, statsSheet, 'Statistiques');

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Create filename with jury name and date
    const juryName = `${juryProfile.first_name}_${juryProfile.last_name}`.replace(/[^a-z0-9]/gi, '_');
    const fileName = `SimplyJury_Export_${juryName}_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Return Excel file
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });

  } catch (error) {
    console.error('Error exporting jury data:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export des données' },
      { status: 500 }
    );
  }
}
