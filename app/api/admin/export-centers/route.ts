import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { trainingCenters, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

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

    // Get format from query params
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';

    // Fetch all training centers with their user data
    const centers = await db
      .select({
        id: trainingCenters.id,
        userId: trainingCenters.userId,
        name: trainingCenters.name,
        siret: trainingCenters.siret,
        contactPersonName: trainingCenters.contactPersonName,
        contactPersonEmail: trainingCenters.contactPersonEmail,
        phone: trainingCenters.phone,
        address: trainingCenters.address,
        city: trainingCenters.city,
        postalCode: trainingCenters.postalCode,
        region: trainingCenters.region,
        website: trainingCenters.website,
        description: trainingCenters.description,
        isCertificateur: trainingCenters.isCertificateur,
        createdAt: trainingCenters.createdAt,
        userEmail: users.email,
        emailVerified: users.emailVerified,
        validationStatus: users.validationStatus,
      })
      .from(trainingCenters)
      .leftJoin(users, eq(trainingCenters.userId, users.id));

    // Prepare data for export
    const exportData = centers.map((center) => ({
      'ID': center.id,
      'Nom de l\'organisation': center.name || '',
      'SIRET': center.siret || '',
      'Contact': center.contactPersonName || '',
      'Email contact': center.contactPersonEmail || '',
      'Email utilisateur': center.userEmail || '',
      'Téléphone': center.phone || '',
      'Adresse': center.address || '',
      'Code postal': center.postalCode || '',
      'Ville': center.city || '',
      'Région': center.region || '',
      'Site web': center.website || '',
      'Certificateur': center.isCertificateur ? 'Oui' : 'Non',
      'Statut validation': center.validationStatus === 'validated' ? 'Validé' : 
                           center.validationStatus === 'pending' ? 'En attente' : 'Rejeté',
      'Email vérifié': center.emailVerified ? 'Oui' : 'Non',
      'Date de création': center.createdAt ? new Date(center.createdAt).toLocaleDateString('fr-FR') : '',
    }));

    if (format === 'csv') {
      // Generate CSV
      const headers = Object.keys(exportData[0] || {});
      const csvRows = [
        headers.join(','),
        ...exportData.map((row) =>
          headers.map((header) => {
            const value = row[header as keyof typeof row] || '';
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
          'Content-Disposition': `attachment; filename="centres_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else if (format === 'excel') {
      // Generate Excel (simple XML format)
      const headers = Object.keys(exportData[0] || {});
      
      let xml = '<?xml version="1.0"?>\n';
      xml += '<?mso-application progid="Excel.Sheet"?>\n';
      xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n';
      xml += ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';
      xml += '<Worksheet ss:Name="Centres">\n';
      xml += '<Table>\n';
      
      // Header row
      xml += '<Row>\n';
      headers.forEach((header) => {
        xml += `<Cell><Data ss:Type="String">${escapeXml(header)}</Data></Cell>\n`;
      });
      xml += '</Row>\n';
      
      // Data rows
      exportData.forEach((row) => {
        xml += '<Row>\n';
        headers.forEach((header) => {
          const value = row[header as keyof typeof row] || '';
          xml += `<Cell><Data ss:Type="String">${escapeXml(String(value))}</Data></Cell>\n`;
        });
        xml += '</Row>\n';
      });
      
      xml += '</Table>\n';
      xml += '</Worksheet>\n';
      xml += '</Workbook>';

      return new NextResponse(xml, {
        headers: {
          'Content-Type': 'application/vnd.ms-excel',
          'Content-Disposition': `attachment; filename="centres_${new Date().toISOString().split('T')[0]}.xls"`,
        },
      });
    }

    return NextResponse.json({ error: 'Format non supporté' }, { status: 400 });
  } catch (error) {
    console.error('Error exporting centers:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export des centres' },
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
