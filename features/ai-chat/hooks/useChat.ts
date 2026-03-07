'use client';

import { useState, useEffect, useRef } from 'react';
import { ChatSocketManager, ChatStreamChunk } from '../services/chat.socket.service';
import { ChatMessageDto, ChatResponseDto } from '@/types/dto';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionIdRef = useRef<string>(crypto.randomUUID());
  const streamingContentRef = useRef<string>('');
  const socketManager = ChatSocketManager.getInstance();

  useEffect(() => {
    const sessionId = sessionIdRef.current;

    socketManager.onStream(sessionId, (chunkPayload: ChatStreamChunk) => {
      if (chunkPayload.sessionId === sessionId) {
        streamingContentRef.current += chunkPayload.chunk;

        setMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
          const isLastMsgAssistant = lastMsg?.role === 'assistant' && lastMsg?.content;

          if (isLastMsgAssistant) {
            return [
              ...prev.slice(0, -1),
              {
                ...lastMsg,
                content: streamingContentRef.current,
              },
            ];
          }

          return [
            ...prev,
            {
              role: 'assistant',
              content: streamingContentRef.current,
              timestamp: Date.now(),
            },
          ];
        });
      }
    });

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
      streamingContentRef.current = '';
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
    streamingContentRef.current = '';
    socketManager.sendMessage({
      message: text,
      sessionId: sessionIdRef.current,
    });
  };

  return { messages, isLoading, error, sendMessage };
}
