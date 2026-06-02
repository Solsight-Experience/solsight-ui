"use client";

import { Label } from "@/components/ui/label";
import { formatInputValue, sanitizeInput } from "@/features/swap";
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

    if (orderType !== "limit") return null;

    return (
        <div className="mb-4">
            <Label className="text-sm text-[var(--text-muted)] mb-2 font-semibold">Limit Price (USD per {tradeMode === "buy" ? receiveToken : payToken})</Label>
            <div className="rounded-lg p-3 bg-[var(--surface-btn)] backdrop-blur transition-all border border-yellow-600/50 flex items-center">
                <span className="text-[var(--text-muted)] mr-2">$</span>
                <input
                    type="text"
                    value={limitPrice}
                    onChange={(e) => {
                        setLimitPrice(sanitizeInput(e.target.value, 15));
                    }}
                    placeholder="0.00"
                    className="w-full bg-transparent text-base font-bold outline-none text-[var(--text-primary)] placeholder:text-[var(--text-disabled)]"
                    onBlur={() => setLimitPrice(formatInputValue(limitPrice, 15))}
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
