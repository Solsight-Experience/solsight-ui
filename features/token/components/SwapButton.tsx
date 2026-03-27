import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { TradeMode, OrderType } from "../types/token.types";

interface SwapButtonProps {
    tradeMode: TradeMode;
    orderType: OrderType;
    tokenSymbol: string;
    payToken: string;
    loading: boolean;
    disabled: boolean;
    onClick: () => void;
}

export const SwapButton: React.FC<SwapButtonProps> = ({ tradeMode, orderType, tokenSymbol, payToken, loading, disabled, onClick }) => {
    return (
        <Button
            className={`w-full font-bold py-6 text-lg transition-all duration-200 ${
                tradeMode === "buy"
                    ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/40"
                    : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/40"
            }`}
            onClick={onClick}
            disabled={disabled}
        >
            {loading ? (
                <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {orderType === "market" ? "Swapping..." : "Creating Order..."}
                </span>
            ) : (
                <>{orderType === "market" ? `${tradeMode.toUpperCase()} ${tradeMode === "buy" ? tokenSymbol : payToken}` : "PLACE LIMIT ORDER"}</>
            )}
        </Button>
    );
};
