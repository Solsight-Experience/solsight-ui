"use client";

import React from "react";
import { CircleUserRound, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatMessageDto } from "@/types/dto";
import { ResponseRenderer } from "./ResponseRenderer";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const MarkdownContent: React.FC<{ content: string }> = ({ content }) => (
    <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
            a: ({ href, children }) => (
                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-400 underline underline-offset-2 hover:text-violet-300 transition-colors break-all"
                >
                    {children}
                </a>
            ),
            p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
            h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-4 first:mt-0">{children}</h1>,
            h2: ({ children }) => <h2 className="text-md font-bold mb-2 mt-3 first:mt-0">{children}</h2>,
            h3: ({ children }) => <h3 className="text-sm font-bold mb-2 mt-2 first:mt-0">{children}</h3>,
            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 text-sm">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 text-sm">{children}</ol>,
            li: ({ children }) => <li>{children}</li>,
            table: ({ children }) => (
                <div className="my-4 w-full overflow-x-auto rounded-lg border border-border/40">
                    <table className="w-full border-collapse text-xs text-left">{children}</table>
                </div>
            ),
            thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
            th: ({ children }) => <th className="px-3 py-2 border-b border-border/40 font-semibold">{children}</th>,
            td: ({ children }) => <td className="px-3 py-2 border-b border-border/40 truncate max-w-[150px] hover:max-w-none transition-all">{children}</td>,
            tr: ({ children }) => <tr className="hover:bg-muted/30 transition-colors">{children}</tr>,
            strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
            em: ({ children }) => <em className="text-muted-foreground">{children}</em>,
            code: ({ children }) => (
                <code className="bg-muted/70 border border-border/40 px-1.5 py-0.5 rounded-md text-xs font-mono text-violet-300 break-all whitespace-pre-wrap">
                    {children}
                </code>
            ),
            blockquote: ({ children }) => <blockquote className="border-l-2 border-violet-500/40 pl-3 my-2 text-muted-foreground italic">{children}</blockquote>
        }}
    >
        {content}
    </ReactMarkdown>
);

export const ChatBubble: React.FC<{ message: ChatMessageDto }> = ({ message }) => {
    const isUser = message.role === "user";
    const timeString = message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

    return (
        <div className={cn("flex w-full gap-2.5 group animate-in fade-in slide-in-from-bottom-2 duration-200", isUser ? "flex-row-reverse" : "flex-row")}>
            <Avatar className="h-7 w-7 rounded-full shrink-0 mt-0.5">
                {isUser ? (
                    <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-700 border border-border/60 text-slate-300">
                        <CircleUserRound className="w-4 h-4" />
                    </AvatarFallback>
                ) : (
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 shadow-sm shadow-violet-500/20 text-white">
                        <Bot className="w-4 h-4" />
                    </AvatarFallback>
                )}
            </Avatar>

            <div className={cn("flex flex-col gap-1 min-w-0 max-w-[82%]", isUser ? "items-end" : "items-start")}>
                {isUser ? (
                    <div className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm leading-relaxed shadow-md shadow-violet-500/15">
                        {message.content}
                    </div>
                ) : (
                    <div
                        className={cn(
                            "text-sm leading-relaxed w-full",
                            "bg-card/80 backdrop-blur-sm border border-border/60",
                            "px-4 py-3 rounded-2xl rounded-tl-sm",
                            "shadow-sm"
                        )}
                    >
                        {message.content && (
                            <div className="break-words text-foreground/90">
                                <MarkdownContent content={message.content} />
                            </div>
                        )}

                        {message.type && message.type !== "text" && (
                            <div className={cn("w-full", message.content && "mt-3 pt-3 border-t border-border/40")}>
                                <ResponseRenderer
                                    response={{
                                        type: message.type,
                                        content: message.content,
                                        data: message.data
                                    }}
                                    timestamp={message.timestamp}
                                />
                            </div>
                        )}
                    </div>
                )}

                {timeString && (
                    <span className="text-[10px] text-muted-foreground/50 px-1 opacity-0 group-hover:opacity-100 transition-opacity">{timeString}</span>
                )}
            </div>
        </div>
    );
};

export default ChatBubble;
