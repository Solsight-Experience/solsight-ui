"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Check, ChevronDown } from "lucide-react";
import { COMMON_TOKENS } from "@/lib/constants";
import { formatDisplay } from "@/features/swap";
import type { BuyPayTokenOption } from "../../hooks/trading/useTradingTokenOptions";

export interface TokenSelectDropdownProps {
    options: BuyPayTokenOption[];
    selectedMint: string;
    selectedToken: BuyPayTokenOption | null;
    selectedSymbol: string; // resolved display symbol (payToken or receiveToken)
    selectedLogoUri: string; // resolved display logo
    onSelect: (mint: string) => void;
}

function getOptionDecimals(option: BuyPayTokenOption): number {
    return option.decimals ?? (option.mint === COMMON_TOKENS.SOL.mint ? COMMON_TOKENS.SOL.decimals : 6);
}

export function TokenSelectDropdown({ options, selectedMint, selectedToken, selectedSymbol, selectedLogoUri, onSelect }: TokenSelectDropdownProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    disabled={options.length === 0}
                    className="inline-flex items-center gap-2 rounded text-sm font-semibold text-[var(--text-primary)] outline-none"
                >
                    {selectedToken ? (
                        <>
                            <Avatar className="w-5 h-5">
                                {selectedLogoUri ? <AvatarImage src={selectedLogoUri} alt={selectedSymbol} /> : null}
                                <AvatarFallback>{selectedSymbol.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="leading-4">{selectedSymbol}</span>
                        </>
                    ) : (
                        <span className="leading-4 text-[var(--text-muted)]">Select token</span>
                    )}
                    <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--text-primary)]">
                {options.map((option) => (
                    <DropdownMenuItem key={option.mint} onSelect={() => onSelect(option.mint)} className="flex items-center gap-3 px-2 py-2">
                        <Avatar className="w-5 h-5">
                            {option.logoUri ? <AvatarImage src={option.logoUri} alt={option.symbol} /> : null}
                            <AvatarFallback>{option.symbol.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-[var(--text-primary)]">{option.symbol}</div>
                            <div className="text-xs text-[var(--text-muted)]">Balance: {formatDisplay(String(option.balance), getOptionDecimals(option))}</div>
                        </div>
                        {selectedMint === option.mint && <Check className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />}
                    </DropdownMenuItem>
                ))}
                {options.length === 0 && (
                    <DropdownMenuItem disabled className="px-2 py-2 text-[var(--text-muted)]">
                        No available tokens
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
