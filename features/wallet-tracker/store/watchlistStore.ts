import { create } from "zustand";
import { persist } from "zustand/middleware";

type WalletTrackerTab = "positions" | "activity" | "alerts";

interface WatchlistState {
    selectedWalletAddress: string | null;
    selectedWalletNetwork: "mainnet" | "devnet";
    setSelectedWallet: (address: string | null, network?: "mainnet" | "devnet") => void;

    activeTab: WalletTrackerTab;
    setActiveTab: (tab: WalletTrackerTab) => void;
}

export const useWatchlistStore = create<WatchlistState>()(
    persist(
        (set) => ({
            selectedWalletAddress: null,
            selectedWalletNetwork: "mainnet",
            setSelectedWallet: (address, network = "mainnet") => set({ selectedWalletAddress: address, selectedWalletNetwork: network }),

            activeTab: "positions",
            setActiveTab: (tab) => set({ activeTab: tab })
        }),
        {
            name: "watchlist-ui-state",
            partialize: (state) => ({
                selectedWalletAddress: state.selectedWalletAddress,
                selectedWalletNetwork: state.selectedWalletNetwork,
                activeTab: state.activeTab
            })
        }
    )
);
