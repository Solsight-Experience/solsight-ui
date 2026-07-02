"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { SwapConfigId } from "./core/types";
import { applyItemChange, type ItemStates } from "./core/apply-item-change";
import { SWAP_CONFIG_ITEMS } from "./items";

interface SwapConfigState {
    items: ItemStates;
    setItem: <T>(id: SwapConfigId, next: T) => void;
    loadItems: (items: ItemStates) => void;
    setSlippageBps: (slippageBps: number) => void;
}

export const buildInitialStates = (): ItemStates => {
    const map = {} as Record<SwapConfigId, unknown>;
    for (const item of SWAP_CONFIG_ITEMS) {
        map[item.id] = item.getDefaultState();
    }
    return map as ItemStates;
};

export const useSwapConfigStore = create<SwapConfigState>()(
    devtools(
        (set, get) => ({
            items: buildInitialStates(),

            setItem: (id, next) => {
                set((s) => ({ items: applyItemChange(s.items, id, next) }));
            },

            loadItems: (items) => set({ items }),

            setSlippageBps: (slippageBps) => {
                get().setItem("slippage", { mode: "custom", custom: slippageBps });
            }
        }),
        { name: "swap-config" }
    )
);
