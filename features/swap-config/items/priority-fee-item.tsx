"use client";

import { Zap } from "lucide-react";
import { PresetCustomItem } from "../core/control-base-classes";
import type { ConfigCtx, LockResult, SwapRequestFragment } from "../core/types";
import { lamportsToSolString, solStringToLamports } from "../utils/format-sol";

export class PriorityFeeItem extends PresetCustomItem<number> {
    readonly id = "priorityFee" as const;
    readonly label = "Priority Fee(SOL)";
    readonly tooltip = "Priority fee paid to validators to prioritize your transaction.";
    readonly icon = Zap;

    autoValue(ctx: ConfigCtx): number | null {
        return ctx.swapInfo?.autoPriorityFeeLamports ?? 0;
    }

    format(value: number): string {
        return lamportsToSolString(value);
    }

    placeholderCustom(ctx: ConfigCtx): number | null {
        return this.autoValue(ctx);
    }

    parseCustom(input: string): number | null {
        return solStringToLamports(input);
    }

    toInputString(value: number): string {
        return lamportsToSolString(value);
    }

    isLocked(ctx: ConfigCtx): LockResult {
        const tip = ctx.getItemState<{ mode: "auto" | "custom"; custom: number | null }>("tipFee");
        return tip?.mode === "custom" ? { locked: true, forcedMode: "custom", reason: "Custom tip fee requires custom priority fee." } : { locked: false };
    }

    serialize(state: { mode: "auto" | "custom"; custom: number | null }, ctx: ConfigCtx): SwapRequestFragment {
        const effectiveLamports = state.mode === "auto" ? (this.autoValue(ctx) ?? 0) : (state.custom ?? this.autoValue(ctx) ?? 0);
        return { priorityFeeLamports: effectiveLamports };
    }

    getCompactDisplay(state: { mode: "auto" | "custom"; custom: number | null }, ctx: ConfigCtx): React.ReactNode {
        const effectiveLamports = state.mode === "auto" ? (this.autoValue(ctx) ?? 0) : (state.custom ?? this.autoValue(ctx) ?? 0);

        return (
            <span className="inline-flex items-center gap-1">
                <this.icon className="h-3 w-3" />
                {lamportsToSolString(effectiveLamports)}
            </span>
        );
    }
}

export const priorityFeeItem = new PriorityFeeItem();
