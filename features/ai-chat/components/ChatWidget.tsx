"use client"
import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { ChatWindow } from "./ChatWindow";
import { Button } from "@/components/ui/button";

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div data-testid="chat-widget" className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button
          data-testid="chat-widget-button"
          onClick={() => setIsOpen(true)}
          className="rounded-full h-14 w-14 shadow-xl"
          size="icon"
        >
          <MessageCircle size={24} />
        </Button>
      ) : (
        <div className="w-96 h-[560px] bg-background border rounded-xl shadow-xl flex flex-col overflow-hidden" data-testid="chat-widget-panel">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <div className="font-semibold">AI Assistant</div>
            <Button size="icon" onClick={() => setIsOpen(false)} data-testid="chat-widget-close">
              <X size={18} />
            </Button>
          </div>
          <div className="flex-1">
            <ChatWindow />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
