"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { WalletService } from "../services/wallet.service";
import { phantomWallet } from "@/lib/wallet";
import { getErrorMessage } from "@/lib/error-utils";
import { toast } from "sonner";

export function useWallet() {
    const [isConnecting, setIsConnecting] = useState(false);
    const queryClient = useQueryClient();

    // Connect to Phantom wallet and register with backend
    const connectWallet = useMutation({
        mutationFn: async () => {
            setIsConnecting(true);

            // Connect to Phantom wallet to get public key
            await phantomWallet.connect();

            if (!phantomWallet.publicKey) {
                throw new Error("Failed to get public key from wallet");
            }

            // Register wallet with backend
            const walletData = await WalletService.connectWallet(phantomWallet.publicKey, "phantom");

            return walletData;
        },
        onSuccess: () => {
            toast.success("Wallet connected successfully!");
            queryClient.invalidateQueries({ queryKey: ["wallets"] });
            queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
        },
        onError: (error: unknown) => {
            toast.error(getErrorMessage(error, "Failed to connect wallet"));
        },
        onSettled: () => {
            setIsConnecting(false);
        }
    });

    // Disconnect wallet
    const disconnectWallet = useMutation({
        mutationFn: async () => {
            if (phantomWallet.publicKey) {
                await WalletService.disconnectWallet(phantomWallet.publicKey);
            }
            await phantomWallet.disconnect();
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
        isConnecting: isConnecting || connectWallet.isPending,
        isDisconnecting: disconnectWallet.isPending,
        connected: phantomWallet.connected,
        publicKey: phantomWallet.publicKey
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
