"use client";

import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { NumbericInput } from "@/components/ui/NumbericInput";
import { DecimalFormatter } from "@/lib/number-formatters";
import { formatDisplay } from "@/features/swap";
import { TokenSelectDropdown } from "./TokenSelectDropdown";
import type { BuyPayTokenOption } from "../../hooks/trading/useTradingTokenOptions";

export type TokenAmountFieldMode =
    | { kind: "select"; options: BuyPayTokenOption[]; selectedMint: string; selectedToken: BuyPayTokenOption | null; onSelect: (mint: string) => void }
    | { kind: "fixed" };

export interface TokenAmountFieldProps {
    label: string; // "From" / "Sell" / "Receive"
    mode: TokenAmountFieldMode;
    /** Symbol for the displayed token (selected option's symbol when select-mode, or the page token's symbol when fixed-mode) */
    symbol: string;
    /** Logo URL for the displayed token */
    logoUri: string;
    balance: string;
    decimals: number;
    amount: string;
    onAmountChange: (next: string) => void; // shell sets lastEdited + sanitized value
    onAmountBlur: () => void; // shell formats input
    helperText: string;
    helperClassName?: string;
}

export function TokenAmountField({
    label,
    mode,
    symbol,
    logoUri,
    balance,
    decimals,
    amount,
    onAmountChange,
    onAmountBlur,
    helperText,
    helperClassName
}: TokenAmountFieldProps) {
    const formatter = useMemo(() => new DecimalFormatter({ locale: "en-US", maximumFractionDigits: Math.min(decimals, 6) }), [decimals]);

    return (
        <div>
            <Label className="text-sm text-[var(--text-muted)] mb-2 font-semibold">{label}</Label>
            <div className="rounded-xl p-3 bg-[var(--surface-btn)] backdrop-blur border  border-[var(--border-subtle)] shadow-sm">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 bg-[var(--surface-panel)] px-3 py-2 rounded-lg border border-[var(--border-subtle)]">
                        {mode.kind === "select" ? (
                            <TokenSelectDropdown
                                options={mode.options}
                                selectedMint={mode.selectedMint}
                                selectedToken={mode.selectedToken}
                                selectedSymbol={symbol}
                                selectedLogoUri={logoUri}
                                onSelect={mode.onSelect}
                            />
                        ) : (
                            <>
                                <Avatar className="w-5 h-5">
                                    {logoUri ? <AvatarImage src={logoUri} alt={symbol} /> : null}
                                    <AvatarFallback>{symbol.slice(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <span className="font-semibold text-[var(--text-primary)] tracking-wide">{symbol}</span>
                            </>
                        )}
                    </div>
                    <div className="text-right">
                        <div className="text-[11px] uppercase tracking-wide text-[var(--text-muted)]">Balance</div>
                        <div className="text-sm font-semibold text-[var(--text-primary)]">
                            {formatDisplay(balance, decimals)} {symbol || "--"}
                        </div>
                    </div>
                </div>
                <NumbericInput
                    mode="string"
                    decimals={decimals}
                    formatter={formatter}
                    value={amount}
                    onChange={onAmountChange}
                    onBlur={onAmountBlur}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-btn)] px-3 py-2 text-base font-bold text-[var(--text-primary)] outline-none placeholder:text-[var(--text-disabled)] focus:border-[var(--border-default)]"
                />
                <div className={helperClassName ?? "mt-2 text-xs text-[var(--text-muted)]"}>{helperText}</div>
            </div>
        </div>
    );
}
