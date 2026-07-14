"use client";

import type { WalletName } from "@solana/wallet-adapter-base";
import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";

import type { LoginResponse } from "@/features/auth/authservice";
import { loginWithSolanaApi } from "@/features/auth/authservice";
import { getErrorMessage } from "@/lib/error-utils";
import { waitForWalletSelection } from "../lib/extension-wallet";
import { getWalletEntry } from "../lib/wallet-registry";

export function useWalletLogin() {
    const { wallet, wallets, select, connect } = useSolanaWallet();
    const [loading, setLoading] = useState<string | null>(null);

    const loginWithWallet = async (walletName: string): Promise<LoginResponse | null> => {
        const entry = getWalletEntry(walletName);
        if (!entry) throw new Error(`Unsupported wallet: ${walletName}`);

        const adapterWallet = wallets.find((c) => c.adapter.name === walletName);
        if (!adapterWallet) {
            window.open(entry.installUrl, "_blank");
            return null;
        }

        setLoading(walletName);
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

            const data = await loginWithSolanaApi({
                walletAddress,
                walletIcon: entry.walletIcon,
                signMessage: (msg) => signer.signMessage!(msg)
            });

            return data;
        } catch (error) {
            throw new Error(getErrorMessage(error));
        } finally {
            setLoading(null);
        }
    };

    return { loginWithWallet, loading };
}
