"use client";

import React, { useState } from "react";
import { useSwapInfo } from "@/features/swap/hooks/use-swap-info";
import type { TokenPair, ConfigCtx } from "../core/types";
import { SwapConfigBar } from "./SwapConfigBar";
import { SwapConfigPanel } from "./SwapConfigPanel";
import { SwapConfigPresets } from "./SwapConfigPresets";
import type { SwapConfigSurfaceProps } from "./types";

interface SwapConfigSectionProps extends Omit<SwapConfigSurfaceProps, "ctx"> {
    inputMint: string | undefined;
    outputMint: string | undefined;
    pair: TokenPair | undefined;
    defaultSlippageBps?: number;
}

export const SwapConfigSection: React.FC<SwapConfigSectionProps> = ({ states, onItemChange, inputMint, outputMint, pair, defaultSlippageBps }) => {
    const [open, setOpen] = useState(false);
    const { data: swapInfo } = useSwapInfo({ inputMint, outputMint });

    const ctx: ConfigCtx = {
        swapInfo,
        pair,
        defaultSlippageBps,
        getItemState: <T = unknown,>(id: keyof typeof states) => states[id] as T | undefined
    };

    return (
        <div className="flex flex-col gap-2">
            <SwapConfigPresets liveItems={states} />
            <SwapConfigBar ctx={ctx} states={states} onItemChange={onItemChange} open={open} onToggleOpen={() => setOpen((o) => !o)} />
            {open && (
                <div className="border-t border-(--border-subtle) mt-2 pt-3">
                    <SwapConfigPanel ctx={ctx} states={states} onItemChange={onItemChange} />
                </div>
            )}
        </div>
    );
};
