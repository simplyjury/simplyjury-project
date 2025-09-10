'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, User } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'jury' | 'center';
  content: string;
  timestamp: string;
  isSystem?: boolean;
}

interface CenterChatAreaProps {
  conversation?: {
    id: string;
    juryName: string;
    juryEmail: string;
    juryInitials: string;
  };
  messages: Message[];
  onSendMessage: (message: string) => void;
}

export function CenterChatArea({ 
  conversation, 
  messages, 
  onSendMessage
}: CenterChatAreaProps) {
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium mb-2">Sélectionnez une conversation</p>
          <p className="text-sm">Choisissez un jury pour commencer à échanger</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="p-5 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0d4a70] to-[#1e5a7a] flex items-center justify-center text-white font-semibold">
            {conversation.juryInitials}
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0d4a70]">{conversation.juryName}</h3>
            <p className="text-sm text-gray-600">
              {conversation.juryEmail} • Jury professionnel
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <User className="w-4 h-4 mr-2" />
          Voir profil
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((message) => (
          <div key={message.id}>
            {message.isSystem ? (
              <div className="text-center">
                <span className="bg-gray-100 text-gray-600 text-xs px-4 py-2 rounded-full">
                  {message.content}
                </span>
              </div>
            ) : (
              <div className={`flex space-x-3 ${message.senderType === 'center' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                  message.senderType === 'center' 
                    ? 'bg-[#0d4a70]' 
                    : 'bg-gradient-to-br from-[#13d090] to-[#0fb378]'
                }`}>
                  {message.senderType === 'center' ? 'CF' : conversation.juryInitials.substring(0, 2)}
                </div>
                <div className={`flex-1 max-w-xs lg:max-w-md ${message.senderType === 'center' ? 'text-right' : ''}`}>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-semibold text-gray-600">{message.senderName}</span>
                    <span className="text-xs text-gray-400">{message.timestamp}</span>
                  </div>
                  <div className={`rounded-lg px-4 py-3 ${
                    message.senderType === 'center'
                      ? 'bg-[#0d4a70] text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}>
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="p-5 border-t border-gray-200 bg-gray-50">
        <div className="flex space-x-3">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tapez votre réponse..."
            className="flex-1 min-h-[44px] max-h-[120px] resize-none border-gray-300 focus:border-[#0d4a70] focus:ring-[#0d4a70]"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-[#0d4a70] hover:bg-[#1e5a7a] text-white px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
