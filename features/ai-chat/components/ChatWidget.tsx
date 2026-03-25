"use client";

import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { ChatWindow } from "./ChatWindow";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
            <div
                className={cn(
                    "transition-all duration-300 ease-out flex flex-col overflow-hidden bg-background shadow-2xl origin-bottom-right",
                    isOpen ? "scale-100 opacity-100 translate-y-0 pointer-events-auto" : "scale-95 opacity-0 translate-y-8 pointer-events-none",
                    "fixed bottom-0 right-0 w-full h-[85vh] rounded-t-2xl border-t border-x sm:bottom-20 sm:right-0 sm:w-[400px] sm:h-[600px] sm:rounded-2xl sm:border"
                )}
                aria-hidden={!isOpen}
                role="dialog"
                aria-label="AI Assistant Chat"
            >
                <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
                        <span className="font-semibold text-sm">Solsight Assistant</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-muted"
                        onClick={() => setIsOpen(false)}
                        aria-label="Close chat"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex-1 overflow-hidden relative">
                    <ChatWindow />
                </div>
            </div>

            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "rounded-full h-14 w-14 shadow-xl transition-all duration-300 hover:scale-105 active:scale-95",
                    isOpen ? "rotate-90 scale-0 opacity-0 absolute" : "rotate-0 scale-100 opacity-100"
                )}
                size="icon"
                aria-expanded={isOpen}
                aria-label={isOpen ? "Close chat assistant" : "Open chat assistant"}
            >
                <MessageCircle className="h-6 w-6" />
            </Button>
        </div>
    );
};

export default ChatWidget;
