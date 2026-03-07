'use client';

import { useState, useEffect, useRef } from 'react';
import { ChatSocketManager } from '../services/chat.socket.service';
import { ChatMessageDto, ChatResponseDto } from '@/types/dto';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionIdRef = useRef<string>(crypto.randomUUID());
  const socketManager = ChatSocketManager.getInstance();

  useEffect(() => {
    const sessionId = sessionIdRef.current;

    socketManager.onResponse(sessionId, (response: ChatResponseDto) => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.content || '',
          type: response.type,
          data: response.data,
          timestamp: Date.now(),
        },
      ]);
    });

    socketManager.onComplete(sessionId, () => {
      setIsLoading(false);
    });

    socketManager.onError(sessionId, (err) => {
      setError(err.message);
      setIsLoading(false);
    });

    return () => {
      socketManager.offSession(sessionId);
    };
  }, [socketManager]);

  const sendMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: text,
        timestamp: Date.now(),
      },
    ]);
    setIsLoading(true);
    setError(null);
    socketManager.sendMessage({
      message: text,
      sessionId: sessionIdRef.current,
    });
  };

  return { messages, isLoading, error, sendMessage };
}
