'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface Conversation {
  id: string;
  centerName: string;
  centerInitials: string;
  location: string;
  status: 'pending' | 'accepted' | 'refused' | 'contact';
  statusText: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  isActive?: boolean;
}

interface ConversationListProps {
  conversations: Conversation[];
  onConversationSelect: (conversation: Conversation) => void;
  activeConversationId?: string;
}

const statusConfig = {
  pending: { color: 'bg-yellow-400', text: 'Demande en attente' },
  accepted: { color: 'bg-green-500', text: 'Mission acceptée' },
  refused: { color: 'bg-red-500', text: 'Mission refusée' },
  contact: { color: 'bg-yellow-400', text: 'Contact initié' }
};

export function ConversationList({ conversations, onConversationSelect, activeConversationId }: ConversationListProps) {
  return (
    <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-gray-200">
        <h2 className="text-lg font-bold text-[#0d4a70] mb-2">Conversations</h2>
        <p className="text-sm text-gray-600">{conversations.length} conversations actives</p>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => onConversationSelect(conversation)}
            className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 ${
              activeConversationId === conversation.id 
                ? 'bg-green-50 border-r-3 border-r-[#13d090]' 
                : ''
            }`}
          >
            <div className="flex items-start space-x-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#13d090] to-[#0fb378] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {conversation.centerInitials}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold text-[#0d4a70] truncate">
                    {conversation.centerName}
                  </h3>
                  <div className={`w-2 h-2 rounded-full ${statusConfig[conversation.status].color}`} />
                </div>
                
                <p className="text-xs text-gray-600 mb-2">
                  {conversation.location} • {conversation.statusText}
                </p>
                
                <div className="text-xs text-gray-600 mb-2 overflow-hidden" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: '1.3',
                  maxHeight: '2.6em'
                }}>
                  {conversation.lastMessage || 'Nouvelle conversation'}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{conversation.timestamp}</span>
                  {conversation.unreadCount && (
                    <Badge className="bg-[#13d090] text-white text-xs px-2 py-0.5 rounded-full">
                      {conversation.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
