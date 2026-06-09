"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

type PhantomEvent = "connect" | "disconnect" | "accountChanged";

interface PhantomProvider {
    isPhantom: boolean;
    connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString(): string } }>;
    disconnect: () => Promise<void>;
    on: (event: PhantomEvent, handler: (...args: unknown[]) => void) => void;
    off: (event: PhantomEvent, handler: (...args: unknown[]) => void) => void;
    publicKey: { toString(): string } | null;
    isConnected: boolean;
    network?: string;
}

function getPhantom(): PhantomProvider | undefined {
    if (typeof window === "undefined") return undefined;
     
    return (window as any).phantom?.solana ?? (window as any).solana ?? undefined;
}

export function useStakingWallet() {
    const phantom = getPhantom();

    const [connected, setConnected] = useState<boolean>(phantom?.isConnected ?? false);
    const [publicKey, setPublicKey] = useState<string | null>(phantom?.publicKey?.toString() ?? null);

    useEffect(() => {
        const p = getPhantom();
        if (!p) return;

        const onConnect = () => {
            setConnected(true);
            setPublicKey(p.publicKey?.toString() ?? null);
        };
        const onDisconnect = () => {
            setConnected(false);
            setPublicKey(null);
        };
        const onAccountChanged = (pk: unknown) => {
            if (pk) {
                setPublicKey((pk as { toString(): string }).toString());
                setConnected(true);
            } else {
                setConnected(false);
                setPublicKey(null);
            }
        };

        p.on("connect", onConnect);
        p.on("disconnect", onDisconnect);
        p.on("accountChanged", onAccountChanged);

        if (p.isConnected && p.publicKey) {
            setConnected(true);
            setPublicKey(p.publicKey.toString());
        }

        return () => {
            p.off("connect", onConnect);
            p.off("disconnect", onDisconnect);
            p.off("accountChanged", onAccountChanged);
        };
    }, []);

    const connect = useCallback(async () => {
        const p = getPhantom();
        if (!p) {
            toast.error("Phantom wallet not found. Please install it from phantom.app");
            return;
        }
        try {
            const resp = await p.connect();
            setConnected(true);
            setPublicKey(resp.publicKey.toString());
        } catch (err) {
            const msg = ((err as Error)?.message ?? "").toLowerCase();
            if (!msg.includes("rejected") && !msg.includes("cancelled")) {
                toast.error("Failed to connect wallet. Please try again.");
            }
        }
    }, []);

    const disconnect = useCallback(async () => {
        const p = getPhantom();
        if (p) await p.disconnect();
        setConnected(false);
        setPublicKey(null);
    }, []);

    const isDevnet: boolean | null = (() => {
        const p = getPhantom();
        const network = p?.network;
        if (!network) return null;
        return network === "devnet";
    })();

    return {
        connected,
        publicKey,
        isConnecting: false,
        isDevnet,
        connect,
        disconnect
    };
}
