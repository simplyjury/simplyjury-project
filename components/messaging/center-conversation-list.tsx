'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface CenterConversation {
  id: string;
  juryName: string;
  juryEmail: string;
  juryInitials: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  isActive?: boolean;
}

interface CenterConversationListProps {
  conversations: CenterConversation[];
  onConversationSelect: (conversation: CenterConversation) => void;
  activeConversationId?: string;
}

export function CenterConversationList({ conversations, onConversationSelect, activeConversationId }: CenterConversationListProps) {
  return (
    <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-gray-200">
        <h2 className="text-lg font-bold text-[#0d4a70] mb-2">Conversations</h2>
        <p className="text-sm text-gray-600">{conversations.length} jurys vous ont contacté</p>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => onConversationSelect(conversation)}
            className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 ${
              activeConversationId === conversation.id 
                ? 'bg-blue-50 border-r-3 border-r-[#0d4a70]' 
                : ''
            }`}
          >
            <div className="flex items-start space-x-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0d4a70] to-[#1e5a7a] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {conversation.juryInitials}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold text-[#0d4a70] truncate">
                    {conversation.juryName}
                  </h3>
                  {conversation.unreadCount && conversation.unreadCount > 0 && (
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                  )}
                </div>
                
                <p className="text-xs text-gray-600 mb-2 truncate">
                  {conversation.juryEmail}
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
                  {conversation.unreadCount && conversation.unreadCount > 0 && (
                    <Badge className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
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
