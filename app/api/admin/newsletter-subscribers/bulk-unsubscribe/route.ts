import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { newsletterSubscriptions } from '@/lib/db/schema';
import { eq, inArray, sql } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
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

    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'IDs manquants' },
        { status: 400 }
      );
    }

    // Update status to unsubscribed for selected subscribers
    await db
      .update(newsletterSubscriptions)
      .set({
        status: 'unsubscribed',
        unsubscribedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(inArray(newsletterSubscriptions.id, ids));

    return NextResponse.json({
      success: true,
      message: `${ids.length} abonné(s) désinscrit(s) avec succès`,
    });
  } catch (error) {
    console.error('Error bulk unsubscribing:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la désinscription' },
      { status: 500 }
    );
  }
}
