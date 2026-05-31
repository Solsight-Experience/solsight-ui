"use client";

import { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { clusterApiUrl, ConnectionConfig } from "@solana/web3.js";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import useClusterStore from "@/stores/cluster.store";

// Import wallet adapter UI styles
import "@solana/wallet-adapter-react-ui/styles.css";

export function SolanaWalletProvider({ children }: { children: React.ReactNode }) {
    const { cluster } = useClusterStore();

    const endpoint = useMemo(() => {
        const network = cluster === "devnet" ? WalletAdapterNetwork.Devnet : WalletAdapterNetwork.Mainnet;
        return clusterApiUrl(network);
    }, [cluster]);

    const wallets = useMemo(
        () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
        [] // Wallets don't need to be re-created on cluster change
    );

    return (
        <ConnectionProvider key={cluster} endpoint={endpoint}>
            <WalletProvider key={cluster} wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}
