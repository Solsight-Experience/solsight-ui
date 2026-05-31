"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { SwapConfigId } from "./core/types";
import { SWAP_CONFIG_ITEMS } from "./items";

type ItemStates = Record<SwapConfigId, unknown>;

interface ModeCustomState {
    mode: "auto" | "custom";
    custom: number | null;
}

interface SwapConfigState {
    items: ItemStates;
    setItem: <T>(id: SwapConfigId, next: T) => void;
    getSlippageBps: (autoFallbackBps?: number) => number;
    reset: () => void;
}

const buildInitialStates = (): ItemStates => {
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
                set((s) => {
                    const updated: ItemStates = { ...s.items, [id]: next };

                    // Side-effect: when TipFee switches to custom mode, force PriorityFee
                    // into custom mode. Seed PriorityFee.custom from its existing custom
                    // value if present; otherwise leave null so the render layer can fall
                    // back to autoValue(ctx) at display time.
                    if (id === "tipFee") {
                        const tipState = next as ModeCustomState;
                        if (tipState.mode === "custom") {
                            const priorityState = updated.priorityFee as ModeCustomState;
                            if (priorityState.mode === "auto") {
                                updated.priorityFee = {
                                    mode: "custom",
                                    custom: priorityState.custom
                                };
                            }
                        }
                    }

                    return { items: updated };
                });
            },

            getSlippageBps: (autoFallbackBps = 3000) => {
                const slip = get().items.slippage as ModeCustomState;
                return slip.custom ?? autoFallbackBps;
            },

            reset: () => set({ items: buildInitialStates() })
        }),
        { name: "swap-config" }
    )
);
