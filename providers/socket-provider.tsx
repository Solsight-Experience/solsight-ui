"use client";

import { createContext, useContext, useRef, useEffect, useState, type ReactNode } from "react";
import { SocketIoAdapter } from "@/lib/stream/adapters/socket-io.adapter";
import type { StreamAdapter, ConnectionStatus } from "@/lib/stream";

interface SocketContextValue {
    adapter: StreamAdapter;
    status: ConnectionStatus;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
    const adapterRef = useRef<SocketIoAdapter | null>(null);
    if (!adapterRef.current && typeof window !== "undefined") {
        adapterRef.current = new SocketIoAdapter(process.env.NEXT_PUBLIC_SOCKET_URL!);
    }

    const [status, setStatus] = useState<ConnectionStatus>("disconnected");

    useEffect(() => {
        if (!adapterRef.current) return;

        const cleanup = adapterRef.current.onStatusChange((newStatus) => {
            setStatus(newStatus);
        });

        return cleanup;
    }, []);

    useEffect(() => {
        if (!adapterRef.current) return;

        adapterRef.current.connect();

        return () => {
            adapterRef.current?.disconnect();
        };
    }, []);

    return <SocketContext.Provider value={{ adapter: adapterRef.current!, status }}>{children}</SocketContext.Provider>;
}

export function useSocketContext(): SocketContextValue {
    const ctx = useContext(SocketContext);
    if (!ctx) throw new Error("useSocketContext must be used within SocketProvider");
    return ctx;
}
