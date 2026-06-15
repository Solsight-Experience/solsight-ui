"use client";

import React, { useState, useEffect } from "react";
import { Bot, Sparkles, ChevronDown, Maximize2, Minimize2, RotateCcw } from "lucide-react";
import { ChatWindow } from "./ChatWindow";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useChat } from "../hooks/useChat";
import { useAuth } from "@/contexts/AuthContext";

const PulseRing: React.FC = () => (
    <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-background" />
    </span>
);

export const ChatWidget: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    // Track viewport width so minimized `left` is a number (not auto) → CSS can animate it
    const [vpWidth, setVpWidth] = useState(() => (typeof window !== "undefined" ? window.innerWidth : 1280));
    const { messages, isTyping, isHistoryLoading, toolProgressLabel, error, sendMessage, clearMessages, fetchNextPage, hasNextPage, isFetchingNextPage } =
        useChat();

    useEffect(() => {
        const handler = () => setVpWidth(window.innerWidth);
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, []);

    if (!isAuthenticated) return null;

    const handleClose = () => {
        setIsExpanded(false);
        setIsOpen(false);
    };

    const MARGIN = 16;
    const PANEL_W = 400;
    const PANEL_H = 620;

    // All properties are explicit numbers in BOTH states → CSS transitions work smoothly.
    // Expanded: left:0 + right:0 (no width) pins exactly to viewport edges — no scrollbar overflow.
    // Minimized: left is computed from vpWidth so it's a number, not 'auto'.
    const panelStyle: React.CSSProperties = isExpanded
        ? {
              position: "fixed",
              bottom: 0,
              right: 0,
              left: 0,
              height: "100dvh",
              borderRadius: 0
          }
        : {
              position: "fixed",
              bottom: MARGIN,
              right: MARGIN,
              left: vpWidth - MARGIN - PANEL_W,
              height: PANEL_H,
              borderRadius: "1rem"
          };

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
            {/* Chat panel — transitions via inline style so animation runs bottom-right → top-left */}
            <div
                style={{
                    ...panelStyle,
                    transition: isOpen
                        ? "left 0.35s ease, right 0.35s ease, bottom 0.35s ease, height 0.35s ease, border-radius 0.35s ease, opacity 0.25s ease, transform 0.25s ease"
                        : "opacity 0.2s ease, transform 0.2s ease",
                    opacity: isOpen ? 1 : 0,
                    transform: isOpen ? "translateY(0)" : "translateY(16px)",
                    pointerEvents: isOpen ? "auto" : "none",
                    zIndex: 50,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden"
                }}
                className="bg-background/95 backdrop-blur-xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)]"
                role="dialog"
                aria-label="AI Assistant Chat"
                aria-hidden={!isOpen}
            >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-gradient-to-r from-card to-card/80 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                            <Bot className="w-4 h-4 text-white" />
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-background" />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-sm tracking-tight">Solsight AI</span>
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-violet-400 bg-violet-500/10 border border-violet-500/20 px-1.5 py-0.5 rounded-full">
                                    <Sparkles className="w-2.5 h-2.5" />
                                    AI
                                </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Powered by OpenAI · Online</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-muted transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground"
                            onClick={clearMessages}
                            aria-label="Clear chat"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-muted transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground"
                            onClick={() => setIsExpanded((prev) => !prev)}
                            aria-label={isExpanded ? "Collapse chat" : "Expand chat to full screen"}
                        >
                            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-muted transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground"
                            onClick={handleClose}
                            aria-label="Close chat"
                        >
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden relative">
                    <ChatWindow
                        messages={messages}
                        isTyping={isTyping}
                        isHistoryLoading={isHistoryLoading}
                        toolProgressLabel={toolProgressLabel}
                        error={error}
                        sendMessage={sendMessage}
                        fetchNextPage={fetchNextPage}
                        hasNextPage={hasNextPage}
                        isFetchingNextPage={isFetchingNextPage}
                    />
                </div>
            </div>

            <Button
                variant="ghost"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "relative rounded-full h-14 w-14 flex items-center justify-center border-0",
                    "bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600",
                    "shadow-xl shadow-violet-500/30",
                    "transition-all duration-300",
                    "hover:scale-110 hover:shadow-violet-500/50 hover:shadow-2xl hover:text-white",
                    "text-white active:scale-95",
                    isOpen ? "rotate-180 scale-90 opacity-0 pointer-events-none absolute" : "rotate-0 scale-100 opacity-100"
                )}
                aria-expanded={isOpen}
                aria-label={isOpen ? "Close chat assistant" : "Open chat assistant"}
            >
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 opacity-0 group-hover:opacity-100 blur-sm -z-10" />
                <Bot className="!h-6 !w-6 text-white" />
                <PulseRing />
            </Button>
        </div>
    );
};

export default ChatWidget;
