"use client";

import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";

import { ArrowDown, Send, Bot, CircleDollarSign, LineChart, ArrowLeftRight, Loader2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChatBubble } from "./ChatBubble";
import { ChatMessageDto } from "@/types/dto";

import { useVirtualizer } from "@tanstack/react-virtual";

const WelcomeScreen: React.FC<{ onSelect: (text: string) => void }> = ({ onSelect }) => (
    <div className="flex flex-col items-center justify-center text-center space-y-4 py-6 px-4 sm:py-10 sm:px-6">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 opacity-20 blur-xl animate-pulse" />
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Bot className="w-7 h-7 sm:w-9 sm:h-9 text-white" />
            </div>
        </div>

        <div className="space-y-1.5">
            <h3 className="font-semibold text-sm sm:text-base text-foreground">Solsight AI Assistant</h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-[260px] leading-relaxed">
                Your intelligent DeFi co-pilot on Solana. Ask me anything about tokens, portfolios, or trades.
            </p>
        </div>

        <div className="flex flex-col gap-2 w-full max-w-[280px]">
            {[
                {
                    icon: <CircleDollarSign className="w-4 h-4 text-emerald-400" />,
                    text: "Current price of SOL?"
                },
                {
                    icon: <LineChart className="w-4 h-4 text-violet-400" />,
                    text: "Summarize my portfolio data"
                },
                {
                    icon: <ArrowLeftRight className="w-4 h-4 text-blue-400" />,
                    text: "Swap 1 SOL to USDC"
                }
            ].map(({ icon, text }) => (
                <Button
                    key={text}
                    variant="ghost"
                    onClick={() => onSelect(text)}
                    className="flex items-center justify-start gap-2.5 px-3 py-4 sm:px-3.5 sm:py-6 rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/60 hover:border-violet-500/30 active:scale-[0.98] transition-all cursor-pointer group text-left w-full"
                >
                    <div className="shrink-0">{icon}</div>
                    <span className="text-xs sm:text-sm text-muted-foreground group-hover:text-foreground transition-colors whitespace-normal leading-tight">
                        {text}
                    </span>
                </Button>
            ))}
        </div>
    </div>
);

const TypingIndicator: React.FC<{ label?: string }> = ({ label }) => (
    <div className="flex items-start gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <Bot className="w-3.5 h-3.5 text-white" />
        </div>

        <div className="bg-card border border-border/60 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
            {label ? (
                <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />

                        <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />

                        <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>

                    <span className="text-xs text-muted-foreground">{label}</span>
                </div>
            ) : (
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />

                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />

                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
            )}
        </div>
    </div>
);

