"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { phantomWallet } from "@/lib/wallet";
import { ChatSocketManager } from "../services/chat.socket.service";
import { ChatMessageDto, ChatResponseDto, ChatPageContext } from "@/types/dto";
import apiClient from "@/lib/network-requests/api-client";
import { CHAT_ENDPOINTS } from "@/lib/constants";

const SESSION_ID_KEY = "solsight_chat_session_id";

function getOrCreateSessionId(): string {
    if (typeof window === "undefined") return crypto.randomUUID();
    const existing = localStorage.getItem(SESSION_ID_KEY);
    if (existing) return existing;
    const newId = crypto.randomUUID();
    localStorage.setItem(SESSION_ID_KEY, newId);
    return newId;
}

interface ChatMessagesResponse {
    messages: {
        id: string;
        role: "user" | "assistant" | "tool";
        content: string;
        type?:
            | "text"
            | "token_brief"
            | "portfolio_summary"
            | "portfolio_activities"
            | "portfolio_performance"
            | "navigation"
            | "trade_intent"
            | "slippage_action";
        data?: Record<string, unknown>;
        toolCallId?: string;
        toolName?: string;
        createdAt: string;
    }[];
    nextCursor: string | null;
}

export function useChat() {
    const [localMessages, setLocalMessages] = useState<ChatMessageDto[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [toolProgressLabel, setToolProgressLabel] = useState<string | null>(null);

    const [sessionId, setSessionId] = useState<string>(getOrCreateSessionId());
    const sessionIdRef = useRef<string>(sessionId);

    const socketManager = ChatSocketManager.getInstance();
    const { user } = useAuth();
    // Fetch historical messages
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isHistoryLoading
    } = useInfiniteQuery({
        queryKey: ["chat_messages", sessionId],
        queryFn: async ({ pageParam = null }) => {
            const cursorQuery = pageParam ? `?cursor=${pageParam}` : "";
            return apiClient.get<ChatMessagesResponse>(`${CHAT_ENDPOINTS.MESSAGES(sessionId)}${cursorQuery}`);
        },
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        refetchOnWindowFocus: false,
        initialPageParam: null as string | null
    });

    const historicalMessages = useMemo(() => {
        if (!data) return [];
        const allMessages: ChatMessageDto[] = [];
        for (let i = data.pages.length - 1; i >= 0; i--) {
            const page = data.pages[i];
            for (const msg of page.messages) {
                allMessages.push({
                    role: msg.role,
                    content: msg.content,
                    type: msg.type,
                    data: msg.data,
                    timestamp: new Date(msg.createdAt).getTime(),
                    toolCallId: msg.toolCallId,
                    toolName: msg.toolName
                });
            }
        }
        return allMessages;
    }, [data]);

    const messages = useMemo(() => {
        const combined = [...historicalMessages, ...localMessages];
        return combined.filter((msg) => {
            if (msg.role === "user") return true;
            if (msg.role === "assistant") {
                return !!msg.content || (!!msg.type && msg.type !== "text");
            }
            return false;
        });
    }, [historicalMessages, localMessages]);

    useEffect(() => {
        sessionIdRef.current = sessionId;

        socketManager.onResponse(sessionId, (response: ChatResponseDto) => {
            setToolProgressLabel(null);
            setLocalMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: response.content || "",
                    type: response.type,
                    data: response.data,
                    timestamp: Date.now()
                }
            ]);
        });

        socketManager.onComplete(sessionId, () => {
            setIsTyping(false);
            setToolProgressLabel(null);
        });

        socketManager.onError(sessionId, (err) => {
            setError(err.message);
            setIsTyping(false);
            setToolProgressLabel(null);
        });

        socketManager.onToolProgress(sessionId, (payload) => {
            if (payload.sessionId === sessionId) {
                setToolProgressLabel(payload.label);
            }
        });

        return () => {
            socketManager.offSession(sessionId);
        };
    }, [sessionId, socketManager]);

    const buildPageContext = (): ChatPageContext => {
        const currentPathname = typeof window !== "undefined" ? window.location.pathname : "/";
        const tokenMatch = currentPathname.match(/^\/token\/([1-9A-HJ-NP-Za-km-z]{32,44})$/);
        return {
            pathname: currentPathname,
            tokenAddress: tokenMatch?.[1] ?? undefined
        };
    };

    const sendMessage = (text: string) => {
        setLocalMessages((prev) => [
            ...prev,
            {
                role: "user",
                content: text,
                timestamp: Date.now()
            }
        ]);
        setIsTyping(true);
        setError(null);
        setToolProgressLabel(null);
        socketManager.sendMessage({
            message: text,
            sessionId: sessionIdRef.current,
            userId: user?.id,
            walletAddress: phantomWallet.publicKey ?? undefined,
            pageContext: buildPageContext()
        });
    };

    const clearMessages = () => {
        setLocalMessages([]);
        const newId = crypto.randomUUID();
        localStorage.setItem(SESSION_ID_KEY, newId);
        setSessionId(newId);
        setError(null);
        setToolProgressLabel(null);
        setIsTyping(false);
    };

    return {
        messages,
        isTyping,
        isHistoryLoading,
        toolProgressLabel,
        error,
        sendMessage,
        clearMessages,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    };
}
