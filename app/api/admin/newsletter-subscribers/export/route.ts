import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { newsletterSubscriptions } from '@/lib/db/schema';
import { eq, ilike, and, desc, sql } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const user = await getUser();
    if (!user || user.userType !== 'admin') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    // Set RLS context for admin user
    await db.execute(sql.raw(`SET LOCAL app.current_user_id = '${user.id}'`));

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const source = searchParams.get('source') || '';

    // Build where conditions
    const conditions = [];

    if (search) {
      conditions.push(ilike(newsletterSubscriptions.email, `%${search}%`));
    }

    if (status) {
      conditions.push(eq(newsletterSubscriptions.status, status));
    }

    if (source) {
      conditions.push(eq(newsletterSubscriptions.source, source));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get all subscribers matching filters
    const subscribers = await db
      .select()
      .from(newsletterSubscriptions)
      .where(whereClause)
      .orderBy(desc(newsletterSubscriptions.createdAt));

    // Generate CSV
    const headers = ['Email', 'Statut', 'Source', 'Type utilisateur', 'Date d\'inscription', 'Date de confirmation', 'Date de désinscription'];
    const csvRows = [headers.join(',')];

    subscribers.forEach(sub => {
      const row = [
        sub.email,
        sub.status,
        sub.source || '',
        sub.userType || '',
        sub.createdAt ? new Date(sub.createdAt).toLocaleDateString('fr-FR') : '',
        sub.confirmedAt ? new Date(sub.confirmedAt).toLocaleDateString('fr-FR') : '',
        sub.unsubscribedAt ? new Date(sub.unsubscribedAt).toLocaleDateString('fr-FR') : '',
      ];
      csvRows.push(row.join(','));
    });

    const csv = csvRows.join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting newsletter subscribers:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export' },
      { status: 500 }
    );
  }
}
