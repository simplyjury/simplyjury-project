import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { conversations, messages, users, trainingCenters } from '@/lib/db/schema';
import { eq, and, asc, ne } from 'drizzle-orm';
import { AuthService } from '@/lib/auth/auth-service';
import { cookies } from 'next/headers';
import { isNull } from 'drizzle-orm';

export async function GET(
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

    // Verify user is a jury and has access to this conversation
    const [conversation] = await db
      .select({
        id: conversations.id,
        juryId: conversations.juryId,
        trainingCenterId: conversations.trainingCenterId,
        centerName: trainingCenters.name,
        centerCity: trainingCenters.city,
        centerRegion: trainingCenters.region,
      })
      .from(conversations)
      .innerJoin(trainingCenters, eq(conversations.trainingCenterId, trainingCenters.id))
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (!conversation || conversation.juryId !== userId) {
      return NextResponse.json({ error: 'Conversation non trouvée' }, { status: 404 });
    }

    // Fetch all messages for this conversation
    const messagesData = await db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        messageType: messages.messageType,
        content: messages.content,
        metadata: messages.metadata,
        readAt: messages.readAt,
        createdAt: messages.createdAt,
        // Sender info
        senderName: users.name,
        senderEmail: users.email,
        senderUserType: users.userType,
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt));

    // Mark messages as read for this user
    await db
      .update(messages)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          ne(messages.senderId, userId), // Messages not sent by current user
          isNull(messages.readAt)
        )
      );

    // Transform messages for frontend
    const formattedMessages = messagesData.map(msg => {
      let senderName = msg.senderName || msg.senderEmail;
      
      // Format sender name based on user type
      if (msg.senderUserType === 'centre') {
        senderName = `${senderName} - ${conversation.centerName}`;
      }

      // Format timestamp
      const now = new Date();
      const messageDate = msg.createdAt ? new Date(msg.createdAt) : new Date();
      const timestamp = messageDate.toLocaleString('fr-FR', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
      });

      return {
        id: msg.id.toString(),
        senderId: msg.senderId?.toString() || '',
        senderName,
        senderType: msg.senderUserType === 'jury' ? 'jury' : 'center',
        content: msg.content || '',
        timestamp,
        isSystem: msg.messageType === 'system',
        messageType: msg.messageType,
        metadata: msg.metadata,
      };
    });

    // Get conversation details for the header
    const centerInitials = conversation.centerName
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation.id.toString(),
        centerName: conversation.centerName,
        centerInitials,
        location: conversation.centerCity || conversation.centerRegion || 'France',
        rating: 4.6, // TODO: Implement real rating system
        reviewCount: 18, // TODO: Implement real review system
        status: 'active',
      },
      messages: formattedMessages,
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des messages' },
      { status: 500 }
    );
  }
}
