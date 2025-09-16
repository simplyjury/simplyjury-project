import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { conversations, messages, users, trainingCenters } from '@/lib/db/schema';
import { eq, and, asc, sql } from 'drizzle-orm';
import { AuthService } from '@/lib/auth/auth-service';
import { cookies } from 'next/headers';

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

    // Get jury user details
    const [juryUser] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, conversation.juryId!))
      .limit(1);

    if (!juryUser) {
      return NextResponse.json({ error: 'Jury non trouvé' }, { status: 404 });
    }

    // Mark messages from jury as read
    await db
      .update(messages)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          eq(messages.senderId, conversation.juryId!),
          sql`${messages.readAt} IS NULL`
        )
      );

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
        senderName: users.name,
        senderEmail: users.email,
        senderUserType: users.userType,
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt));

    // Format messages for frontend
    const formattedMessages = messagesData.map(msg => {
      const isFromJury = msg.senderId === conversation.juryId;
      const isFromCenter = msg.senderId === userId;
      
      return {
        id: msg.id.toString(),
        senderId: msg.senderId?.toString() || '',
        senderName: msg.senderName || (isFromJury ? 'Jury' : 'Centre'),
        senderType: isFromJury ? 'jury' : 'center',
        content: msg.content,
        timestamp: msg.createdAt ? new Date(msg.createdAt).toLocaleString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : '',
        isSystem: msg.messageType === 'system',
      };
    });

    // Create jury initials
    const juryInitials = juryUser.name
      ? juryUser.name
          .split(' ')
          .map(word => word[0])
          .join('')
          .substring(0, 2)
          .toUpperCase()
      : 'JU';

    // Format conversation info for frontend
    const conversationInfo = {
      id: conversation.id.toString(),
      juryName: juryUser.name || 'Jury', // Display name from users table
      juryEmail: juryUser.email,
      juryInitials,
    };

    return NextResponse.json({
      success: true,
      conversation: conversationInfo,
      messages: formattedMessages,
    });

  } catch (error) {
    console.error('Error fetching center conversation messages:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des messages' },
      { status: 500 }
    );
  }
}
