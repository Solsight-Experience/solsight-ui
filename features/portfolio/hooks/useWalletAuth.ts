"use client";

import type { WalletName } from "@solana/wallet-adapter-base";
import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";
import { useQueryClient } from "@tanstack/react-query";

import { signSolanaNonce } from "@/features/auth/authservice";
import { getErrorMessage } from "@/lib/error-utils";
import apiClient from "@/lib/network-requests/api-client";

import { waitForWalletSelection } from "@/features/wallets/lib/extension-wallet";
import { getWalletEntry, SUPPORTED_WALLETS } from "@/features/wallets/lib/wallet-registry";
import { portfolioKeys } from "@/features/portfolio/hooks/portfolio.hooks";

export const useWalletAuth = () => {
    const queryClient = useQueryClient();
    const { wallet, wallets, select, connect } = useSolanaWallet();

    const refreshAfterVerify = async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        await queryClient.invalidateQueries({ queryKey: portfolioKeys.all });
        await queryClient.refetchQueries({ queryKey: portfolioKeys.all, type: "active" });
    };

    const handleWalletConnect = async (walletName: string, userId?: string): Promise<boolean> => {
        const entry = getWalletEntry(walletName);
        if (!entry) {
            const supported = SUPPORTED_WALLETS.map((w) => w.name as string).join(", ");
            throw new Error(`"${walletName}" is not supported. Supported wallets: ${supported}.`);
        }

        const adapterWallet = wallets.find((c) => c.adapter.name === walletName);
        if (!adapterWallet) {
            window.open(entry.installUrl, "_blank");
            return false;
        }

        try {
            if (wallet?.adapter.name !== walletName) {
                select(walletName as WalletName);
                await waitForWalletSelection(wallets, walletName);
            }
            if (!adapterWallet.adapter.connected) {
                await connect();
            }

            const walletAddress = adapterWallet.adapter.publicKey?.toBase58();
            if (!walletAddress) throw new Error(`Failed to get public key from ${walletName}.`);

            const signer = adapterWallet.adapter as unknown as { signMessage?: (msg: Uint8Array) => Promise<Uint8Array> };
            if (typeof signer.signMessage !== "function") {
                throw new Error(`${walletName} does not support message signing.`);
            }

            const signedPayload = await signSolanaNonce(walletAddress, (msg) => signer.signMessage!(msg));

            const response = await apiClient.post<{ success: boolean; message: string }>("/auth/solana/verify", {
                walletAddress,
                signature: signedPayload.signature,
                nonce: signedPayload.nonce,
                message: signedPayload.message,
                walletIcon: entry.walletIcon,
                userId
            });

            if (response.success) {
                await refreshAfterVerify();
                return true;
            }
            throw new Error(response.message || "Failed to verify wallet signature.");
        } catch (error: unknown) {
            throw new Error(getErrorMessage(error));
        }
    };

    return { handleWalletConnect };
};
