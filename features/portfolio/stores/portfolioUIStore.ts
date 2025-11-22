import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PortfolioFilters {
  timeFrom: { hour: string; minute: string; period: 'AM' | 'PM' };
  timeTo: { hour: string; minute: string; period: 'AM' | 'PM' };
  dateFrom: string;
  dateTo: string;
  hideFailedTxns: boolean;
  hideSpam: boolean;
}

interface PortfolioUIState {
  // Tab state
  currentTab: 'position' | 'activity';
  setCurrentTab: (tab: 'position' | 'activity') => void;

  // Wallet collapse state
  collapsedWallets: Record<string, boolean>;
  toggleWalletCollapse: (walletAddress: string) => void;
  setWalletCollapse: (walletAddress: string, collapsed: boolean) => void;

  // Filters
  filters: PortfolioFilters;
  setFilters: (filters: Partial<PortfolioFilters>) => void;
  resetFilters: () => void;

  // Selected wallets for viewing
  selectedWallets: string[];
  setSelectedWallets: (wallets: string[]) => void;
  toggleWalletSelection: (walletAddress: string) => void;
}

const defaultFilters: PortfolioFilters = {
  timeFrom: { hour: '', minute: '', period: 'AM' },
  timeTo: { hour: '', minute: '', period: 'AM' },
  dateFrom: '',
  dateTo: '',
  hideFailedTxns: false,
  hideSpam: false,
};

export const usePortfolioUIStore = create<PortfolioUIState>()(
  persist(
    (set) => ({
      // Tab state
      currentTab: 'position',
      setCurrentTab: (tab) => set({ currentTab: tab }),

      // Wallet collapse state
      collapsedWallets: {},
      toggleWalletCollapse: (walletAddress) =>
        set((state) => ({
          collapsedWallets: {
            ...state.collapsedWallets,
            [walletAddress]: !state.collapsedWallets[walletAddress],
          },
        })),
      setWalletCollapse: (walletAddress, collapsed) =>
        set((state) => ({
          collapsedWallets: {
            ...state.collapsedWallets,
            [walletAddress]: collapsed,
          },
        })),

      // Filters
      filters: defaultFilters,
      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),
      resetFilters: () => set({ filters: defaultFilters }),

      // Selected wallets
      selectedWallets: [],
      setSelectedWallets: (wallets) => set({ selectedWallets: wallets }),
      toggleWalletSelection: (walletAddress) =>
        set((state) => ({
          selectedWallets: state.selectedWallets.includes(walletAddress)
            ? state.selectedWallets.filter((addr) => addr !== walletAddress)
            : [...state.selectedWallets, walletAddress],
        })),
    }),
    {
      name: 'portfolio-ui-state',
      partialize: (state) => ({
        currentTab: state.currentTab,
        collapsedWallets: state.collapsedWallets,
        filters: state.filters,
        selectedWallets: state.selectedWallets,
      }),
    }
  )
);
