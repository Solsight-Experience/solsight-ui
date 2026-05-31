"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";
import { WalletService } from "../services/wallet.service";
import { WalletResponseDto } from "@/types/dto";
import { getErrorMessage } from "@/lib/error-utils";
import { toast } from "sonner";
import { useWallet as useAdapterWallet } from "@solana/wallet-adapter-react";
import { PhantomWalletName } from "@solana/wallet-adapter-phantom";

export function useWallet() {
    const queryClient = useQueryClient();
    const { publicKey, connected, connect: adapterConnect, disconnect: adapterDisconnect, wallet, select, connecting } = useAdapterWallet();

    const [isUserInitiated, setIsUserInitiated] = useState(false);

    useEffect(() => {
        if (isUserInitiated && publicKey && connected) {
            WalletService.connectWallet(publicKey.toBase58(), wallet?.adapter.name?.toLowerCase() ?? "phantom")
                .then(() => {
                    queryClient.invalidateQueries({ queryKey: ["wallets"] });
                    toast.success("Wallet connected!");
                })
                .catch((err) => toast.error(getErrorMessage(err, "Failed to register wallet")))
                .finally(() => setIsUserInitiated(false));
        }
    }, [isUserInitiated, publicKey, connected, wallet, queryClient]);

    const connectWallet = useCallback(() => {
        setIsUserInitiated(true);
        if (!wallet) {
            select(PhantomWalletName);
        }
        adapterConnect().catch((err) => {
            setIsUserInitiated(false);
            toast.error(getErrorMessage(err, "Connect failed"));
        });
    }, [wallet, select, adapterConnect]);

    const disconnectWallet = useMutation({
        mutationFn: async () => {
            if (publicKey) {
                await WalletService.disconnectWallet(publicKey.toBase58());
            }
            await adapterDisconnect();
        },
        onSuccess: () => {
            toast.success("Wallet disconnected");
            queryClient.invalidateQueries({ queryKey: ["wallets"] });
        },
        onError: (error: unknown) => {
            toast.error(getErrorMessage(error, "Failed to disconnect wallet"));
        }
    });

    return {
        connectWallet,
        disconnectWallet: disconnectWallet.mutate,
        isConnecting: connecting || isUserInitiated,
        isDisconnecting: disconnectWallet.isPending,
        connected,
        publicKey: publicKey ? publicKey.toBase58() : null
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
