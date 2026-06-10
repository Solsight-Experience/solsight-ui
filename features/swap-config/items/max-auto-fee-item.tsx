"use client";

import { Gauge } from "lucide-react";
import { NumericFieldItem } from "../core/control-base-classes";
import type { ConfigCtx, SwapRequestFragment } from "../core/types";

export class MaxAutoFeeItem extends NumericFieldItem {
    readonly id = "maxAutoFee" as const;
    readonly label = "Max Auto Fee";
    readonly tooltip = "When using auto priority/tip, sets the maximum acceptable SOL amount.";
    readonly icon = Gauge;
    readonly suffix = "SOL";

    placeholder(ctx: ConfigCtx): number | null {
        return (ctx.swapInfo?.maxAutoFeeLamports ?? 0) / 1e9;
    }

    isVisible(ctx: ConfigCtx): boolean {
        const tipFeeState = ctx.getItemState<{ mode: string }>("tipFee");
        return tipFeeState?.mode !== "custom";
    }

    serialize(state: { value: number | null }, ctx: ConfigCtx): SwapRequestFragment {
        const autoMax = ctx.swapInfo?.maxAutoFeeLamports ?? 0;
        const maxAutoFeeLamports = state.value === null ? autoMax : Math.floor(state.value * 1e9);
        return { maxAutoFeeLamports };
    }

    getCompactDisplay(): React.ReactNode {
        return null;
    }
}

export const maxAutoFeeItem = new MaxAutoFeeItem();
