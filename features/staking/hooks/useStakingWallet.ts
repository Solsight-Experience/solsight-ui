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

type WindowWithPhantom = Window &
    typeof globalThis & {
        phantom?: { solana?: PhantomProvider };
        solana?: PhantomProvider;
    };

function getPhantom(): PhantomProvider | undefined {
    if (typeof window === "undefined") return undefined;
    const walletWindow = window as WindowWithPhantom;
    return walletWindow.phantom?.solana ?? walletWindow.solana ?? undefined;
}

export function useStakingWallet() {
    const [connected, setConnected] = useState(false);
    const [publicKey, setPublicKey] = useState<string | null>(null);
    const [isDevnet, setIsDevnet] = useState<boolean | null>(null);

    useEffect(() => {
        const p = getPhantom();
        if (!p) {
            setIsDevnet(null);
            return;
        }

        const syncWalletState = () => {
            setConnected(p.isConnected);
            setPublicKey(p.isConnected ? (p.publicKey?.toString() ?? null) : null);
            setIsDevnet(p.network ? p.network === "devnet" : null);
        };

        const onConnect = () => {
            setConnected(true);
            setPublicKey(p.publicKey?.toString() ?? null);
            setIsDevnet(p.network ? p.network === "devnet" : null);
        };
        const onDisconnect = () => {
            setConnected(false);
            setPublicKey(null);
            setIsDevnet(p.network ? p.network === "devnet" : null);
        };
        const onAccountChanged = (pk: unknown) => {
            if (pk) {
                setPublicKey((pk as { toString(): string }).toString());
                setConnected(true);
            } else {
                setConnected(false);
                setPublicKey(null);
            }
            setIsDevnet(p.network ? p.network === "devnet" : null);
        };

        p.on("connect", onConnect);
        p.on("disconnect", onDisconnect);
        p.on("accountChanged", onAccountChanged);

        syncWalletState();

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
            setIsDevnet(p.network ? p.network === "devnet" : null);
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
        setIsDevnet(p?.network ? p.network === "devnet" : null);
    }, []);

    return {
        connected,
        publicKey,
        isConnecting: false,
        isDevnet,
        connect,
        disconnect
    };
}
