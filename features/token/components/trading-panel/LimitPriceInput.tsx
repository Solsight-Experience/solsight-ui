"use client";

import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { NumbericInput } from "@/components/ui/NumbericInput";
import { DecimalFormatter } from "@/lib/number-formatters";
import { useTokenUIStore } from "../../stores/token.stores";

export interface LimitPriceInputProps {
    payToken: string;
    receiveToken: string;
    tokenPrice: number | null | undefined;
    solPriceUsd: number | null;
}

export function LimitPriceInput({ payToken, receiveToken, tokenPrice, solPriceUsd }: LimitPriceInputProps) {
    const orderType = useTokenUIStore((s) => s.orderType);
    const tradeMode = useTokenUIStore((s) => s.tradeMode);
    const limitPrice = useTokenUIStore((s) => s.limitPrice);
    const setLimitPrice = useTokenUIStore((s) => s.setLimitPrice);

    const formatter = useMemo(() => new DecimalFormatter({ locale: "en-US", maximumFractionDigits: 15 }), []);

    if (orderType !== "limit") return null;

    return (
        <div className="mb-4">
            <Label className="text-sm text-[var(--text-muted)] mb-2 font-semibold">Limit Price (USD per {tradeMode === "buy" ? receiveToken : payToken})</Label>
            <div className="rounded-lg p-3 bg-[var(--surface-btn)] backdrop-blur transition-all border border-yellow-600/50 flex items-center">
                <span className="text-[var(--text-muted)] mr-2">$</span>
                <NumbericInput
                    mode="string"
                    decimals={15}
                    formatter={formatter}
                    value={limitPrice}
                    onChange={setLimitPrice}
                    placeholder="0.00"
                    className="w-full bg-transparent text-base font-bold outline-none text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] border-0 shadow-none focus-visible:ring-0 px-0 py-0 h-auto"
                />
                {tokenPrice && (
                    <button
                        type="button"
                        onClick={() => setLimitPrice(tokenPrice.toString())}
                        className="ml-2 text-xs bg-[var(--surface-panel)] hover:bg-[var(--surface-panel)] px-2 py-1 rounded text-cyan-600 dark:text-cyan-400 font-semibold whitespace-nowrap transition-colors"
                        title="Use current market price"
                    >
                        Current Price
                    </button>
                )}
            </div>
            <div className="mt-2 text-xs text-yellow-500">SOL price: ${solPriceUsd?.toFixed(2) || "--"}</div>
        </div>
    );
}
