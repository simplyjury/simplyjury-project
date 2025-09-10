import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { conversations, messages } from '@/lib/db/schema';
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

    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Le message ne peut pas être vide' }, { status: 400 });
    }

    // Verify user has access to this conversation
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (!conversation || conversation.juryId !== userId) {
      return NextResponse.json({ error: 'Conversation non trouvée' }, { status: 404 });
    }

    // Create the message
    const [newMessage] = await db
      .insert(messages)
      .values({
        conversationId,
        senderId: userId,
        senderType: 'jury',
        messageType: 'text',
        content: content.trim(),
        createdAt: new Date(),
      })
      .returning();

    // Update conversation's last message timestamp
    await db
      .update(conversations)
      .set({
        lastMessageAt: new Date(),
      })
      .where(eq(conversations.id, conversationId));

    return NextResponse.json({
      success: true,
      message: {
        id: newMessage.id.toString(),
        senderId: userId.toString(),
        senderName: 'Vous',
        senderType: 'jury',
        content: newMessage.content,
        timestamp: new Date().toLocaleString('fr-FR', {
          day: 'numeric',
          month: 'long',
          hour: '2-digit',
          minute: '2-digit',
        }),
        isSystem: false,
      },
    });

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du message' },
      { status: 500 }
    );
  }
}
