import React from "react";
import { Button } from "@/components/ui/button";
import type { TradeMode, OrderType } from "../types/token.types";

interface TradingPanelHeaderProps {
    tradeMode: TradeMode;
    setTradeMode: (mode: TradeMode) => void;
    orderType: OrderType;
    setOrderType: (type: OrderType) => void;
}

export const TradingPanelHeader: React.FC<TradingPanelHeaderProps> = ({ tradeMode, setTradeMode, orderType, setOrderType }) => {
    return (
        <>
            <div className="flex gap-2 mb-4">
                <Button
                    className={`flex-1 font-semibold transition-all duration-200 ${
                        tradeMode === "buy"
                            ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/30"
                            : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    }`}
                    variant="ghost"
                    onClick={() => setTradeMode("buy")}
                >
                    Buy
                </Button>
                <Button
                    className={`flex-1 font-semibold transition-all duration-200 ${
                        tradeMode === "sell"
                            ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/30"
                            : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    }`}
                    variant="ghost"
                    onClick={() => setTradeMode("sell")}
                >
                    Sell
                </Button>
            </div>

            <div className="flex gap-2 mb-4 text-sm">
                <button
                    onClick={() => setOrderType("market")}
                    className={`flex-1 py-2 px-3 rounded ${orderType === "market" ? "bg-gray-800 border-b-2 border-purple-500" : "bg-gray-800 text-gray-400"}`}
                >
                    Market
                </button>
                <button
                    onClick={() => setOrderType("limit")}
                    className={`flex-1 py-2 px-3 rounded ${orderType === "limit" ? "bg-gray-800 border-b-2 border-purple-500" : "bg-gray-800 text-gray-400"}`}
                >
                    Limit
                </button>
            </div>
        </>
    );
};
