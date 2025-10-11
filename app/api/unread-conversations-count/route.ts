import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { conversations, messages, trainingCenters } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { AuthService } from '@/lib/auth/auth-service';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const sessionData = await AuthService.verifyJWT(sessionCookie.value);
    if (!sessionData || !sessionData.userId || typeof sessionData.userId !== 'number') {
      return NextResponse.json({ error: 'Session invalide' }, { status: 401 });
    }

    const userId = sessionData.userId;

    // Get user type from session
    const userType = sessionData.userType;

    let unreadConversationsCount = 0;

    if (userType === 'jury') {
      // For jury users, count conversations with unread messages from training centers
      const result = await db
        .select({
          count: sql<number>`COUNT(DISTINCT ${conversations.id})`
        })
        .from(conversations)
        .innerJoin(messages, eq(messages.conversationId, conversations.id))
        .where(
          and(
            eq(conversations.juryId, userId),
            eq(messages.senderType, 'centre'),
            sql`${messages.readAt} IS NULL`
          )
        );

      unreadConversationsCount = result[0]?.count || 0;
    } else if (userType === 'centre') {
      // Get the training center for this user
      const [trainingCenter] = await db
        .select()
        .from(trainingCenters)
        .where(eq(trainingCenters.userId, userId))
        .limit(1);

      if (trainingCenter) {
        // For center users, count conversations with unread messages from juries
        const result = await db
          .select({
            count: sql<number>`COUNT(DISTINCT ${conversations.id})`
          })
          .from(conversations)
          .innerJoin(messages, eq(messages.conversationId, conversations.id))
          .where(
            and(
              eq(conversations.trainingCenterId, trainingCenter.id),
              eq(messages.senderType, 'jury'),
              sql`${messages.readAt} IS NULL`
            )
          );

        unreadConversationsCount = result[0]?.count || 0;
      }
    }

    return NextResponse.json({
      success: true,
      unreadConversationsCount,
    });

  } catch (error) {
    console.error('Error fetching unread conversations count:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du nombre de conversations non lues' },
      { status: 500 }
    );
  }
}
