"use client";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo } from "react";
import useClusterStore from "@/stores/cluster.store";

export function SolanaWalletProvider({ children }: { children: React.ReactNode }) {
    const cluster = useClusterStore((s) => s.cluster);

    const network = cluster === "mainnet" ? WalletAdapterNetwork.Mainnet : WalletAdapterNetwork.Devnet;

    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], [network]);

    // Key the provider on cluster so it remounts when cluster changes
    return (
        <ConnectionProvider key={cluster} endpoint={endpoint}>
            <WalletProvider key={cluster} wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}
