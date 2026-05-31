"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@solana/wallet-adapter-react";
import { ChatSocketManager } from "../services/chat.socket.service";
import { ChatMessageDto, ChatResponseDto } from "@/types/dto";

export function useChat() {
    const [messages, setMessages] = useState<ChatMessageDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [toolProgressLabel, setToolProgressLabel] = useState<string | null>(null);
    const sessionIdRef = useRef<string>(crypto.randomUUID());
    const socketManager = ChatSocketManager.getInstance();
    const { user } = useAuth();
    const { publicKey } = useWallet();

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
            walletAddress: publicKey?.toBase58() ?? undefined
        });
    };

    return { messages, isLoading, toolProgressLabel, error, sendMessage };
}
