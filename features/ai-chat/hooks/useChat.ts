"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { phantomWallet } from "@/lib/wallet";
import { useChatStream } from "./useChatStream";
import type { ChatMessageDto, ChatResponseDto } from "@/types/dto";

export function useChat() {
    const [messages, setMessages] = useState<ChatMessageDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const sessionIdRef = useRef<string>(crypto.randomUUID());
    const { user } = useAuth();

    const { send } = useChatStream({
        sessionId: sessionIdRef.current,
        onResponse: (response: ChatResponseDto) => {
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
        },
        onComplete: () => {
            setIsLoading(false);
        },
        onError: (err) => {
            setError(err.message);
            setIsLoading(false);
        }
    });

    const sendMessage = (text: string) => {
        setMessages((prev) => [...prev, { role: "user", content: text, timestamp: Date.now() }]);
        setIsLoading(true);
        setError(null);
        send({
            message: text,
            sessionId: sessionIdRef.current,
            userId: user?.id,
            walletAddress: phantomWallet.publicKey ?? undefined
        });
    };

    return { messages, isLoading, error, sendMessage };
}
