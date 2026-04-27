"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useSocketContext } from "@/providers/socket-provider";
import { STREAMS, type StreamKey } from "@/lib/stream/registry";
import type { StreamEventMap, StreamParamsMap } from "@/lib/stream/events";
import type { ConnectionStatus } from "@/lib/stream/types";

interface UseStreamOptions<TData> {
    enabled?: boolean;
    onEvent?: (data: TData) => void;
}

interface UseStreamReturn<TData> {
    data: TData | undefined;
    status: ConnectionStatus;
    error: Error | null;
    stop: () => void;
}

export function useStream<K extends StreamKey>(
    key: K,
    params: StreamParamsMap[K],
    options?: UseStreamOptions<StreamEventMap[K]>
): UseStreamReturn<StreamEventMap[K]> {
    const { adapter, status } = useSocketContext();
    const [data, setData] = useState<StreamEventMap[K] | undefined>();
    const [error, setError] = useState<Error | null>(null);

    const enabled = options?.enabled ?? true;
    const stoppedRef = useRef(false);
    const cleanupRef = useRef<(() => void) | null>(null);
    const onEventRef = useRef(options?.onEvent);
    onEventRef.current = options?.onEvent;

    const paramsKey = useMemo(() => JSON.stringify(params), [params]);

    useEffect(() => {
        if (!enabled || stoppedRef.current) return;

        const entry = STREAMS[key] as unknown as {
            subscribe: string;
            unsubscribe: string;
            event: string;
            buildSubscribePayload: (p: StreamParamsMap[K]) => Record<string, string>;
            buildRoomKey?: (p: StreamParamsMap[K]) => string;
        };
        const payload = entry.buildSubscribePayload(params);
        const roomKey = entry.buildRoomKey?.(params);

        adapter.subscribe(entry.subscribe, payload, roomKey);

        const unsubscribeListener = adapter.on(
            entry.event,
            (rawData) => {
                const typed = rawData as StreamEventMap[K];
                onEventRef.current?.(typed);
                if (!stoppedRef.current) {
                    setData(typed);
                }
            },
            roomKey
        );

        cleanupRef.current = () => {
            unsubscribeListener();
            adapter.unsubscribe(entry.unsubscribe, payload);
        };

        return () => {
            cleanupRef.current?.();
            cleanupRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, paramsKey, enabled, adapter]);

    // Clear error on successful reconnect
    useEffect(() => {
        if (!adapter) return;
        const cleanup = adapter.onStatusChange((newStatus) => {
            if (newStatus === "connected" && error) {
                setError(null);
            }
        });
        return cleanup;
    }, [adapter, error]);

    // Capture socket connection errors
    useEffect(() => {
        if (!adapter) return;
        const unsubError = adapter.on("connect_error", (err: unknown) => {
            if (err instanceof Error) {
                setError(err);
            } else if (typeof err === "object" && err !== null && "message" in err) {
                setError(new Error((err as { message: string }).message));
            } else {
                setError(new Error("Socket connection error"));
            }
        });
        return unsubError;
    }, [adapter]);

    const stop = useCallback(() => {
        stoppedRef.current = true;
        cleanupRef.current?.();
        cleanupRef.current = null;
    }, []);

    return { data, status, error, stop };
}
