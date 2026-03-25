"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { ArrowDown, Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useChat } from "../hooks/useChat";
import { ChatBubble } from "./ChatBubble";

export const ChatWindow: React.FC = () => {
    const { messages, isLoading, error, sendMessage } = useChat();
    const [inputValue, setInputValue] = useState("");
    const [showScrollButton, setShowScrollButton] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustTextareaHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    };

    useEffect(() => {
        adjustTextareaHeight();
    }, [inputValue]);

    const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    }, []);

    useEffect(() => {
        if (!showScrollButton) {
            scrollToBottom("auto");
        }
    }, [messages, isLoading, showScrollButton, scrollToBottom]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement;
        if (target.dataset.slot !== "scroll-area-viewport" && !target.classList.contains("overflow-y-auto")) return;

        const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 80;
        setShowScrollButton(!isAtBottom);
    };

    const handleSend = () => {
        if (!inputValue.trim() || isLoading) return;
        sendMessage(inputValue);
        setInputValue("");

        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.focus();
        }
        setTimeout(() => scrollToBottom("smooth"), 100);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full bg-background relative">
            <ScrollArea className="flex-1 px-4 overflow-auto" onScrollCapture={handleScroll}>
                <div className="flex flex-col gap-5 py-6" role="log" aria-live="polite">
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 my-12 text-muted-foreground">
                            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-2xl">👋</span>
                            </div>
                            <div className="space-y-1">
                                <p className="font-medium text-foreground">Welcome to Solsight</p>
                                <p className="text-sm max-w-[250px]">Ask me about token analytics, your portfolio, or how to execute trades.</p>
                            </div>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <ChatBubble key={msg.timestamp ?? idx} message={msg} />
                    ))}

                    {isLoading && (
                        <div className="flex justify-start mb-2 animate-in fade-in zoom-in duration-300">
                            <div className="bg-card text-card-foreground border border-border px-4 py-3.5 rounded-2xl rounded-tl-sm flex items-center gap-1.5 shadow-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                                <div className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-lg mx-auto my-2 text-center max-w-[80%]">
                            {error}
                        </div>
                    )}
                    <div ref={messagesEndRef} className="h-1" />
                </div>
            </ScrollArea>

            {showScrollButton && (
                <Button
                    variant="secondary"
                    size="icon"
                    className="absolute bottom-20 right-1/2 translate-x-1/2 rounded-full shadow-md z-10 w-8 h-8 opacity-90 hover:opacity-100 transition-all animate-in fade-in slide-in-from-bottom-2"
                    onClick={() => scrollToBottom("smooth")}
                    aria-label="Scroll to bottom"
                >
                    <ArrowDown className="h-4 w-4" />
                </Button>
            )}

            <div className="p-3 bg-background border-t">
                <div className="relative flex items-end gap-2 bg-muted/40 border rounded-2xl px-3 py-2 focus-within:ring-1 focus-within:ring-primary focus-within:bg-background transition-colors">
                    <Textarea
                        ref={textareaRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask anything..."
                        className="min-h-[24px] max-h-[120px] w-full resize-none border-0 bg-transparent p-0 py-1.5 shadow-none focus-visible:ring-0 text-sm custom-scrollbar"
                        disabled={isLoading}
                        rows={1}
                        aria-label="Chat input"
                    />

                    <Button
                        onClick={handleSend}
                        disabled={isLoading || !inputValue.trim()}
                        size="icon"
                        className={cn(
                            "h-8 w-8 shrink-0 rounded-full transition-all",
                            inputValue.trim()
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-muted-foreground/20 text-muted-foreground hover:bg-muted-foreground/30"
                        )}
                        aria-label="Send message"
                    >
                        <Send className="h-4 w-4 ml-0.5" />
                    </Button>
                </div>
                <div className="text-[10px] text-center text-muted-foreground mt-2">AI can make mistakes. Verify important trades.</div>
            </div>
        </div>
    );
};

export default ChatWindow;
