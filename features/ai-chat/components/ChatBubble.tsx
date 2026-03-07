'use client';

import React from 'react';
import { User, Bot } from 'lucide-react';
import { ChatMessageDto } from '@/types/dto';
import { ResponseRenderer } from './ResponseRenderer';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export const ChatBubble: React.FC<{ message: ChatMessageDto }> = ({ message }) => {
  const isUser = message.role === 'user';

  const timeString = message.timestamp 
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className={cn(
      "flex w-full gap-3 group animate-in fade-in slide-in-from-bottom-2 duration-300",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      <Avatar className="w-8 h-8 shrink-0 mt-0.5 shadow-sm border border-background">
        {isUser ? (
          <AvatarFallback className="bg-primary/10 text-primary">
            <User className="w-4 h-4" />
          </AvatarFallback>
        ) : (
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            <Bot className="w-4 h-4" />
          </AvatarFallback>
        )}
      </Avatar>

      <div className={cn(
        "flex flex-col gap-1 max-w-[85%] sm:max-w-[75%]",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "flex items-baseline gap-2 mx-1 opacity-0 group-hover:opacity-100 transition-opacity",
          isUser ? "flex-row-reverse" : "flex-row"
        )}>
          <span className="text-xs font-medium text-foreground/80">
            {isUser ? 'You' : 'Assistant'}
          </span>
          {timeString && (
            <span className="text-[10px] text-muted-foreground">
              {timeString}
            </span>
          )}
        </div>

        {isUser ? (
          <div className="bg-primary text-primary-foreground px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm leading-relaxed whitespace-pre-wrap shadow-sm">
            {message.content}
          </div>
        ) : (
          <div className="bg-muted text-foreground border border-border/50 px-4 py-2.5 rounded-2xl rounded-tl-sm text-sm leading-relaxed shadow-sm w-full">
            {message.content && (
              <div className="whitespace-pre-wrap mb-2 last:mb-0 break-words">
                {message.content}
              </div>
            )}
            
            {message.type && message.type !== 'text' && (
              <div className="mt-3 w-full">
                <ResponseRenderer 
                  response={{
                    type: message.type,
                    content: message.content,
                    data: message.data,
                  }} 
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
