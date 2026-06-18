import { useState, useEffect } from "react";
import bs58 from "bs58";
import apiClient from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { portfolioKeys } from "./portfolio.hooks";
import { getErrorMessage } from "@/lib/error-utils";

// Define Phantom types
type PhantomEvent = "connect" | "disconnect" | "accountChanged";

interface PublicKey {
    toString: () => string;
    toBase58: () => string;
}

interface PhantomProvider {
    isPhantom: boolean;
    publicKey: PublicKey;
    isConnected: boolean;
    signMessage: (message: Uint8Array, display?: string) => Promise<{ signature: Uint8Array; publicKey: PublicKey }>;
    connect: (opts?: { onlyIfTrusted: boolean }) => Promise<{ publicKey: PublicKey }>;
    disconnect: () => Promise<void>;
    on: (event: PhantomEvent, handler: (args: PublicKey | null) => void) => void;
    request: (method: Record<string, unknown>) => Promise<unknown>;
}

// Define MetaMask/Ethereum types
interface EthereumProvider {
    isMetaMask?: boolean;
    isPhantom?: boolean;
    providers?: EthereumProvider[];
    request: (args: { method: string; params?: Record<string, unknown> }) => Promise<unknown>;
}

const getProvider = (): PhantomProvider | undefined => {
    if (typeof window !== "undefined") {
        if ("phantom" in window) {
            const provider = (window as Window & { phantom?: { solana?: PhantomProvider } }).phantom?.solana;
            if (provider?.isPhantom) {
                return provider;
            }
        }
        // Fallback to window.solana for older versions or other wallets mimicking
        const provider = (window as Window & { solana?: PhantomProvider }).solana;
        if (provider?.isPhantom) {
            return provider;
        }
    }
    return undefined;
};

const getMetaMaskProvider = (): EthereumProvider | undefined => {
    if (typeof window === "undefined") return undefined;

    const ethereum = (window as Window & { ethereum?: EthereumProvider }).ethereum;

    if (!ethereum) return undefined;

    if (ethereum.providers?.length) {
        const provider = ethereum.providers.find((p) => p.isMetaMask && !p.isPhantom);
        if (provider) return provider;
    }

    // If single provider, check if it is MetaMask and NOT Phantom
    if (ethereum.isMetaMask && !ethereum.isPhantom) {
        return ethereum;
    }

    return undefined;
};

const SOLANA_SNAP_ID = "npm:@solflare-wallet/solana-snap";

