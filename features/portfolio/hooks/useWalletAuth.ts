"use client";

import { useMemo, useRef, useEffect } from "react";
import bs58 from "bs58";
import apiClient from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { portfolioKeys } from "./portfolio.hooks";
import { getErrorMessage } from "@/lib/error-utils";
import { useWallet } from "@solana/wallet-adapter-react";
import { PhantomWalletName } from "@solana/wallet-adapter-phantom";
import { useClusterStore } from "@/stores/cluster.store";

// Define MetaMask/Ethereum types
interface EthereumProvider {
    isMetaMask?: boolean;
    isPhantom?: boolean;
    providers?: EthereumProvider[];
    request: (args: { method: string; params?: Record<string, unknown> | unknown[] }) => Promise<unknown>;
}

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

const createSiwsMessage = (address: string, nonce: string, cluster: string): string => {
    const domain = typeof window !== "undefined" ? window.location.host : "solsight.io";
    const uri = typeof window !== "undefined" ? window.location.origin : "https://solsight.io";
    const issuedAt = new Date().toISOString();

    return `${domain} wants you to sign in with your Solana account:
${address}

Sign in to access your portfolio.

URI: ${uri}
Version: 1
Chain ID: solana:${cluster}
Nonce: ${nonce}
Issued At: ${issuedAt}`;
};

export const useWalletAuth = () => {
    const queryClient = useQueryClient();
    const { publicKey, connected, connect, signMessage, select, wallet } = useWallet();
    const publicKeyRef = useRef(publicKey);
    useEffect(() => {
        publicKeyRef.current = publicKey;
    }, [publicKey]);
    const { cluster } = useClusterStore();

    // Eager reconnect handled by WalletProvider autoConnect
    const walletKey = useMemo(() => publicKey?.toBase58() || null, [publicKey]);

    const connectMetaMask = async (): Promise<string | null> => {
        const provider = getMetaMaskProvider();

        if (!provider) {
            const ethereum = (window as Window & { ethereum?: EthereumProvider }).ethereum;
            if (ethereum?.isPhantom) {
                alert("Phantom Wallet is intercepting MetaMask calls. Please disable Phantom's Ethereum support in its settings or use the Phantom button.");
                return null;
            }

            window.open("https://metamask.io/", "_blank");
            return null;
        }

        try {
            await provider.request({
                method: "wallet_requestSnaps",
                params: {
                    [SOLANA_SNAP_ID]: {}
                }
            });

            const result = await provider.request({
                method: "wallet_invokeSnap",
                params: {
                    snapId: SOLANA_SNAP_ID,
                    request: {
                        method: "getAccount"
                    }
                }
            });

            const publicKey = (result as { publicKey: string }).publicKey;
            return publicKey;
        } catch (error) {
            console.error("MetaMask connection error:", error);
            throw error;
        }
    };

    const handleWalletConnect = async (walletName: string, userId?: string): Promise<boolean> => {
        try {
            let walletAddress: string | null = null;
            let signature: string;
            let messageToSign: string;
            let walletIcon: string;

            if (walletName === "Phantom") {
                if (!wallet || wallet.adapter.name !== PhantomWalletName) {
                    select(PhantomWalletName);
                    // The wallet selection might take a moment to propagate.
                    // We will proceed, and the next steps will use the selected wallet.
                    // A small delay might be needed if the wallet object isn't updated immediately.
                    await new Promise((resolve) => setTimeout(resolve, 100));
                }

                if (!publicKey) {
                    await connect();
                }

                let attempts = 0;
                while (!publicKeyRef.current && attempts < 20) {
                    await new Promise((r) => setTimeout(r, 100));
                    attempts++;
                }
                if (!publicKeyRef.current) {
                    throw new Error("Phantom wallet connection failed: public key not available after connect.");
                }
                walletAddress = publicKeyRef.current.toBase58();
                walletIcon = "phantom";

                if (!signMessage) {
                    throw new Error("Phantom wallet does not support signMessage.");
                }

                const { nonce } = await apiClient.get<{ nonce: string }>(`/api/auth/solana/nonce?walletAddress=${walletAddress}`);
                messageToSign = createSiwsMessage(walletAddress, nonce, cluster);
                const messageBytes = new TextEncoder().encode(messageToSign);
                const signedBytes = await signMessage(messageBytes);
                signature = bs58.encode(signedBytes);
            } else if (walletName === "MetaMask") {
                walletAddress = await connectMetaMask();
                if (!walletAddress) return false;
                walletIcon = "metamask";

                const { nonce } = await apiClient.get<{ nonce: string }>(`/api/auth/solana/nonce?walletAddress=${walletAddress}`);
                messageToSign = createSiwsMessage(walletAddress, nonce, cluster);
                const messageBytes = new TextEncoder().encode(messageToSign);

                const provider = getMetaMaskProvider();
                if (!provider) throw new Error("MetaMask provider not found");

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
                signature = (snapResult as { signature: string }).signature;
            } else {
                throw new Error(`Connect ${walletName} coming soon!`);
            }

            if (!walletAddress) {
                return false;
            }

            // TODO(security): backend must derive userId from authenticated session, not trust this client value
            const response = await apiClient.post<{ success: boolean; message: string }>("/api/auth/solana/verify", {
                walletAddress,
                signature,
                message: messageToSign,
                walletIcon,
                userId
            });

            if (response.success) {
                await new Promise((resolve) => setTimeout(resolve, 500));
                await queryClient.invalidateQueries({ queryKey: portfolioKeys.all });
                await queryClient.refetchQueries({
                    queryKey: portfolioKeys.all,
                    type: "active"
                });
                return true;
            }
            return false;
        } catch (error: unknown) {
            console.error(`Wallet connection/login error (${walletName}):`, error);
            throw new Error(getErrorMessage(error));
        }
    };

    return { handleWalletConnect, connected, walletKey };
};
