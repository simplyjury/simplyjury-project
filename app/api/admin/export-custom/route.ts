import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.userType !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Get parameters from query
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const includeJuryProfiles = searchParams.get('juryProfiles') === 'true';
    const includeCenterProfiles = searchParams.get('centerProfiles') === 'true';
    const includeConnections = searchParams.get('connections') === 'true';
    const includeReviews = searchParams.get('reviews') === 'true';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let allData: any[] = [];
    const dataByType: { [key: string]: any[] } = {};

    // Fetch Jury Profiles
    if (includeJuryProfiles) {
      let query = supabase
        .from('jury_profiles')
        .select(`
          id,
          user_id,
          first_name,
          last_name,
          phone,
          region,
          city,
          expertise_domains,
          experience_years,
          current_position,
          current_company,
          hourly_rate,
          created_at,
          users!inner(email)
        `);

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate + 'T23:59:59');
      }

      const { data: juryData, error } = await query;

      if (error) {
        console.error('Error fetching jury profiles:', error);
      } else if (juryData) {
        const formattedJuryData = juryData.map((jury: any) => ({
          'Type': 'Profil Jury',
          'ID': jury.id,
          'Prénom': jury.first_name || '',
          'Nom': jury.last_name || '',
          'Email': jury.users?.email || '',
          'Téléphone': jury.phone || '',
          'Région': jury.region || '',
          'Ville': jury.city || '',
          'Domaines d\'expertise': Array.isArray(jury.expertise_domains) ? jury.expertise_domains.join(', ') : '',
          'Années d\'expérience': jury.experience_years || '',
          'Poste actuel': jury.current_position || '',
          'Entreprise actuelle': jury.current_company || '',
          'Tarif horaire': jury.hourly_rate || '',
          'Date de création': jury.created_at ? new Date(jury.created_at).toLocaleDateString('fr-FR') : '',
        }));

        allData = [...allData, ...formattedJuryData];
        dataByType['Profils Jurys'] = formattedJuryData;
      }
    }

    // Fetch Center Profiles
    if (includeCenterProfiles) {
      let query = supabase
        .from('training_centers')
        .select(`
          id,
          name,
          siret,
          email,
          phone,
          contact_person_name,
          contact_person_email,
          address,
          city,
          postal_code,
          region,
          website,
          is_certificateur,
          created_at
        `);

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate + 'T23:59:59');
      }

      const { data: centerData, error } = await query;

      if (error) {
        console.error('Error fetching training centers:', error);
      } else if (centerData) {
        const formattedCenterData = centerData.map((center: any) => ({
          'Type': 'Profil Centre',
          'ID': center.id,
          'Nom': center.name || '',
          'SIRET': center.siret || '',
          'Email': center.email || '',
          'Téléphone': center.phone || '',
          'Contact': center.contact_person_name || '',
          'Email contact': center.contact_person_email || '',
          'Adresse': center.address || '',
          'Code postal': center.postal_code || '',
          'Ville': center.city || '',
          'Région': center.region || '',
          'Site web': center.website || '',
          'Certificateur': center.is_certificateur ? 'Oui' : 'Non',
          'Date de création': center.created_at ? new Date(center.created_at).toLocaleDateString('fr-FR') : '',
        }));

        allData = [...allData, ...formattedCenterData];
        dataByType['Profils Centres'] = formattedCenterData;
      }
    }

    // Fetch Connections (Jury Requests)
    if (includeConnections) {
      console.log('📅 Sessions export - Date filters:', { startDate, endDate });
      
      let query = supabase
        .from('jury_requests')
        .select(`
          id,
          training_center_id,
          jury_id,
          certification_title,
          session_date,
          modality,
          status,
          created_at
        `);

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate + 'T23:59:59');
      }

      const { data: sessionsData, error } = await query;

      console.log('📊 Sessions query result:', { 
        error: error?.message, 
        count: sessionsData?.length,
        sample: sessionsData?.[0] 
      });

      if (error) {
        console.error('Error fetching jury requests:', error);
      } else if (sessionsData && sessionsData.length > 0) {
        // Fetch related training centers and jury profiles
        const centerIds = sessionsData.map((s: any) => s.training_center_id).filter(Boolean);
        const juryIds = sessionsData.map((s: any) => s.jury_id).filter(Boolean);

        const { data: centersData } = await supabase
          .from('training_centers')
          .select('id, name')
          .in('id', centerIds);

        const { data: juriesData } = await supabase
          .from('jury_profiles')
          .select('user_id, first_name, last_name')
          .in('user_id', juryIds);

        const centersMap = new Map(centersData?.map((c: any) => [c.id, c.name]) || []);
        const juriesMap = new Map(juriesData?.map((j: any) => [j.user_id, `${j.first_name} ${j.last_name}`]) || []);

        const formattedConnectionsData = sessionsData.map((conn: any) => ({
          'Type': 'Session',
          'ID': conn.id,
          'Centre': centersMap.get(conn.training_center_id) || '',
          'Jury': juriesMap.get(conn.jury_id) || '',
          'Certification': conn.certification_title || '',
          'Date de session': conn.session_date ? new Date(conn.session_date).toLocaleDateString('fr-FR') : '',
          'Modalité': conn.modality || '',
          'Statut': conn.status === 'pending' ? 'En attente' :
                    conn.status === 'accepted' ? 'Acceptée' :
                    conn.status === 'declined' ? 'Refusée' :
                    conn.status === 'completed' ? 'Terminée' :
                    conn.status === 'cancelled' ? 'Annulée' : conn.status || '',
          'Date de création': conn.created_at ? new Date(conn.created_at).toLocaleDateString('fr-FR') : '',
        }));

        allData = [...allData, ...formattedConnectionsData];
        dataByType['Sessions'] = formattedConnectionsData;
      }
    }

    // Fetch Reviews (Session Ratings)
    if (includeReviews) {
      let query = supabase
        .from('session_ratings')
        .select(`
          id,
          rater_id,
          rater_type,
          communication_rating,
          punctuality_rating,
          expertise_rating,
          overall_rating,
          comment,
          would_recommend,
          status,
          created_at
        `);

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate + 'T23:59:59');
      }

      const { data: reviewsData, error } = await query;

      if (error) {
        console.error('Error fetching session ratings:', error);
      } else if (reviewsData && reviewsData.length > 0) {
        // Fetch user emails separately
        const raterIds = reviewsData.map((r: any) => r.rater_id).filter(Boolean);
        const { data: usersData } = await supabase
          .from('users')
          .select('id, email')
          .in('id', raterIds);

        const usersMap = new Map(usersData?.map((u: any) => [u.id, u.email]) || []);

        const formattedReviewsData = reviewsData.map((review: any) => ({
          'Type': 'Avis',
          'ID': review.id,
          'Évaluateur': usersMap.get(review.rater_id) || '',
          'Type évaluateur': review.rater_type === 'centre' ? 'Centre' : 'Jury',
          'Note communication': review.communication_rating || '',
          'Note ponctualité': review.punctuality_rating || '',
          'Note expertise': review.expertise_rating || '',
          'Note globale': review.overall_rating || '',
          'Commentaire': review.comment || '',
          'Recommanderait': review.would_recommend ? 'Oui' : 'Non',
          'Statut': review.status === 'active' ? 'Actif' :
                    review.status === 'hidden' ? 'Masqué' :
                    review.status === 'flagged' ? 'Signalé' :
                    review.status === 'removed' ? 'Supprimé' : review.status || '',
          'Date de création': review.created_at ? new Date(review.created_at).toLocaleDateString('fr-FR') : '',
        }));

        allData = [...allData, ...formattedReviewsData];
        dataByType['Avis et évaluations'] = formattedReviewsData;
      }
    }

    if (allData.length === 0) {
      return NextResponse.json({ error: 'Aucune donnée à exporter' }, { status: 400 });
    }

    if (format === 'csv') {
      // Generate CSV
      const headers = Object.keys(allData[0] || {});
      const csvRows = [
        headers.join(','),
        ...allData.map((row) =>
          headers.map((header) => {
            const value = row[header] || '';
            // Escape quotes and wrap in quotes if contains comma or quote
            const stringValue = String(value);
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
          }).join(',')
        ),
      ];

      const csv = csvRows.join('\n');
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="export_personnalise_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else if (format === 'excel') {
      // Generate Excel with multiple worksheets (simple XML format)
      let xml = '<?xml version="1.0"?>\n';
      xml += '<?mso-application progid="Excel.Sheet"?>\n';
      xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n';
      xml += ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';
      
      // Create a worksheet for each data type
      Object.keys(dataByType).forEach((sheetName) => {
        const sheetData = dataByType[sheetName];
        if (sheetData && sheetData.length > 0) {
          const headers = Object.keys(sheetData[0] || {});
          
          xml += `<Worksheet ss:Name="${escapeXml(sheetName)}">\n`;
          xml += '<Table>\n';
          
          // Header row
          xml += '<Row>\n';
          headers.forEach((header) => {
            xml += `<Cell><Data ss:Type="String">${escapeXml(header)}</Data></Cell>\n`;
          });
          xml += '</Row>\n';
          
          // Data rows
          sheetData.forEach((row) => {
            xml += '<Row>\n';
            headers.forEach((header) => {
              const value = row[header] || '';
              xml += `<Cell><Data ss:Type="String">${escapeXml(String(value))}</Data></Cell>\n`;
            });
            xml += '</Row>\n';
          });
          
          xml += '</Table>\n';
          xml += '</Worksheet>\n';
        }
      });
      
      xml += '</Workbook>';

      return new NextResponse(xml, {
        headers: {
          'Content-Type': 'application/vnd.ms-excel',
          'Content-Disposition': `attachment; filename="export_personnalise_${new Date().toISOString().split('T')[0]}.xls"`,
        },
      });
    }

    return NextResponse.json({ error: 'Format non supporté' }, { status: 400 });
  } catch (error) {
    console.error('Error in custom export:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export personnalisé' },
      { status: 500 }
    );
  }
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
