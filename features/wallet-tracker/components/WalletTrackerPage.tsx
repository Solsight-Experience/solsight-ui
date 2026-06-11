"use client";

import React from "react";
import { WatchlistSidebar } from "./WatchlistSidebar";
import { WatchedWalletDetail } from "./WatchedWalletDetail";
import { WalletTrackerEmpty } from "./WalletTrackerEmpty";
import { useWatchlistStore } from "../store/watchlistStore";

export const WalletTrackerPage: React.FC = () => {
    const selectedWalletAddress = useWatchlistStore((s) => s.selectedWalletAddress);

    return (
        <div className="grid grid-cols-[280px_1fr] min-h-screen">
            <WatchlistSidebar />

            <div className="overflow-y-auto">
                {selectedWalletAddress ? <WatchedWalletDetail walletAddress={selectedWalletAddress} /> : <WalletTrackerEmpty />}
            </div>
        </div>
    );
};
