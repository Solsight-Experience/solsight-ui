import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TradeMode, OrderType } from "../types/token.types";
import type { ChartInterval, TradeTab } from "@/lib/constants";

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

    limitPrice: string;
    setLimitPrice: (price: string) => void;

    // Reset trading panel
    resetTradingPanel: () => void;

    // Favorites (cached)
    favoriteTokens: Set<string>;
    toggleFavorite: (address: string) => void;
    isFavorite: (address: string) => boolean;

    // Holders Table Columns
    holdersTableColumns: Record<string, boolean>;
    toggleHoldersTableColumn: (columnId: string) => void;

    // Pending auto-action from Chat
    pendingTradeAction: { mint: string; amount: string; mode: TradeMode; slippageBps?: number } | null;
    setPendingTradeAction: (action: { mint: string; amount: string; mode: TradeMode; slippageBps?: number } | null) => void;

    // Pending slippage action from Chat
    pendingSlippageAction: { slippageBps: number; warnOnly: boolean; isHigh: boolean } | null;
    setPendingSlippageAction: (action: { slippageBps: number; warnOnly: boolean; isHigh: boolean } | null) => void;
}

export const useTokenUIStore = create<TokenUIState>()(
    persist(
        (set, get) => ({
            // Chart state
            chartInterval: "10s",
            setChartInterval: (interval) => set({ chartInterval: interval }),

            // Trade tab state
            currentTradeTab: "trades",
            setCurrentTradeTab: (tab) => set({ currentTradeTab: tab }),

            // Trading panel state
            tradeMode: "buy",
            setTradeMode: (mode) =>
                set({
                    tradeMode: mode,
                    payAmount: "",
                    receiveAmount: ""
                }),

            orderType: "market",
            setOrderType: (type) => set({ orderType: type }),

            payAmount: "",
            setPayAmount: (amount) => set({ payAmount: amount }),

            receiveAmount: "",
            setReceiveAmount: (amount) => set({ receiveAmount: amount }),

            limitPrice: "0.00",
            setLimitPrice: (price) => set({ limitPrice: price }),

            resetTradingPanel: () =>
                set({
                    payAmount: "",
                    receiveAmount: "",
                    limitPrice: "0.00"
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

            // Holders Table Columns
            holdersTableColumns: {
                balance: true,
                bought: true,
                sold: true,
                unrealized: true,
                remaining: true,
                funding: false,
                held: false
            },
            toggleHoldersTableColumn: (columnId) =>
                set((state) => ({
                    holdersTableColumns: {
                        ...state.holdersTableColumns,
                        [columnId]: !state.holdersTableColumns[columnId]
                    }
                })),

            pendingTradeAction: null,
            setPendingTradeAction: (action) => set({ pendingTradeAction: action }),

            pendingSlippageAction: null,
            setPendingSlippageAction: (action) => set({ pendingSlippageAction: action })
        }),
        {
            name: "token-ui-state",
            partialize: (state) => ({
                chartInterval: state.chartInterval,
                favoriteTokens: Array.from(state.favoriteTokens), // Convert Set to Array for storage
                holdersTableColumns: state.holdersTableColumns
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
                            holdersTableColumns: stored.state.holdersTableColumns || {
                                balance: true,
                                bought: true,
                                sold: true,
                                unrealized: true,
                                remaining: true,
                                funding: false,
                                held: false
                            }
                        }
                    };
                },
                setItem: (name, value) => {
                    const toStore = {
                        state: {
                            ...value.state,
                            favoriteTokens: Array.from(value.state.favoriteTokens)
                        }
                    };
                    localStorage.setItem(name, JSON.stringify(toStore));
                },
                removeItem: (name) => localStorage.removeItem(name)
            }
        }
    )
);
