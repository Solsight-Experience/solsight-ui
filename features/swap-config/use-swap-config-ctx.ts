"use client";

import { useMemo } from "react";
import type { ConfigCtx, SwapConfigId, SwapInfoSnapshot, TokenPair } from "./core/types";
import { useSwapConfigStore } from "./store";

export function useSwapConfigCtx(args: { swapInfo: SwapInfoSnapshot | undefined; pair: TokenPair | undefined }): ConfigCtx {
    const items = useSwapConfigStore((s) => s.items);
    return useMemo<ConfigCtx>(
        () => ({
            swapInfo: args.swapInfo,
            pair: args.pair,
            getItemState: <T = unknown>(id: SwapConfigId) => items[id] as T | undefined
        }),
        [args.swapInfo, args.pair, items]
    );
}
