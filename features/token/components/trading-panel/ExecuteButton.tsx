"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useTokenUIStore } from "../../stores/token.stores";

export interface ExecuteButtonProps {
    isPending: boolean;
    isQuoteLoading: boolean;
    hasValidationError: boolean;
    hasNoSwapOptions: boolean;
    tokenSymbol: string;
    payToken: string;
    onClick: () => void;
}

export function ExecuteButton({ isPending, isQuoteLoading, hasValidationError, hasNoSwapOptions, tokenSymbol, payToken, onClick }: ExecuteButtonProps) {
    const tradeMode = useTokenUIStore((s) => s.tradeMode);
    const orderType = useTokenUIStore((s) => s.orderType);

    const disabled = isPending || (orderType === "market" && isQuoteLoading) || hasValidationError || hasNoSwapOptions;

    return (
        <Button
            className={`w-full font-bold py-6 text-lg transition-all duration-200 ${
                tradeMode === "buy"
                    ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/40"
                    : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/40"
            }`}
            style={{ color: "white" }}
            onClick={onClick}
            disabled={disabled}
        >
            {isPending ? (
                <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {orderType === "market" ? "Swapping..." : "Creating Order..."}
                </span>
            ) : (
                <>{orderType === "market" ? `${tradeMode.toUpperCase()} ${tradeMode === "buy" ? tokenSymbol : payToken}` : "PLACE LIMIT ORDER"}</>
            )}
        </Button>
    );
}
