"use client";

import { Button } from "@/components/ui/button";
import { useTokenUIStore } from "../../stores/token.stores";

export function TradeModeToggle() {
    const tradeMode = useTokenUIStore((s) => s.tradeMode);
    const setTradeMode = useTokenUIStore((s) => s.setTradeMode);

    return (
        <div className="flex gap-2 mb-4">
            <Button
                className={`flex-1 font-semibold transition-all duration-200 ${
                    tradeMode === "buy"
                        ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/30"
                        : "bg-[var(--surface-panel)] hover:bg-[var(--surface-panel)] text-[var(--text-secondary)]"
                }`}
                style={tradeMode === "buy" ? { color: "white" } : undefined}
                variant="ghost"
                onClick={() => setTradeMode("buy")}
            >
                Buy
            </Button>
            <Button
                className={`flex-1 font-semibold transition-all duration-200 ${
                    tradeMode === "sell"
                        ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/30"
                        : "bg-[var(--surface-panel)] hover:bg-[var(--surface-panel)] text-[var(--text-secondary)]"
                }`}
                style={tradeMode === "sell" ? { color: "white" } : undefined}
                variant="ghost"
                onClick={() => setTradeMode("sell")}
            >
                Sell
            </Button>
        </div>
    );
}
