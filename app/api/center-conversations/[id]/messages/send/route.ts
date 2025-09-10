import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { conversations, messages, trainingCenters } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { AuthService } from '@/lib/auth/auth-service';
import { cookies } from 'next/headers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    const conversationId = parseInt(id);

    if (isNaN(conversationId)) {
      return NextResponse.json({ error: 'ID de conversation invalide' }, { status: 400 });
    }

    // Get the training center for this user
    const [trainingCenter] = await db
      .select()
      .from(trainingCenters)
      .where(eq(trainingCenters.userId, userId))
      .limit(1);

    if (!trainingCenter) {
      return NextResponse.json({ error: 'Centre de formation non trouvé' }, { status: 404 });
    }

    // Verify that this conversation belongs to the training center
    const [conversation] = await db
      .select({
        id: conversations.id,
        juryId: conversations.juryId,
        trainingCenterId: conversations.trainingCenterId,
      })
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(conversations.trainingCenterId, trainingCenter.id)
        )
      )
      .limit(1);

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation non trouvée' }, { status: 404 });
    }

    // Get message content from request body
    const { content } = await request.json();

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json({ error: 'Le contenu du message est requis' }, { status: 400 });
    }

    // Insert the new message
    const [newMessage] = await db
      .insert(messages)
      .values({
        conversationId: conversationId,
        senderId: userId, // Center user ID
        senderType: 'centre',
        messageType: 'text',
        content: content.trim(),
        createdAt: new Date(),
      })
      .returning({
        id: messages.id,
        senderId: messages.senderId,
        messageType: messages.messageType,
        content: messages.content,
        createdAt: messages.createdAt,
      });

    // Update conversation's lastMessageAt
    await db
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, conversationId));

    // Format the message for frontend
    const formattedMessage = {
      id: newMessage.id.toString(),
      senderId: newMessage.senderId?.toString() || '',
      senderName: 'Centre de formation',
      senderType: 'center',
      content: newMessage.content,
      timestamp: new Date(newMessage.createdAt || new Date()).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      isSystem: false,
    };

    return NextResponse.json({
      success: true,
      message: formattedMessage,
    });

  } catch (error) {
    console.error('Error sending center message:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du message' },
      { status: 500 }
    );
  }
}