interface ChatWindowProps {
    messages: ChatMessageDto[];
    isTyping: boolean;
    isHistoryLoading?: boolean;
    toolProgressLabel: string | null;
    error: string | null;
    sendMessage: (text: string) => void;
    fetchNextPage?: () => void;
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
    messages,
    isTyping,
    isHistoryLoading,
    toolProgressLabel,
    error,
    sendMessage,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
}) => {
    const [inputValue, setInputValue] = useState("");
    const [showScrollButton, setShowScrollButton] = useState(false);

    const parentRef = useRef<HTMLDivElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const shouldAutoScrollRef = useRef(false);

    const virtualizer = useVirtualizer({
        count: messages.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 100,
        overscan: 10
    });

    const virtualItems = virtualizer.getVirtualItems();

    const adjustTextareaHeight = () => {
        if (!textareaRef.current) return;

        textareaRef.current.style.height = "auto";

        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    };

    useEffect(() => {
        adjustTextareaHeight();
    }, [inputValue]);

    const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
        const parent = parentRef.current;

        if (!parent) return;

        parent.scrollTo({
            top: parent.scrollHeight,
            behavior
        });
    }, []);

    useEffect(() => {
        const firstItem = virtualItems[0];

        if (!firstItem) return;

        if (firstItem.index === 0 && hasNextPage && !isFetchingNextPage && fetchNextPage) {
            fetchNextPage();
        }
    }, [virtualItems, hasNextPage, isFetchingNextPage, fetchNextPage]);

    useLayoutEffect(() => {
        if (isFetchingNextPage) return;

        const shouldScroll = shouldAutoScrollRef.current || !showScrollButton;

        if (!shouldScroll) return;

        requestAnimationFrame(() => {
            scrollToBottom(shouldAutoScrollRef.current ? "smooth" : "auto");

            shouldAutoScrollRef.current = false;
        });
    }, [messages.length, isTyping, showScrollButton, isFetchingNextPage, scrollToBottom]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement;

        const distanceFromBottom = target.scrollHeight - target.scrollTop - target.clientHeight;

        const isAtBottom = distanceFromBottom <= 80;

        setShowScrollButton(!isAtBottom);
    };

    const handleSend = () => {
        if (!inputValue.trim() || isTyping) return;

        shouldAutoScrollRef.current = true;

        sendMessage(inputValue);

        setInputValue("");

        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full relative">
            <ScrollArea className="flex-1 overflow-auto" onScrollCapture={handleScroll}>
                <div className="flex flex-col gap-4 px-3 py-4 sm:px-4" role="log" aria-live="polite">
                    {messages.length === 0 && <WelcomeScreen onSelect={sendMessage} />}

                {isHistoryLoading && messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full gap-2 opacity-50 animate-in fade-in duration-500">
                        <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />

                        <span className="text-[10px] uppercase tracking-widest font-bold text-violet-500/80">Loading History</span>
                    </div>
                )}

                {isFetchingNextPage && <div className="flex justify-center py-2 text-xs text-muted-foreground">Loading older messages...</div>}

                <div
                    style={{
                        height: `${virtualizer.getTotalSize()}px`,
                        width: "100%",
                        position: "relative"
                    }}
                >
                    {virtualItems.map((virtualItem) => {
                        const msg = messages[virtualItem.index];

                        return (
                            <div
                                key={virtualItem.key}
                                data-index={virtualItem.index}
                                ref={virtualizer.measureElement}
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    transform: `translateY(${virtualItem.start}px)`
                                }}
                                className="py-2"
                            >
                                <ChatBubble message={msg} />
                            </div>
                        );
                    })}
                </div>

                {isTyping && (
                    <div className="mt-4">
                        <TypingIndicator label={toolProgressLabel ?? undefined} />
                    </div>
                )}

                {error && (
                    <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 text-destructive text-[11px] font-medium px-4 py-3 rounded-xl mx-2 mt-4 animate-in fade-in slide-in-from-top-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span className="flex-1">{error}</span>
                    </div>
                )}
            </div>

            {showScrollButton && (
                <Button
                    variant="outline"
                    size="icon"
                    className="absolute bottom-20 right-1/2 translate-x-1/2 rounded-full shadow-lg bg-background border border-border w-8 h-8 flex items-center justify-center hover:bg-muted transition-all animate-in fade-in slide-in-from-bottom-2 z-10 text-muted-foreground hover:text-foreground"
                    onClick={() => scrollToBottom("smooth")}
                    aria-label="Scroll to bottom"
                >
                    <ArrowDown className="h-4 w-4" />
                </Button>
            )}

            <div className="shrink-0 px-2 pb-2 pt-2 sm:px-3 sm:pb-3 sm:pt-3 border-t border-border/60 bg-background/80 backdrop-blur-sm">
                <div
                    className={cn(
                        "relative flex items-end gap-2 rounded-2xl px-3 py-2 transition-all duration-200",
                        "bg-muted/40 border border-border/60",
                        "focus-within:bg-background focus-within:border-violet-500/40 focus-within:shadow-[0_0_0_3px_hsl(var(--violet-500)/0.08)]",
                        inputValue.trim() && "border-violet-500/30"
                    )}
                >
                    <textarea
                        ref={textareaRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask Solsight AI anything..."
                        className="min-h-[24px] max-h-[120px] w-full resize-none border-0 bg-transparent p-0 py-1.5 shadow-none outline-none text-sm placeholder:text-muted-foreground/60"
                        disabled={isTyping}
                        rows={1}
                        aria-label="Chat input"
                    />

                    <Button
                        size="icon"
                        onClick={handleSend}
                        disabled={isTyping || !inputValue.trim()}
                        className={cn(
                            "shrink-0 h-8 w-8 rounded-xl flex items-center justify-center transition-all duration-200 border-0",
                            inputValue.trim() && !isTyping
                                ? "bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md shadow-violet-500/20 hover:shadow-violet-500/30 hover:scale-105 active:scale-95"
                                : "bg-muted-foreground/15 text-muted-foreground cursor-not-allowed"
                        )}
                        aria-label="Send message"
                    >
                        <Send className="h-3.5 w-3.5" />
                    </Button>
                </div>

                <p className="text-[10px] text-center text-muted-foreground/50 mt-3 px-2">AI responses may not be accurate. Verify before trading.</p>
            </div>
        </div>
    );
};

export default ChatWindow;
