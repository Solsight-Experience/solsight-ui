"use client";

import { useCallback, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useWallet } from "./useWallet";
import { useWallets } from "@/features/portfolio/hooks/portfolio.hooks";
import { useWalletAuth } from "@/features/portfolio/hooks/useWalletAuth";

export function useActionableWallet() {
    const wallet = useWallet();
    const { data: walletsData } = useWallets();
    const { handleWalletConnect } = useWalletAuth();

    const connectWalletToAccount = useMutation({
        mutationFn: async () => handleWalletConnect("Phantom"),
        onError: (error: unknown) => {
            const message = error instanceof Error ? error.message : "Failed to connect wallet.";
            toast.error(message);
        }
    });

    const isWalletLinkedToUser = useMemo(() => {
        if (!wallet.publicKey) {
            return false;
        }

        return (walletsData?.wallets ?? []).some((userWallet) => userWallet.address.toLowerCase() === wallet.publicKey!.toLowerCase());
    }, [wallet.publicKey, walletsData?.wallets]);

    const ensureWalletReadyForUserAction = useCallback(
        (actionLabel = "continue") => {
            if (!wallet.connected || !wallet.publicKey) {
                if (!wallet.isConnecting && !connectWalletToAccount.isPending) {
                    toast.warning("Please connect your wallet first.");
                    connectWalletToAccount.mutate();
                }
                return false;
            }

            if (!isWalletLinkedToUser) {
                toast.warning(`This wallet is not connected to your account. Please connect it before you ${actionLabel}.`);
                if (!connectWalletToAccount.isPending) {
                    connectWalletToAccount.mutate();
                }
                return false;
            }

            return true;
        },
        [connectWalletToAccount, isWalletLinkedToUser, wallet]
    );

    return {
        ...wallet,
        connectWallet: connectWalletToAccount.mutate,
        connectWalletAsync: connectWalletToAccount.mutateAsync,
        isWalletLinkedToUser,
        actionablePublicKey: isWalletLinkedToUser ? wallet.publicKey : null,
        isReadyForUserAction: !!wallet.connected && !!wallet.publicKey && isWalletLinkedToUser,
        isConnecting: wallet.isConnecting || connectWalletToAccount.isPending,
        ensureWalletReadyForUserAction
    };
}
