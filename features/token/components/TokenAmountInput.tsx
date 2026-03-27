import React from "react";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Check, ChevronDown } from "lucide-react";
import { formatDisplay } from "@/features/swap";
import type { BuyPayTokenOption } from "../hooks/useTokenPair";

interface TokenAmountInputProps {
    label: string;
    tokenSymbol: string;
    tokenLogo: string;
    balance: string;
    decimals: number;
    amount: string;
    onAmountChange: (value: string) => void;
    onBlur: () => void;
    hint?: string;
    /** When provided, renders a dropdown to select from these tokens */
    selectableTokens?: BuyPayTokenOption[];
    selectedMint?: string;
    onSelectToken?: (mint: string) => void;
    getOptionDecimals?: (option: BuyPayTokenOption) => number;
    /** When false, renders a static token display (no dropdown) */
    isDropdown?: boolean;
}

export const TokenAmountInput: React.FC<TokenAmountInputProps> = ({
    label,
    tokenSymbol,
    tokenLogo,
    balance,
    decimals,
    amount,
    onAmountChange,
    onBlur,
    hint,
    selectableTokens = [],
    selectedMint = "",
    onSelectToken,
    getOptionDecimals,
    isDropdown = false
}) => {
    return (
        <div>
            <Label className="text-sm text-gray-400 mb-2 font-semibold">{label}</Label>
            <div className="rounded-xl p-3 bg-gray-800/70 backdrop-blur border border-gray-600 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 bg-gray-700/70 px-3 py-2 rounded-lg border border-gray-600/60">
                        {isDropdown && onSelectToken ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        disabled={selectableTokens.length === 0}
                                        className="inline-flex items-center gap-2 rounded text-sm font-semibold text-gray-100 outline-none"
                                    >
                                        {tokenSymbol ? (
                                            <>
                                                <img src={tokenLogo} className="w-5 h-5 rounded-full" alt={tokenSymbol} />
                                                <span className="leading-4">{tokenSymbol}</span>
                                            </>
                                        ) : (
                                            <span className="leading-4 text-gray-400">Select token</span>
                                        )}
                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-64 border-gray-700 bg-gray-900/95 text-gray-100">
                                    {selectableTokens.map((option) => (
                                        <DropdownMenuItem
                                            key={option.mint}
                                            onSelect={() => onSelectToken(option.mint)}
                                            className="flex items-center gap-3 px-2 py-2"
                                        >
                                            <img src={option.logoUri} className="w-5 h-5 rounded-full" alt={option.symbol} />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-100">{option.symbol}</div>
                                                <div className="text-xs text-gray-400">
                                                    Balance:{" "}
                                                    {formatDisplay(
                                                        String(option.balance),
                                                        getOptionDecimals ? getOptionDecimals(option) : (option.decimals ?? 6)
                                                    )}
                                                </div>
                                            </div>
                                            {selectedMint === option.mint && <Check className="h-4 w-4 text-cyan-400" />}
                                        </DropdownMenuItem>
                                    ))}
                                    {selectableTokens.length === 0 && (
                                        <DropdownMenuItem disabled className="px-2 py-2 text-gray-500">
                                            No available tokens
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <>
                                <img src={tokenLogo} className="w-5 h-5 rounded-full" alt={tokenSymbol} />
                                <span className="font-semibold text-gray-100 tracking-wide">{tokenSymbol}</span>
                            </>
                        )}
                    </div>
                    <div className="text-right">
                        <div className="text-[11px] uppercase tracking-wide text-gray-400">Balance</div>
                        <div className="text-sm font-semibold text-gray-100">
                            {formatDisplay(balance, decimals)} {tokenSymbol || "--"}
                        </div>
                    </div>
                </div>
                <input
                    type="text"
                    value={amount}
                    onChange={(e) => onAmountChange(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-base font-bold text-white outline-none placeholder-gray-600 focus:border-gray-500"
                    onBlur={onBlur}
                />
                {hint && <div className="mt-2 text-xs text-gray-400">{hint}</div>}
            </div>
        </div>
    );
};
