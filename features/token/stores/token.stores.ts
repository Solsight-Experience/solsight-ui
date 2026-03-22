import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TradeMode, OrderType } from '../types/token.types';
import type { ChartInterval, TradeTab } from '@/lib/constants';

interface TokenUIState {
  // Chart state
  chartInterval: ChartInterval;
  setChartInterval: (interval: ChartInterval) => void;

  // Trade tab state
  currentTradeTab: TradeTab;
  setCurrentTradeTab: (tab: TradeTab) => void;

  // Trading panel state
  tradeMode: TradeMode;
  setTradeMode: (mode: TradeMode) => void;

  orderType: OrderType;
  setOrderType: (type: OrderType) => void;

  payAmount: string;
  setPayAmount: (amount: string) => void;

  receiveAmount: string;
  setReceiveAmount: (amount: string) => void;

  slippageBps: number;
  setSlippageBps: (bps: number) => void;

  limitPrice: string;
  setLimitPrice: (price: string) => void;

  // Reset trading panel
  resetTradingPanel: () => void;

  // Favorites (cached)
  favoriteTokens: Set<string>;
  toggleFavorite: (address: string) => void;
  isFavorite: (address: string) => boolean;
}

export const useTokenUIStore = create<TokenUIState>()(
  persist(
    (set, get) => ({
      // Chart state
      chartInterval: '10s',
      setChartInterval: (interval) => set({ chartInterval: interval }),

      // Trade tab state
      currentTradeTab: 'trades',
      setCurrentTradeTab: (tab) => set({ currentTradeTab: tab }),

      // Trading panel state
      tradeMode: 'buy',
      setTradeMode: (mode) =>
        set({
          tradeMode: mode,
          payAmount: '',
          receiveAmount: '',
        }),

      orderType: 'market',
      setOrderType: (type) => set({ orderType: type }),

      payAmount: '',
      setPayAmount: (amount) => set({ payAmount: amount }),

      receiveAmount: '',
      setReceiveAmount: (amount) => set({ receiveAmount: amount }),

      slippageBps: 50,
      setSlippageBps: (bps) => set({ slippageBps: bps }),

      limitPrice: '0.00',
      setLimitPrice: (price) => set({ limitPrice: price }),

      resetTradingPanel: () =>
        set({
          payAmount: '',
          receiveAmount: '',
          limitPrice: '0.00',
        }),

      // Favorites
      favoriteTokens: new Set<string>(),
      toggleFavorite: (address) =>
        set((state) => {
          const newFavorites = new Set(state.favoriteTokens);
          if (newFavorites.has(address)) {
            newFavorites.delete(address);
          } else {
            newFavorites.add(address);
          }
          return { favoriteTokens: newFavorites };
        }),
      isFavorite: (address) => get().favoriteTokens.has(address),
    }),
    {
      name: 'token-ui-state',
      partialize: (state) => ({
        chartInterval: state.chartInterval,
        favoriteTokens: Array.from(state.favoriteTokens), // Convert Set to Array for storage
      }),
      // Custom storage to handle Set conversion
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const stored = JSON.parse(str);
          return {
            state: {
              ...stored.state,
              favoriteTokens: new Set(stored.state.favoriteTokens || []),
            },
          };
        },
        setItem: (name, value) => {
          const toStore = {
            state: {
              ...value.state,
              favoriteTokens: Array.from(value.state.favoriteTokens),
            },
          };
          localStorage.setItem(name, JSON.stringify(toStore));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
