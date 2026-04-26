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
    const onEventRef = useRef(options?.onEvent);
    onEventRef.current = options?.onEvent;

    // Params stability (C7): stringify params to detect actual changes vs new object references
    const paramsKey = useMemo(() => JSON.stringify(params), [params]);
    const prevParamsKeyRef = useRef<string | undefined>(undefined);

    // Main subscription effect
    useEffect(() => {
        if (!enabled || stoppedRef.current) return;

        // Cast through unknown to avoid TypeScript union parameter mismatch;
        // the generic constraint K ensures params is the correct type at the call site.
        const entry = STREAMS[key] as unknown as {
            subscribe: string;
            unsubscribe: string;
            event: string;
            buildSubscribePayload: (p: StreamParamsMap[K]) => Record<string, string>;
            buildRoomKey?: (p: StreamParamsMap[K]) => string;
        };
        const payload = entry.buildSubscribePayload(params);
        const roomKey = entry.buildRoomKey?.(params);

        // Check if params actually changed (not just a new object reference with same values)
        const paramsChanged = prevParamsKeyRef.current !== paramsKey;
        prevParamsKeyRef.current = paramsKey;

        if (!paramsChanged && data !== undefined) {
            // Params are the same as before and we already have data — skip re-subscription
            return;
        }

        // Subscribe to the server-side room/channel
        adapter.subscribe(entry.subscribe, payload, roomKey);

        // Listen for events; adapter handles room filtering internally
        const unsubscribeListener = adapter.on(
            entry.event,
            (rawData) => {
                const typed = rawData as StreamEventMap[K];
                // Fire onEvent synchronously BEFORE setData so notification events are never lost
                onEventRef.current?.(typed);
                if (!stoppedRef.current) {
                    setData(typed);
                }
            },
            roomKey
        );

        return () => {
            unsubscribeListener();
            adapter.unsubscribe(entry.unsubscribe, payload);
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
    }, []);

    return { data, status, error, stop };
}
