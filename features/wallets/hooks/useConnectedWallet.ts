"use client";

import type { WalletName } from "@solana/wallet-adapter-base";
import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import { toExtensionWallet, waitForWalletSelection } from "../lib/extension-wallet";
import { PREFERRED_WALLET_NAMES } from "../lib/wallet-registry";
import type { ExtensionWallet } from "../types/wallet.types";

export interface UseConnectedWalletReturn {
    extensionWallet: ExtensionWallet;
    wallet: ReturnType<typeof useSolanaWallet>["wallet"];
    wallets: ReturnType<typeof useSolanaWallet>["wallets"];
    select: ReturnType<typeof useSolanaWallet>["select"];
    connect: ReturnType<typeof useSolanaWallet>["connect"];
    disconnect: ReturnType<typeof useSolanaWallet>["disconnect"];
    connecting: boolean;
    selectAndConnect: (walletName: string) => Promise<ExtensionWallet>;
}

export function useConnectedWallet(): UseConnectedWalletReturn {
    const { connected, connecting, publicKey, wallet, wallets, select, connect, disconnect } = useSolanaWallet();

    const extensionWallet = useMemo(() => toExtensionWallet(wallet, publicKey, connected), [wallet, publicKey, connected]);

    const selectAndConnect = async (walletName: string): Promise<ExtensionWallet> => {
        const target = wallets.find((c) => c.adapter.name === walletName);
        if (!target) {
            const preferred = PREFERRED_WALLET_NAMES.map((n) => wallets.find((c) => c.adapter.name === n)).find(Boolean);
            if (!preferred) throw new Error(`Wallet "${walletName}" is not installed.`);
        }

        if (wallet?.adapter.name !== walletName) {
            select(walletName as WalletName);
            await waitForWalletSelection(wallets, walletName);
        }

        if (!connected) {
            await connect();
        }

        const after = wallets.find((c) => c.adapter.name === walletName);
        return toExtensionWallet(after ?? wallet, publicKey, true);
    };

    return {
        extensionWallet,
        wallet,
        wallets,
        select,
        connect,
        disconnect,
        connecting,
        selectAndConnect
    };
}
