import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { users, trainingCenters } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

export async function GET() {
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

    // Get total users count
    const usersCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users);

    // Get total training centers count
    const centersCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(trainingCenters);

    return NextResponse.json({
      totalUsers: usersCount[0]?.count || 0,
      totalCenters: centersCount[0]?.count || 0,
    });
  } catch (error) {
    console.error('Error fetching export stats:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}
