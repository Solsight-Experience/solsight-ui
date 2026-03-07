'use client'

import React, { useEffect, useRef, useState } from 'react';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { useChat } from '../hooks/useChat';
import { ChatBubble } from './ChatBubble';

export const ChatWindow: React.FC = () => {
  const { messages, isLoading, error, sendMessage } = useChat();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
    setInputValue('');
  };

  return (
    <div data-testid="chat-window" className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        {messages.map((msg, idx) => (
          <ChatBubble key={(msg as any).timestamp ?? idx} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </ScrollArea>

      {error && <p className="text-red-500 text-sm px-4">{error}</p>}

      {isLoading && (
        <div className="px-4 py-2 text-sm text-muted-foreground">
          <span>Loading...</span>
        </div>
      )}

      <div className="border-t p-4 flex gap-2">
        <Input
          data-testid="chat-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          disabled={isLoading}
        />

        <Button
          data-testid="chat-send-button"
          onClick={handleSend}
          disabled={isLoading || !inputValue.trim()}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </div>
  );
};

export default ChatWindow;
