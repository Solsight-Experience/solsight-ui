"use client";

import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";
import type { Transaction, VersionedTransaction } from "@solana/web3.js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { WalletService } from "../services/wallet.service";
import { getErrorMessage } from "@/lib/error-utils";
import { toast } from "sonner";

type NativeSolanaProvider = {
    isPhantom?: boolean;
    isConnected?: boolean;
    publicKey?: { toBase58?: () => string; toString?: () => string } | null;
    connect?: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey?: { toBase58?: () => string; toString?: () => string } }>;
    disconnect?: () => Promise<void>;
    signTransaction?: <T extends Transaction | VersionedTransaction>(transaction: T) => Promise<T>;
};

function getNativeSolanaProvider(): NativeSolanaProvider | null {
    if (typeof window === "undefined") {
        return null;
    }

    const walletWindow = window as Window & {
        phantom?: { solana?: NativeSolanaProvider };
        solana?: NativeSolanaProvider;
    };

    return walletWindow.phantom?.solana ?? walletWindow.solana ?? null;
}

function normalizeWalletIcon(walletName?: string) {
    const normalized = walletName?.toLowerCase();
    return normalized === "phantom" ? "phantom" : "custom";
}

function getAdapterPublicKey(wallet: ReturnType<typeof useSolanaWallet>["wallet"], fallback: string | null) {
    const adapter = wallet?.adapter as { publicKey?: { toBase58?: () => string; toString?: () => string } } | undefined;
    return adapter?.publicKey?.toBase58?.() ?? adapter?.publicKey?.toString?.() ?? fallback;
}

function getAdapterSignTransaction(wallet: ReturnType<typeof useSolanaWallet>["wallet"]) {
    const adapter = wallet?.adapter as
        | {
              signTransaction?: <T extends Transaction | VersionedTransaction>(transaction: T) => Promise<T>;
          }
        | undefined;

    if (!adapter?.signTransaction) {
        return null;
    }

    return <T extends Transaction | VersionedTransaction>(transaction: T) => adapter.signTransaction!(transaction);
}

function getNativePublicKey(provider: NativeSolanaProvider | null) {
    return provider?.publicKey?.toBase58?.() ?? provider?.publicKey?.toString?.() ?? null;
}

function getSelectedOrPreferredWallet(wallet: ReturnType<typeof useSolanaWallet>["wallet"], wallets: ReturnType<typeof useSolanaWallet>["wallets"]) {
    if (wallet) {
        return wallet;
    }

    return wallets.find((candidate) => candidate.adapter.name === "Phantom") ?? wallets[0] ?? null;
}

function waitForWalletSelection(wallets: ReturnType<typeof useSolanaWallet>["wallets"], walletName: string, timeoutMs = 1000) {
    const startedAt = Date.now();

    return new Promise<void>((resolve, reject) => {
        const poll = () => {
            const selectedWallet = wallets.find((candidate) => candidate.adapter.name === walletName);
            if (selectedWallet?.adapter) {
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

export function useWallet() {
    const queryClient = useQueryClient();
    const { connected, connecting, publicKey, wallet, wallets, select, connect, disconnect } = useSolanaWallet();
    const nativeProvider = getNativeSolanaProvider();

    const publicKeyBase58 = publicKey?.toBase58() ?? getNativePublicKey(nativeProvider);
    const effectiveConnected = connected || !!publicKeyBase58 || !!nativeProvider?.isConnected;
    const effectiveSignTransaction = getAdapterSignTransaction(wallet) ?? nativeProvider?.signTransaction ?? null;

    // Connect through the app-level Solana wallet adapter and keep backend wallet linking idempotent.
    const connectWallet = useMutation({
        mutationFn: async () => {
            const selectedWallet = getSelectedOrPreferredWallet(wallet, wallets);

            if (!selectedWallet) {
                if (!nativeProvider?.connect) {
                    throw new Error("No supported wallet found. Please install Phantom or Solflare.");
                }
            }

            if (!wallet && selectedWallet) {
                select(selectedWallet.adapter.name);
                await waitForWalletSelection(wallets, selectedWallet.adapter.name);
            }

            if (!effectiveConnected) {
                if (wallet) {
                    await connect();
                } else if (nativeProvider?.connect) {
                    await nativeProvider.connect();
                } else {
                    await connect();
                }
            }

            const adapterPublicKey = getAdapterPublicKey(wallet ?? selectedWallet ?? null, publicKeyBase58) ?? getNativePublicKey(nativeProvider);

            if (!adapterPublicKey) {
                throw new Error("Failed to get public key from wallet");
            }

            const walletName = selectedWallet?.adapter.name ?? (nativeProvider?.isPhantom ? "Phantom" : "wallet");

            try {
                const walletData = await WalletService.connectWallet(adapterPublicKey, walletName, normalizeWalletIcon(walletName));
                return walletData;
            } catch (error) {
                const message = getErrorMessage(error).toLowerCase();
                if (message.includes("wallet already exists")) {
                    return {
                        address: adapterPublicKey,
                        name: walletName,
                        icon: normalizeWalletIcon(walletName)
                    };
                }
                throw error;
            }
        },
        onSuccess: () => {
            toast.success("Wallet connected successfully!");
            queryClient.invalidateQueries({ queryKey: ["wallets"] });
            queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
        },
        onError: (error: unknown) => {
            toast.error(getErrorMessage(error, "Failed to connect wallet"));
        }
    });

    // Disconnect wallet
    const disconnectWallet = useMutation({
        mutationFn: async () => {
            if (publicKeyBase58) {
                await WalletService.disconnectWallet(publicKeyBase58);
            }
            await disconnect();
        },
        onSuccess: () => {
            toast.success("Wallet disconnected");
            queryClient.invalidateQueries({ queryKey: ["wallets"] });
            queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
        },
        onError: (error: unknown) => {
            toast.error(getErrorMessage(error, "Failed to disconnect wallet"));
        }
    });

    return {
        connectWallet: connectWallet.mutate,
        disconnectWallet: disconnectWallet.mutate,
        isConnecting: connecting || connectWallet.isPending,
        isDisconnecting: disconnectWallet.isPending,
        connected: effectiveConnected,
        publicKey: publicKeyBase58,
        signTransaction: effectiveSignTransaction
    };
}

export function useWalletBalance(address?: string) {
    return useQuery({
        queryKey: ["wallet-balance", address],
        queryFn: () => WalletService.getWalletBalance(address!),
        enabled: !!address,
        refetchInterval: 30000 // Refetch every 30 seconds
    });
}

export function useUserWallets() {
    return useQuery({
        queryKey: ["wallets"],
        queryFn: WalletService.getUserWallets
    });
}
