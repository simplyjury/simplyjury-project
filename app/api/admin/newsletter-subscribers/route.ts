import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { newsletterSubscriptions } from '@/lib/db/schema';
import { eq, ilike, or, and, desc, asc, sql, count } from 'drizzle-orm';
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const source = searchParams.get('source') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const offset = (page - 1) * limit;

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

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(newsletterSubscriptions)
      .where(whereClause);

    const total = totalResult[0]?.count || 0;

    // Determine sort column
    let orderColumn;
    switch (sortBy) {
      case 'email':
        orderColumn = newsletterSubscriptions.email;
        break;
      case 'status':
        orderColumn = newsletterSubscriptions.status;
        break;
      case 'source':
        orderColumn = newsletterSubscriptions.source;
        break;
      case 'createdAt':
      default:
        orderColumn = newsletterSubscriptions.createdAt;
        break;
    }

    // Get subscribers
    const subscribers = await db
      .select()
      .from(newsletterSubscriptions)
      .where(whereClause)
      .orderBy(sortOrder === 'asc' ? asc(orderColumn) : desc(orderColumn))
      .limit(limit)
      .offset(offset);

    // Get statistics
    const stats = await db
      .select({
        total: count(),
        status: newsletterSubscriptions.status,
      })
      .from(newsletterSubscriptions)
      .groupBy(newsletterSubscriptions.status);

    // Calculate weekly and monthly subscriptions
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const weeklyCount = await db
      .select({ count: count() })
      .from(newsletterSubscriptions)
      .where(
        and(
          sql`${newsletterSubscriptions.createdAt} >= ${oneWeekAgo.toISOString()}`,
          eq(newsletterSubscriptions.status, 'active')
        )
      );

    const monthlyCount = await db
      .select({ count: count() })
      .from(newsletterSubscriptions)
      .where(
        and(
          sql`${newsletterSubscriptions.createdAt} >= ${oneMonthAgo.toISOString()}`,
          eq(newsletterSubscriptions.status, 'active')
        )
      );

    const totalActive = stats.find(s => s.status === 'active')?.total || 0;
    const totalSubscribers = stats.reduce((sum, s) => sum + (s.total || 0), 0);
    const activeRate = totalSubscribers > 0 ? (totalActive / totalSubscribers) * 100 : 0;

    return NextResponse.json({
      subscribers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      statistics: {
        totalSubscribers,
        totalActive,
        weeklySubscriptions: weeklyCount[0]?.count || 0,
        monthlySubscriptions: monthlyCount[0]?.count || 0,
        activeRate: Math.round(activeRate * 10) / 10,
      },
    });
  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des abonnés' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID manquant' },
        { status: 400 }
      );
    }

    await db
      .delete(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting newsletter subscriber:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
