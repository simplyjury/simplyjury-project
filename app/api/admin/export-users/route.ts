import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { users, juryProfiles, trainingCenters } from '@/lib/db/schema';
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

    // Fetch all users with their profiles
    const allUsers = await db.select().from(users);

    // Fetch jury profiles
    const juryProfilesData = await db.select().from(juryProfiles);
    const juryProfilesMap = new Map(
      juryProfilesData.map((profile) => [profile.userId, profile])
    );

    // Fetch training centers
    const trainingCentersData = await db.select().from(trainingCenters);
    const trainingCentersMap = new Map(
      trainingCentersData.map((center) => [center.userId, center])
    );

    // Prepare data for export
    const exportData = allUsers.map((user) => {
      const juryProfile = juryProfilesMap.get(user.id);
      const trainingCenter = trainingCentersMap.get(user.id);

      return {
        'ID': user.id,
        'Email': user.email,
        'Type': user.userType === 'jury' ? 'Jury' : user.userType === 'training_center' ? 'Centre de formation' : 'Admin',
        'Prénom': juryProfile?.firstName || trainingCenter?.contactPersonName || '',
        'Nom': juryProfile?.lastName || trainingCenter?.contactPersonName || '',
        'Téléphone': juryProfile?.phone || trainingCenter?.phone || '',
        'Email vérifié': user.emailVerified ? 'Oui' : 'Non',
        'Date de création': user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '',
        'Dernière connexion': user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('fr-FR') : 'Jamais',
      };
    });

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
          'Content-Disposition': `attachment; filename="utilisateurs_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else if (format === 'excel') {
      // Generate Excel (simple XML format)
      const headers = Object.keys(exportData[0] || {});
      
      let xml = '<?xml version="1.0"?>\n';
      xml += '<?mso-application progid="Excel.Sheet"?>\n';
      xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n';
      xml += ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';
      xml += '<Worksheet ss:Name="Utilisateurs">\n';
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
          'Content-Disposition': `attachment; filename="utilisateurs_${new Date().toISOString().split('T')[0]}.xls"`,
        },
      });
    }

    return NextResponse.json({ error: 'Format non supporté' }, { status: 400 });
  } catch (error) {
    console.error('Error exporting users:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export des utilisateurs' },
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
