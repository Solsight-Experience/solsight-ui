"use client";

import type { ConfigCtx, SwapRequestFragment } from "./core/types";
import { SWAP_CONFIG_ITEMS } from "./items";

/**
 * Walks all items, collects each visible item's `serialize(state, ctx)` fragment,
 * and merges into a single `SwapRequestFragment`.
 */
export function serializeAllSwapConfig(states: Record<string, unknown>, ctx: ConfigCtx): SwapRequestFragment {
    let result: SwapRequestFragment = {};
    for (const item of SWAP_CONFIG_ITEMS) {
        if (!item.isVisible(ctx)) continue;
        const itemState = states[item.id] as never;
        const fragment = item.serialize(itemState, ctx);
        result = { ...result, ...fragment };
    }
    return result;
}
