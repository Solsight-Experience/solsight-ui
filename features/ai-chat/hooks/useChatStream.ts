"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSocketContext } from "@/providers/socket-provider";
import type { ChatResponseDto, SendChatMessageDto } from "@/types/dto";

interface UseChatStreamOptions {
    sessionId: string;
    onResponse: (data: ChatResponseDto) => void;
    onComplete: () => void;
    onError: (err: { code: string; message: string }) => void;
}

interface UseChatStreamReturn {
    send: (payload: SendChatMessageDto) => void;
}

export function useChatStream({ sessionId, onResponse, onComplete, onError }: UseChatStreamOptions): UseChatStreamReturn {
    const { adapter } = useSocketContext();

    // Store latest callbacks in refs to avoid re-registering listeners
    const onResponseRef = useRef(onResponse);
    const onCompleteRef = useRef(onComplete);
    const onErrorRef = useRef(onError);
    onResponseRef.current = onResponse;
    onCompleteRef.current = onComplete;
    onErrorRef.current = onError;

    useEffect(() => {
        // Register listeners -- adapter.on() returns unsubscribe fn
        const offResponse = adapter.on("chat:response", (data) => {
            onResponseRef.current(data as ChatResponseDto);
        });
        const offComplete = adapter.on("chat:complete", () => {
            onCompleteRef.current();
        });
        const offError = adapter.on("chat:error", (err) => {
            onErrorRef.current(err as { code: string; message: string });
        });

        return () => {
            offResponse();
            offComplete();
            offError();
        };
    }, [adapter, sessionId]);

    const send = useCallback(
        (payload: SendChatMessageDto) => {
            adapter.emit("chat:message", payload);
        },
        [adapter]
    );

    return { send };
}
