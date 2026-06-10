"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SWAP_CONFIG_ITEMS, gaslessItem, priorityFeeItem } from "../items";
import type { SwapConfigItem } from "../core/swap-config-item";
import type { SwapConfigSurfaceProps } from "./types";

interface SwapConfigBarProps extends SwapConfigSurfaceProps {
    open: boolean;
    onToggleOpen: () => void;
}

type OpaqueItem = SwapConfigItem<unknown>;

const renderCompact = (item: OpaqueItem, state: unknown, ctx: SwapConfigSurfaceProps["ctx"]): React.ReactNode => item.getCompactDisplay(state, ctx);

export const SwapConfigBar: React.FC<SwapConfigBarProps> = ({ ctx, states, open, onToggleOpen }) => {
    const gaslessState = states.gasless as { value: "sol" | "quote" | "receive" } | undefined;
    const isGaslessActive = gaslessItem.isVisible(ctx) && gaslessState?.value !== undefined && gaslessState.value !== "sol";

    const itemsToRender: React.ReactNode[] = [];

    for (const item of SWAP_CONFIG_ITEMS) {
        if (!item.isVisible(ctx)) continue;

        if (item.id === priorityFeeItem.id && isGaslessActive) {
            const node = renderCompact(gaslessItem as unknown as OpaqueItem, states.gasless, ctx);
            if (node) itemsToRender.push(node);
            continue;
        }

        if (item.id === gaslessItem.id) continue;

        const node = renderCompact(item as unknown as OpaqueItem, states[item.id], ctx);
        if (node) itemsToRender.push(node);
    }

    return (
        <div className="flex items-center gap-3 text-xs text-zinc-400 select-none">
            <div className="flex items-center gap-3">
                {itemsToRender.map((node, i) => (
                    <React.Fragment key={i}>{node}</React.Fragment>
                ))}
            </div>
            <div className="flex-1" />
            <button
                type="button"
                onClick={onToggleOpen}
                aria-expanded={open}
                aria-label={open ? "Collapse swap config" : "Expand swap config"}
                className="p-1 rounded-md hover:bg-zinc-800 cursor-pointer"
            >
                <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
            </button>
        </div>
    );
};
