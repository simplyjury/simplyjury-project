import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { conversations, messages, users, trainingCenters } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { AuthService } from '@/lib/auth/auth-service';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
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

    // Verify user is a jury
    const user = await db
      .select()
      .from(users)
      .where(and(eq(users.id, userId), isNull(users.deletedAt)))
      .limit(1);

    if (!user.length || user[0].userType !== 'jury') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();
    const { trainingCenterId, subject, message, contactMethod } = body;

    if (!trainingCenterId || !subject || !message) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    // Verify training center exists
    const trainingCenter = await db
      .select()
      .from(trainingCenters)
      .where(eq(trainingCenters.id, trainingCenterId))
      .limit(1);

    if (!trainingCenter.length) {
      return NextResponse.json({ error: 'Centre de formation introuvable' }, { status: 404 });
    }

    // Check if conversation already exists between this jury and training center
    let conversation = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.juryId, userId),
          eq(conversations.trainingCenterId, trainingCenterId)
        )
      )
      .limit(1);

    let conversationId: number;

    if (conversation.length === 0) {
      // Create new conversation
      const newConversation = await db
        .insert(conversations)
        .values({
          juryId: userId,
          trainingCenterId: trainingCenterId,
          status: 'active',
          subject: subject,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning({ id: conversations.id });

      conversationId = newConversation[0].id;
    } else {
      conversationId = conversation[0].id;
    }

    // Create the initial message
    const newMessage = await db
      .insert(messages)
      .values({
        conversationId: conversationId,
        senderId: userId,
        senderType: 'jury',
        content: `Objet: ${subject}\n\n${message}`,
        messageType: 'text',
        metadata: {
          contactMethod: contactMethod,
          isInitialContact: true
        },
        createdAt: new Date()
      })
      .returning();

    // Update conversation with last message info
    await db
      .update(conversations)
      .set({
        lastMessageAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(conversations.id, conversationId));

    return NextResponse.json({
      success: true,
      message: 'Message envoyé avec succès',
      conversationId: conversationId,
      messageId: newMessage[0].id
    });

  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du message' },
      { status: 500 }
    );
  }
}
