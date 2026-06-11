import { create } from "zustand";
import { persist } from "zustand/middleware";

type WalletTrackerTab = "positions" | "activity" | "alerts";

interface WatchlistState {
    selectedWalletAddress: string | null;
    setSelectedWalletAddress: (address: string | null) => void;

    activeTab: WalletTrackerTab;
    setActiveTab: (tab: WalletTrackerTab) => void;
}

export const useWatchlistStore = create<WatchlistState>()(
    persist(
        (set) => ({
            selectedWalletAddress: null,
            setSelectedWalletAddress: (address) => set({ selectedWalletAddress: address }),

            activeTab: "positions",
            setActiveTab: (tab) => set({ activeTab: tab })
        }),
        {
            name: "watchlist-ui-state",
            partialize: (state) => ({
                selectedWalletAddress: state.selectedWalletAddress,
                activeTab: state.activeTab
            })
        }
    )
);
