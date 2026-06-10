"use client";

import { HandCoins } from "lucide-react";
import { PresetCustomItem } from "../core/control-base-classes";
import type { ConfigCtx, SwapRequestFragment } from "../core/types";
import { lamportsToSolString, solStringToLamports } from "../utils/format-sol";

export class TipFeeItem extends PresetCustomItem<number> {
    readonly id = "tipFee" as const;
    readonly label = "Tip Fee( SOL )";
    readonly tooltip = "Bribe paid to block builders for inclusion priority.";
    readonly icon = HandCoins;

    autoValue(ctx: ConfigCtx): number | null {
        return ctx.swapInfo?.autoTipLamports ?? 0;
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

    serialize(state: { mode: "auto" | "custom"; custom: number | null }, ctx: ConfigCtx): SwapRequestFragment {
        const effectiveLamports = state.mode === "auto" ? (this.autoValue(ctx) ?? 0) : (state.custom ?? this.autoValue(ctx) ?? 0);
        return { tipLamports: effectiveLamports };
    }

    getCompactDisplay(state: { mode: "auto" | "custom"; custom: number | null }, ctx: ConfigCtx): React.ReactNode {
        const effectiveLamports = state.mode === "auto" ? (this.autoValue(ctx) ?? 0) : (state.custom ?? this.autoValue(ctx) ?? 0);

        const displayValue = effectiveLamports < 1e7 && effectiveLamports > 0 ? "<0.01" : lamportsToSolString(effectiveLamports);

        return (
            <span className="inline-flex items-center gap-1">
                <this.icon className="h-3 w-3" />
                {displayValue}
            </span>
        );
    }
}

export const tipFeeItem = new TipFeeItem();
