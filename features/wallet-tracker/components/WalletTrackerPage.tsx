"use client";

import React from "react";
import { WatchlistSidebar } from "./WatchlistSidebar";
import { WatchedWalletDetail } from "./WatchedWalletDetail";
import { WalletTrackerEmpty } from "./WalletTrackerEmpty";
import { useWatchlistStore } from "../store/watchlistStore";

export const WalletTrackerPage: React.FC = () => {
    const selectedWalletAddress = useWatchlistStore((s) => s.selectedWalletAddress);
    const selectedWalletNetwork = useWatchlistStore((s) => s.selectedWalletNetwork);

    return (
        <div className="grid grid-cols-[280px_1fr] min-h-screen">
            <WatchlistSidebar />

            <div className="overflow-y-auto">
                {selectedWalletAddress ? <WatchedWalletDetail walletAddress={selectedWalletAddress} network={selectedWalletNetwork} /> : <WalletTrackerEmpty />}
            </div>
        </div>
    );
};
