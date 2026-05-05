"use client";

import React, { useState } from "react";
import { Bot, Sparkles, ChevronDown } from "lucide-react";
import { ChatWindow } from "./ChatWindow";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PulseRing: React.FC = () => (
    <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-background" />
    </span>
);

export const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
            <div
                className={cn(
                    "transition-all duration-300 ease-out flex flex-col overflow-hidden origin-bottom-right",
                    // Base (mobile): anchor left+right with margin — no w-full that bleeds on desktop
                    "fixed bottom-[72px] left-3 right-3 rounded-2xl",
                    // Constrain height so it never taller than viewport minus FAB+gap
                    "max-h-[calc(100svh-80px)]",
                    // ≥sm: revert to fixed-size floating panel, right-anchored
                    "sm:left-auto sm:right-4 sm:w-[400px] sm:h-[min(620px,calc(100svh-80px))] sm:max-h-none sm:bottom-[80px]",
                    "bg-background/95 backdrop-blur-xl",
                    "shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)]",
                    isOpen ? "scale-100 opacity-100 translate-y-0 pointer-events-auto" : "scale-95 opacity-0 translate-y-6 pointer-events-none"
                )}
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

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-muted transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground"
                        onClick={() => setIsOpen(false)}
                        aria-label="Close chat"
                    >
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex-1 overflow-hidden relative">
                    <ChatWindow />
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
                    "hover:scale-110 hover:bg-gradient-to-br hover:from-violet-500 hover:via-purple-600 hover:to-indigo-600 hover:shadow-violet-500/50 hover:shadow-2xl hover:text-white",
                    "text-white",
                    "active:scale-95",
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
