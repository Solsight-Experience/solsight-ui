"use client";

import React from "react";
import { Fuel } from "lucide-react";
import { DropdownItem } from "../core/control-base-classes";
import type { ConfigCtx, SwapRequestFragment } from "../core/types";
import { TokenIcon } from "@/components/ui/token-icon";

type GaslessOption = "sol" | "quote" | "receive";

export class GaslessItem extends DropdownItem<GaslessOption> {
    readonly id = "gasless" as const;
    readonly label = "Gas Pay In";
    readonly icon = Fuel;

    getDefaultState() {
        return { value: "sol" as GaslessOption };
    }

    isVisible(ctx: ConfigCtx): boolean {
        return ctx.swapInfo?.gaslessEnabled ?? false;
    }

    getOptions(ctx: ConfigCtx): ReadonlyArray<{ id: GaslessOption; label: string; node?: React.ReactNode }> {
        const SOL_MINT = "So11111111111111111111111111111111111111112";
        const baseOptions: { id: GaslessOption; label: string; node?: React.ReactNode }[] = [
            {
                id: "sol",
                label: "SOL",
                node: <TokenIcon mint={SOL_MINT} symbol="SOL" size="xs" />
            }
        ];

        if (!ctx.pair) return baseOptions;

        const supported = new Set(ctx.swapInfo?.gaslessSupportedTokens ?? []);

        if (supported.has(ctx.pair.quote.mint)) {
            baseOptions.push({
                id: "quote",
                label: ctx.pair.quote.symbol,
                node: <TokenIcon mint={ctx.pair.quote.mint} symbol={ctx.pair.quote.symbol} logoUri={ctx.pair.quote.logoUri} size="xs" />
            });
        }
        if (supported.has(ctx.pair.receive.mint)) {
            baseOptions.push({
                id: "receive",
                label: ctx.pair.receive.symbol,
                node: <TokenIcon mint={ctx.pair.receive.mint} symbol={ctx.pair.receive.symbol} logoUri={ctx.pair.receive.logoUri} size="xs" />
            });
        }

        return baseOptions;
    }

    serialize(state: { value: GaslessOption }, ctx: ConfigCtx): SwapRequestFragment {
        switch (state.value) {
            case "quote":
                return ctx.pair?.quote.mint ? { gaslessFeeToken: ctx.pair.quote.mint } : {};
            case "receive":
                return ctx.pair?.receive.mint ? { gaslessFeeToken: ctx.pair.receive.mint } : {};
            case "sol":
            default:
                return {};
        }
    }

    getCompactDisplay(state: { value: GaslessOption }, ctx: ConfigCtx): React.ReactNode {
        if (state.value === "sol") {
            return null;
        }

        const options = this.getOptions(ctx);
        const selectedOption = options.find((opt) => opt.id === state.value);

        return selectedOption?.node ?? null;
    }
}

export const gaslessItem = new GaslessItem();
