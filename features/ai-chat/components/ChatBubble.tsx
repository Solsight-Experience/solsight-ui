'use client';

import React from 'react';
import { ChatMessageDto } from '@/types/dto';
import { ResponseRenderer } from './ResponseRenderer';

export const ChatBubble: React.FC<{ message: ChatMessageDto }> = ({ message }) => {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div className="bg-blue-600 text-white px-4 py-2 rounded-lg max-w-[80%] break-words">
          {message.content}
        </div>
      </div>
    );
  }

  const response = {
    type: message.type ?? 'text',
    content: message.content,
    data: message.data,
  };

  return (
    <div className="flex justify-start mb-4">
      <div className="bg-card text-card-foreground border border-border px-4 py-2 rounded-lg max-w-[80%] break-words">
        <ResponseRenderer response={response} />
      </div>
    </div>
  );
};

export default ChatBubble;
