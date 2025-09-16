'use client';

import { useState, useEffect } from 'react';
import { ConversationList } from '@/components/messaging/conversation-list';
import { ChatArea } from '@/components/messaging/chat-area';
import { CenterConversationList } from '@/components/messaging/center-conversation-list';
import { CenterChatArea } from '@/components/messaging/center-chat-area';
import { MessageCircle } from 'lucide-react';
import useSWR, { mutate } from 'swr';
import { useUnreadCount } from '@/lib/hooks/use-unread-count';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MessagesPage() {
  const { data: user } = useSWR('/api/user', fetcher);
  const { updateUnreadCount } = useUnreadCount();
  const conversationsEndpoint = user?.userType === 'centre' ? '/api/center-conversations' : '/api/conversations';
  const { data: conversationsData, error: conversationsError } = useSWR(
    user ? conversationsEndpoint : null,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds instead of 5
      revalidateOnFocus: false, // Disable focus revalidation to reduce calls
      revalidateOnReconnect: true
    }
  );

  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [conversationMessages, setConversationMessages] = useState<any>(null);

  // Fetch messages for selected conversation - use different endpoint for centers
  const messagesEndpoint = selectedConversation 
    ? (user?.userType === 'centre' 
        ? `/api/center-conversations/${selectedConversation.id}/messages`
        : `/api/conversations/${selectedConversation.id}/messages`)
    : null;
  
  const { data: messagesData } = useSWR(messagesEndpoint, fetcher);

  useEffect(() => {
    if (conversationsData?.conversations?.length > 0 && !selectedConversation) {
      setSelectedConversation(conversationsData.conversations[0]);
    }
  }, [conversationsData, selectedConversation]);

  useEffect(() => {
    if (messagesData?.messages) {
      setMessages(messagesData.messages);
      setConversationMessages(messagesData.conversation);
    }
  }, [messagesData]);

  const handleConversationSelect = (conversation: any) => {
    setSelectedConversation(conversation);
    // Update unread count when a conversation is selected (messages will be marked as read)
    setTimeout(() => updateUnreadCount(), 500);
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation) return;

    try {
      const sendEndpoint = user?.userType === 'centre' 
        ? `/api/center-conversations/${selectedConversation.id}/messages/send`
        : `/api/conversations/${selectedConversation.id}/messages/send`;

      const response = await fetch(sendEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        const result = await response.json();
        setMessages([...messages, result.message]);
        // Refresh conversations to update last message
        mutate(conversationsEndpoint);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Show center messaging interface
  if (user && user.userType === 'centre') {
    return (
      <section className="flex-1 flex flex-col">
        {/* Two-column messaging layout for centers */}
        <div className="flex-1 flex bg-white rounded-lg shadow-sm border border-gray-200 m-6 overflow-hidden">
          <CenterConversationList
            conversations={conversationsData?.conversations || []}
            onConversationSelect={handleConversationSelect}
            activeConversationId={selectedConversation?.id}
          />
          <CenterChatArea
            conversation={conversationMessages || selectedConversation}
            messages={messages}
            onSendMessage={handleSendMessage}
          />
        </div>
      </section>
    );
  }

  // Loading state
  if (!user) {
    return (
      <section className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0d4a70] mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </section>
    );
  }

  const handleAcceptRequest = async () => {
    const acceptContent = 'Bonjour,\n\nJe confirme ma disponibilité pour cette session d\'examen.\n\nMerci pour les détails fournis. J\'ai hâte de collaborer avec votre centre.\n\nCordialement';
    await handleSendMessage(acceptContent);
  };

  const handleDeclineRequest = async () => {
    const declineContent = 'Bonjour,\n\nJe vous remercie pour cette proposition, mais je ne suis malheureusement pas disponible pour cette date.\n\nN\'hésitez pas à me recontacter pour de futures missions.\n\nCordialement';
    await handleSendMessage(declineContent);
  };

  // Show empty state if no conversations exist
  if (conversationsData && (!conversationsData.conversations || conversationsData.conversations.length === 0)) {
    return (
      <section className="flex-1 p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0d4a70] mb-2">Messagerie</h1>
          <p className="text-gray-600">Gérez vos conversations avec les centres de formation</p>
        </div>

        {/* Empty state */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune conversation</h3>
            <p className="text-gray-600">
              Vous n'avez pas échangé de messages, contactez un centre pour voir vos messages ici
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 flex flex-col">
      {/* Two-column messaging layout */}
      <div className="flex-1 flex bg-white rounded-lg shadow-sm border border-gray-200 m-6 overflow-hidden">
        <ConversationList
          conversations={conversationsData?.conversations || []}
          onConversationSelect={handleConversationSelect}
          activeConversationId={selectedConversation?.id}
        />
        <ChatArea
          conversation={conversationMessages || selectedConversation}
          messages={messages}
          onSendMessage={handleSendMessage}
          onAcceptRequest={handleAcceptRequest}
          onDeclineRequest={handleDeclineRequest}
          pendingRequest={undefined}
        />
      </div>
    </section>
  );
}
