"use client";

import { SlidersHorizontal } from "lucide-react";
import { PresetCustomItem } from "../core/control-base-classes";
import type { ConfigCtx, SwapRequestFragment, Validation } from "../core/types";

export class SlippageItem extends PresetCustomItem<number> {
    readonly id = "slippage" as const;
    readonly label = "Slippage";
    readonly icon = SlidersHorizontal;

    autoValue(ctx: ConfigCtx): number | null {
        return ctx.swapInfo?.autoSlippageBps ?? 3000;
    }

    format(value: number): string {
        return `${(value / 100).toFixed(1)}%`;
    }

    placeholderCustom(ctx: ConfigCtx): number | null {
        return this.autoValue(ctx);
    }

    parseCustom(input: string): number | null {
        const parsed = parseFloat(input);
        if (isNaN(parsed)) return null;
        return Math.round(parsed * 100);
    }

    toInputString(value: number): string {
        return (value / 100).toString();
    }

    validate(state: { mode: "auto" | "custom"; custom: number | null }, _ctx: ConfigCtx): Validation | null {
        if (state.mode === "custom" && state.custom !== null && state.custom < 3000) {
            return { level: "warn", message: "Recommend slippage ≥30% to avoid failure from large fluctuations." };
        }
        return null;
    }

    serialize(state: { mode: "auto" | "custom"; custom: number | null }, ctx: ConfigCtx): SwapRequestFragment {
        const effectiveBps = state.mode === "auto" ? (this.autoValue(ctx) ?? 3000) : (state.custom ?? this.autoValue(ctx) ?? 3000);
        return { slippageBps: effectiveBps };
    }

    getCompactDisplay(state: { mode: "auto" | "custom"; custom: number | null }, ctx: ConfigCtx): React.ReactNode {
        const auto = this.autoValue(ctx);
        const isAuto = state.mode === "auto";
        const value = isAuto ? auto : state.custom;
        const label = isAuto ? `Auto (${value !== null ? this.format(value) : "..."})` : value !== null ? this.format(value) : "Custom";

        return (
            <span className="inline-flex items-center gap-1">
                <this.icon className="h-3 w-3" />
                {label}
            </span>
        );
    }
}

export const slippageItem = new SlippageItem();
