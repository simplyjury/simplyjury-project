import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { conversations, messages, trainingCenters, users } from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
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

    // Verify user is a jury
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || user.userType !== 'jury') {
      return NextResponse.json({ error: 'Accès refusé - réservé aux jurys' }, { status: 403 });
    }

    // Fetch conversations for this jury with training center details and last message info
    const conversationsData = await db
      .select({
        id: conversations.id,
        trainingCenterId: conversations.trainingCenterId,
        juryRequestId: conversations.juryRequestId,
        status: conversations.status,
        createdAt: conversations.createdAt,
        lastMessageAt: conversations.lastMessageAt,
        // Training center info
        centerName: trainingCenters.name,
        centerCity: trainingCenters.city,
        centerRegion: trainingCenters.region,
        // Last message info
        lastMessageContent: sql<string>`(
          SELECT content 
          FROM messages 
          WHERE conversation_id = ${conversations.id} 
          ORDER BY created_at DESC 
          LIMIT 1
        )`,
        lastMessageType: sql<string>`(
          SELECT message_type 
          FROM messages 
          WHERE conversation_id = ${conversations.id} 
          ORDER BY created_at DESC 
          LIMIT 1
        )`,
        unreadCount: sql<number>`(
          SELECT COUNT(*) 
          FROM messages 
          WHERE conversation_id = ${conversations.id} 
          AND sender_id != ${userId} 
          AND read_at IS NULL
        )`,
      })
      .from(conversations)
      .innerJoin(trainingCenters, eq(conversations.trainingCenterId, trainingCenters.id))
      .where(eq(conversations.juryId, userId))
      .orderBy(desc(conversations.lastMessageAt));

    // Transform data for frontend
    const formattedConversations = conversationsData.map(conv => {
      const centerInitials = conv.centerName
        .split(' ')
        .map(word => word[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

      // Determine status text based on conversation status and last message type
      let statusText = 'Conversation active';
      if (conv.lastMessageType === 'structured_request') {
        statusText = 'Demande en attente';
      } else if (conv.status === 'closed') {
        statusText = 'Conversation fermée';
      }

      // Format timestamp
      const now = new Date();
      const lastMessageDate = conv.lastMessageAt ? new Date(conv.lastMessageAt) : (conv.createdAt ? new Date(conv.createdAt) : new Date());
      const diffInHours = Math.floor((now.getTime() - lastMessageDate.getTime()) / (1000 * 60 * 60));
      
      let timestamp;
      if (diffInHours < 1) {
        timestamp = 'À l\'instant';
      } else if (diffInHours < 24) {
        timestamp = `Il y a ${diffInHours}h`;
      } else if (diffInHours < 48) {
        timestamp = 'Hier';
      } else {
        const days = Math.floor(diffInHours / 24);
        timestamp = `Il y a ${days} jours`;
      }

      // Process message content for preview (remove "Objet:" prefix and truncate)
      let messagePreview = conv.lastMessageContent || 'Nouvelle conversation';
      
      // Remove "Objet: ..." line if present
      if (messagePreview.startsWith('Objet:')) {
        const lines = messagePreview.split('\n');
        // Find first non-empty line after "Objet:" line
        const contentLines = lines.slice(1).filter(line => line.trim() !== '');
        messagePreview = contentLines.join(' ').trim();
      }
      
      // Truncate to 100 characters
      if (messagePreview.length > 100) {
        messagePreview = messagePreview.substring(0, 100) + '...';
      }


      return {
        id: conv.id.toString(),
        centerName: conv.centerName,
        centerInitials,
        location: conv.centerCity || conv.centerRegion || 'France',
        status: conv.status === 'active' ? 'pending' : conv.status,
        statusText,
        lastMessage: messagePreview,
        timestamp,
        unreadCount: conv.unreadCount > 0 ? conv.unreadCount : undefined,
        juryRequestId: conv.juryRequestId,
      };
    });

    return NextResponse.json({
      success: true,
      conversations: formattedConversations,
    });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des conversations' },
      { status: 500 }
    );
  }
}
