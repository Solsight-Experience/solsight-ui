import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { getSolanaNonceMessage, signSolanaNonce } from "@/features/auth/authservice";
import { getErrorMessage } from "@/lib/error-utils";
import apiClient from "@/lib/network-requests/api-client";

import { portfolioKeys } from "./portfolio.hooks";

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

function waitForWalletSelection(wallets: ReturnType<typeof useSolanaWallet>["wallets"], walletName: string, timeoutMs = 1000) {
    const startedAt = Date.now();

    return new Promise<void>((resolve, reject) => {
        const poll = () => {
            const selected = wallets.find((candidate) => candidate.adapter.name === walletName);
            if (selected?.adapter) {
                resolve();
                return;
            }

            if (Date.now() - startedAt >= timeoutMs) {
                reject(new Error(`Wallet ${walletName} is not ready yet.`));
                return;
            }

            window.setTimeout(poll, 25);
        };

        poll();
    });
}

export const useWalletAuth = () => {
    const queryClient = useQueryClient();
    const { wallet, wallets, select, connect } = useSolanaWallet();
    const [provider, setProvider] = useState<PhantomProvider | undefined>(undefined);
    const [walletKey, setWalletKey] = useState<string | null>(null);
    const [connected, setConnected] = useState(false);

    // Shared post-verification handling: give the backend a moment to persist the wallet link,
    // then refresh portfolio data so the newly linked wallet appears.
    const refreshAfterVerify = async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        await queryClient.invalidateQueries({ queryKey: portfolioKeys.all });
        await queryClient.refetchQueries({
            queryKey: portfolioKeys.all,
            type: "active"
        });
    };

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

                    if (!provider) throw new Error("Provider not found");

                    const signedPayload = await signSolanaNonce(walletAddress, async (messageBytes) => {
                        const { signature } = await provider.signMessage(messageBytes);

                        return signature;
                    });

                    const response = await apiClient.post<{ success: boolean; message: string }>("/auth/solana/verify", {
                        walletAddress,
                        signature: signedPayload.signature,
                        nonce: signedPayload.nonce,
                        message: signedPayload.message,
                        walletIcon: "phantom",
                        userId
                    });

                    if (response.success) {
                        await refreshAfterVerify();
                        return true;
                    } else {
                        throw new Error(response.message || "Failed to verify wallet signature");
                    }
                }
                return false;
            } catch (error: unknown) {
                console.error("Wallet connection/login error:", error);
                throw new Error(getErrorMessage(error));
            }
        } else if (walletName === "Solflare") {
            try {
                const solflare = wallets.find((candidate) => candidate.adapter.name === "Solflare");
                if (!solflare) {
                    window.open("https://solflare.com/", "_blank");
                    return false;
                }

                // Select the Solflare adapter (if not already) and ensure it is connected.
                if (wallet?.adapter.name !== "Solflare") {
                    select(solflare.adapter.name);
                    await waitForWalletSelection(wallets, "Solflare");
                }
                if (!solflare.adapter.connected) {
                    await connect();
                }

                const walletAddress = solflare.adapter.publicKey?.toBase58();
                if (!walletAddress) throw new Error("Failed to get public key from Solflare");

                const signMessage = solflare.adapter as unknown as { signMessage?: (message: Uint8Array) => Promise<Uint8Array> };
                if (!signMessage.signMessage) throw new Error("Solflare does not support message signing");

                const signedPayload = await signSolanaNonce(walletAddress, (messageBytes) => signMessage.signMessage!(messageBytes));

                const response = await apiClient.post<{ success: boolean; message: string }>("/auth/solana/verify", {
                    walletAddress,
                    signature: signedPayload.signature,
                    nonce: signedPayload.nonce,
                    message: signedPayload.message,
                    walletIcon: "custom",
                    userId
                });

                if (response.success) {
                    await refreshAfterVerify();
                    return true;
                } else {
                    throw new Error(response.message || "Failed to verify wallet signature");
                }
            } catch (error: unknown) {
                console.error("Solflare connection/login error:", error);
                throw new Error(getErrorMessage(error));
            }
        } else if (walletName === "MetaMask") {
            try {
                const walletAddress = await connectMetaMask();
                if (walletAddress) {
                    const provider = getMetaMaskProvider();
                    if (!provider) throw new Error("MetaMask provider not found");

                    const messageBytes = await getSolanaNonceMessage(walletAddress);

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

                    const response = await apiClient.post<{ success: boolean; message: string }>("/auth/solana/verify", {
                        walletAddress,
                        signature: signatureStr,
                        userId
                    });

                    if (response.success) {
                        await refreshAfterVerify();
                        return true;
                    } else {
                        throw new Error(response.message || "Failed to verify wallet signature");
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
