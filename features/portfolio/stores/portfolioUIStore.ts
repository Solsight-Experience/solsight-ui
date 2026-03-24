import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PortfolioFilters {
    timeFrom: string; // ISO string, ví dụ: "2025-04-05T08:30:00.000Z" hoặc ""
    timeTo: string; // ISO string hoặc ""
    hideFailedTxns: boolean;
    hideSpam: boolean;
}

interface PortfolioUIState {
    // Tab
    currentTab: "position" | "activity";
    setCurrentTab: (tab: "position" | "activity") => void;

    // Wallet collapse
    collapsedWallets: Record<string, boolean>;
    toggleWalletCollapse: (walletAddress: string) => void;
    setWalletCollapse: (walletAddress: string, collapsed: boolean) => void;

    // Filters
    filters: PortfolioFilters;
    setFilters: (filters: Partial<PortfolioFilters>) => void;
    resetFilters: () => void;

    // Selected wallets
    selectedWallets: string[];
    setSelectedWallets: (wallets: string[]) => void;
    toggleWalletSelection: (walletAddress: string) => void;
}

const defaultFilters: PortfolioFilters = {
    timeFrom: "",
    timeTo: "",
    hideFailedTxns: false,
    hideSpam: false
};

export const usePortfolioUIStore = create<PortfolioUIState>()(
    persist(
        (set) => ({
            currentTab: "position" as const,
            setCurrentTab: (tab) => set({ currentTab: tab }),

            collapsedWallets: {},
            toggleWalletCollapse: (walletAddress) =>
                set((state) => ({
                    collapsedWallets: {
                        ...state.collapsedWallets,
                        [walletAddress]: !state.collapsedWallets[walletAddress]
                    }
                })),
            setWalletCollapse: (walletAddress, collapsed) =>
                set((state) => ({
                    collapsedWallets: {
                        ...state.collapsedWallets,
                        [walletAddress]: collapsed
                    }
                })),

            filters: defaultFilters,
            setFilters: (newFilters) =>
                set((state) => ({
                    filters: { ...state.filters, ...newFilters }
                })),
            resetFilters: () => set({ filters: defaultFilters }),

            selectedWallets: [],
            setSelectedWallets: (wallets) => set({ selectedWallets: wallets }),
            toggleWalletSelection: (walletAddress) =>
                set((state) => ({
                    selectedWallets: state.selectedWallets.includes(walletAddress)
                        ? state.selectedWallets.filter((a) => a !== walletAddress)
                        : [...state.selectedWallets, walletAddress]
                }))
        }),
        {
            name: "portfolio-ui-state",
            partialize: (state) => ({
                currentTab: state.currentTab,
                collapsedWallets: state.collapsedWallets,
                filters: state.filters,
                selectedWallets: state.selectedWallets
            })
        }
    )
);
