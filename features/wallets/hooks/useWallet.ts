"use client";

import type { WalletName } from "@solana/wallet-adapter-base";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/error-utils";
import { useConnectedWallet } from "./useConnectedWallet";
import { WalletService } from "../services/wallet.service";
import { normalizeWalletIcon, PREFERRED_WALLET_NAMES } from "../lib/wallet-registry";
import { waitForWalletSelection } from "../lib/extension-wallet";

export function useWallet() {
    const queryClient = useQueryClient();
    const { extensionWallet, wallet, wallets, select, connect, disconnect, connecting } =
         
        useConnectedWallet();

    const connectWallet = useMutation({
        mutationFn: async () => {
            // Pick the already-selected wallet or the first preferred one available
            let targetName = extensionWallet.name;
            if (!targetName) {
                for (const name of PREFERRED_WALLET_NAMES) {
                    if (wallets.find((c) => c.adapter.name === name)) {
                        targetName = name;
                        break;
                    }
                }
            }
            if (!targetName) throw new Error("No supported wallet found. Please install Phantom or Solflare.");

            if (wallet?.adapter.name !== targetName) {
                select(targetName as WalletName);
                await waitForWalletSelection(wallets, targetName);
            }
            if (!extensionWallet.connected) {
                await connect();
            }

            const pubkey = extensionWallet.publicKey ?? wallets.find((c) => c.adapter.name === targetName)?.adapter.publicKey?.toBase58();
            if (!pubkey) throw new Error("Failed to get public key from wallet.");

            try {
                const walletData = await WalletService.connectWallet(pubkey, targetName, normalizeWalletIcon(targetName));
                return walletData;
            } catch (error) {
                const msg = getErrorMessage(error).toLowerCase();
                if (msg.includes("wallet already exists")) {
                    return { address: pubkey, name: targetName, icon: normalizeWalletIcon(targetName) };
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

    const disconnectWallet = useMutation({
        mutationFn: async () => {
            if (extensionWallet.publicKey) {
                await WalletService.disconnectWallet(extensionWallet.publicKey);
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
        connected: extensionWallet.connected,
        publicKey: extensionWallet.publicKey,
        signTransaction: extensionWallet.signTransaction
    };
}

export function useWalletBalance(address?: string) {
    return useQuery({
        queryKey: ["wallet-balance", address],
        queryFn: () => WalletService.getWalletBalance(address!),
        enabled: !!address,
        refetchInterval: 30000
    });
}

export function useUserWallets() {
    return useQuery({
        queryKey: ["wallets"],
        queryFn: WalletService.getUserWallets
    });
}
