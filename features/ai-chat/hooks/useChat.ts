"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { phantomWallet } from "@/lib/wallet";
import { ChatSocketManager } from "../services/chat.socket.service";
import { ChatMessageDto, ChatResponseDto, ChatPageContext } from "@/types/dto";

const SESSION_ID_KEY = "solsight_chat_session_id";
const MESSAGES_KEY = "solsight_chat_messages";

function loadFromSessionStorage<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
        const raw = sessionStorage.getItem(key);
        if (!raw) return fallback;
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

function saveToSessionStorage(key: string, value: unknown): void {
    if (typeof window === "undefined") return;
    try {
        sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
        // ignore
    }
}

function getOrCreateSessionId(): string {
    if (typeof window === "undefined") return crypto.randomUUID();
    const existing = sessionStorage.getItem(SESSION_ID_KEY);
    if (existing) return existing;
    const newId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_ID_KEY, newId);
    return newId;
}

export function useChat() {
    const [messages, setMessages] = useState<ChatMessageDto[]>(() => loadFromSessionStorage<ChatMessageDto[]>(MESSAGES_KEY, []));
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [toolProgressLabel, setToolProgressLabel] = useState<string | null>(null);
    const sessionIdRef = useRef<string>(crypto.randomUUID());
    const socketManager = ChatSocketManager.getInstance();
    const { user } = useAuth();

    useEffect(() => {
        saveToSessionStorage(MESSAGES_KEY, messages);
    }, [messages]);

    useEffect(() => {
        const sessionId = sessionIdRef.current;

        socketManager.onResponse(sessionId, (response: ChatResponseDto) => {
            setToolProgressLabel(null);
            setMessages((prev) => [
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
            setIsLoading(false);
            setToolProgressLabel(null);
        });

        socketManager.onError(sessionId, (err) => {
            setError(err.message);
            setIsLoading(false);
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
    }, [socketManager]);

    const buildPageContext = (): ChatPageContext => {
        const currentPathname = typeof window !== "undefined" ? window.location.pathname : "/";
        const tokenMatch = currentPathname.match(/^\/token\/([1-9A-HJ-NP-Za-km-z]{32,44})$/);
        return {
            pathname: currentPathname,
            tokenAddress: tokenMatch?.[1] ?? undefined
        };
    };

    const sendMessage = (text: string) => {
        setMessages((prev) => [
            ...prev,
            {
                role: "user",
                content: text,
                timestamp: Date.now()
            }
        ]);
        setIsLoading(true);
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

    return { messages, isLoading, toolProgressLabel, error, sendMessage };
}