export const useWalletAuth = () => {
    const queryClient = useQueryClient();
    const [provider, setProvider] = useState<PhantomProvider | undefined>(undefined);
    const [walletKey, setWalletKey] = useState<string | null>(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const provider = getProvider();
        if (provider) setProvider(provider);
    }, []);

    useEffect(() => {
        if (!provider) return;

        // Eager connect
        provider
            .connect({ onlyIfTrusted: true })
            .then(({ publicKey }) => {
                setWalletKey(publicKey.toString());
                setConnected(true);
            })
            .catch(() => {});

        const handleConnect = (publicKey: PublicKey | null) => {
            if (publicKey) {
                setWalletKey(publicKey.toString());
                setConnected(true);
                console.log("Connected to Phantom:", publicKey.toString());
            }
        };

        const handleDisconnect = () => {
            setWalletKey(null);
            setConnected(false);
            console.log("Disconnected from Phantom");
        };

        const handleAccountChanged = (publicKey: PublicKey | null) => {
            if (publicKey) {
                setWalletKey(publicKey.toString());
                setConnected(true);
                console.log("Switched account:", publicKey.toString());
            } else {
                // Attempt reconnect or handle disconnect
                provider.connect().catch((err) => {
                    console.error("Failed to reconnect:", err);
                });
            }
        };

        provider.on("connect", handleConnect);
        provider.on("disconnect", handleDisconnect);
        provider.on("accountChanged", handleAccountChanged);

        return () => {};
    }, [provider]);

    const connectPhantom = async () => {
        const provider = getProvider();
        if (provider) {
            try {
                const resp = await provider.connect();
                setWalletKey(resp.publicKey.toString());
                setConnected(true);
                return resp.publicKey;
            } catch (err) {
                console.error("User rejected or error:", err);
                throw err;
            }
        } else {
            window.open("https://phantom.app/", "_blank");
        }
    };

    const connectMetaMask = async () => {
        const provider = getMetaMaskProvider();

        if (!provider) {
            // Check if the issue is conflict with Phantom
            const ethereum = (window as Window & { ethereum?: EthereumProvider }).ethereum;
            if (ethereum?.isPhantom) {
                alert("Phantom Wallet is intercepting MetaMask calls. Please disable Phantom's Ethereum support in its settings or use the Phantom button.");
                return null;
            }

            window.open("https://metamask.io/", "_blank");
            return null;
        }

        try {
            // 1. Request Snap
            await provider.request({
                method: "wallet_requestSnaps",
                params: {
                    [SOLANA_SNAP_ID]: {}
                }
            });

            // 2. Get Account
            const result = await provider.request({
                method: "wallet_invokeSnap",
                params: {
                    snapId: SOLANA_SNAP_ID,
                    request: {
                        method: "getAccount"
                    }
                }
            });

            // Result contains publicKey
            const publicKey = (result as { publicKey: string }).publicKey;
            setWalletKey(publicKey);
            setConnected(true);
            return publicKey;
        } catch (error) {
            console.error("MetaMask connection error:", error);
            throw error;
        }
    };

    const handleWalletConnect = async (walletName: string, userId?: string): Promise<boolean> => {
        if (walletName === "Phantom") {
            try {
                const pubKey = await connectPhantom();
                if (pubKey) {
                    const walletAddress = pubKey.toString();

                    // 1. Get Nonce
                    const { nonce } = await apiClient.get<{ nonce: string }>("/auth/solana/nonce", {
                        params: { walletAddress }
                    });

                    // 2. Sign Nonce
                    const messageBytes = new TextEncoder().encode(nonce);
                    if (!provider) throw new Error("Provider not found");

                    const { signature } = await provider.signMessage(messageBytes);
                    const signatureStr = bs58.encode(signature);

                    // 3. Verify
                    const response = await apiClient.post<{ success: boolean; message: string }>("/auth/solana/verify", {
                        walletAddress,
                        signature: signatureStr,
                        walletIcon: "phantom",
                        userId
                    });

                    if (response.success) {
                        // Wait a bit for backend to process the wallet addition
                        await new Promise((resolve) => setTimeout(resolve, 500));

                        // Invalidate and refetch all portfolio queries
                        await queryClient.invalidateQueries({ queryKey: portfolioKeys.all });
                        await queryClient.refetchQueries({
                            queryKey: portfolioKeys.all,
                            type: "active"
                        });

                        return true;
                    }
                }
                return false;
            } catch (error: unknown) {
                console.error("Wallet connection/login error:", error);
                throw new Error(getErrorMessage(error));
            }
        } else if (walletName === "MetaMask") {
            try {
                const walletAddress = await connectMetaMask();
                if (walletAddress) {
                    // 1. Get Nonce
                    const { nonce } = await apiClient.get<{ nonce: string }>("/auth/solana/nonce", {
                        params: { walletAddress }
                    });

                    // 2. Sign Nonce
                    const provider = getMetaMaskProvider();
                    if (!provider) throw new Error("MetaMask provider not found");

                    const messageBytes = new TextEncoder().encode(nonce);

                    // Solflare Snap expects message as Uint8Array (serialized as array) or string.
                    const snapResult = await provider.request({
                        method: "wallet_invokeSnap",
                        params: {
                            snapId: SOLANA_SNAP_ID,
                            request: {
                                method: "signMessage",
                                params: {
                                    message: Array.from(messageBytes),
                                    display: "utf8"
                                }
                            }
                        }
                    });
                    const { signature } = snapResult as { signature: string };

                    const signatureStr = signature;

                    // 3. Verify & Login
                    const response = await apiClient.post<{ success: boolean; message: string }>("/auth/solana/verify", {
                        walletAddress,
                        signature: signatureStr,
                        userId
                    });

                    if (response.success) {
                        // Wait a bit for backend to process the wallet addition
                        await new Promise((resolve) => setTimeout(resolve, 500));

                        // Invalidate and refetch all portfolio queries
                        await queryClient.invalidateQueries({ queryKey: portfolioKeys.all });
                        await queryClient.refetchQueries({
                            queryKey: portfolioKeys.all,
                            type: "active"
                        });

                        return true;
                    }
                }
                return false;
            } catch (error: unknown) {
                console.error("MetaMask connection/login error:", error);
                throw new Error(getErrorMessage(error));
            }
        } else {
            throw new Error(`Connect ${walletName} coming soon!`);
        }
    };

    return { handleWalletConnect, connected, walletKey };
};
