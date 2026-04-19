import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useTopTraders } from "../hooks/token.hooks";
import { formatNumber } from "../utils/token.utils";
import type { TopTrader } from "../types/token.types";

interface TopTradersTableProps {
    tokenAddress: string;
}

const PriceChangeIndicator: React.FC<{ value: number; showIcon?: boolean }> = ({ value, showIcon = false }) => {
    const isPositive = value >= 0;
    return (
        <span className={`flex items-center gap-1 ${isPositive ? "text-green-500" : "text-red-500"}`}>
            {showIcon && (isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />)}
            {isPositive ? "+" : ""}
            {value.toFixed(2)}%
        </span>
    );
};

const TopTraderRow: React.FC<TopTrader & { rank: number }> = ({ rank, address, name, total_pnl, roi_percent, win_rate, trades_count }) => (
    <tr className="border-b border-gray-700 hover:bg-gray-800/50">
        <td className="py-3 px-4 text-sm font-semibold text-gray-400">#{rank}</td>
        <td className="py-3 px-4">
            <div className="flex flex-col gap-1">
                {name && <span className="text-sm font-semibold">{name}</span>}
                <code className="text-xs text-gray-400">{address}</code>
            </div>
        </td>
        <td className="py-3 px-4">
            <span className={`text-sm font-semibold ${total_pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                {total_pnl >= 0 ? "+" : ""}
                {formatNumber(total_pnl)}
            </span>
        </td>
        <td className="py-3 px-4">
            <PriceChangeIndicator value={roi_percent} showIcon={false} />
        </td>
        <td className="py-3 px-4 text-sm">{win_rate.toFixed(1)}%</td>
        <td className="py-3 px-4 text-sm text-gray-400">{trades_count}</td>
    </tr>
);

export const TopTradersTable: React.FC<TopTradersTableProps> = ({ tokenAddress }) => {
    const { data: tradersData, isLoading } = useTopTraders(tokenAddress, "24h");

    if (isLoading) {
        return (
            <div className="animate-pulse">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 bg-gray-800 rounded mb-2"></div>
                ))}
            </div>
        );
    }

    if (!tradersData?.traders || tradersData.traders.length === 0) {
        return <div className="text-center py-8 text-gray-400">No trader data available</div>;
    }

    return (
        <div className="flex-1 overflow-auto w-full scrollbar-thin pb-4">
            <table className="w-full whitespace-nowrap min-w-[700px]">
                <thead className="sticky top-0 z-10 bg-[black]/90 backdrop-blur-md text-xs text-gray-500 border-b border-gray-700 shadow-sm after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-gray-700">
                    <tr>
                        <th className="py-2 text-start px-4 font-medium">Rank</th>
                        <th className="py-2 text-start px-4 font-medium">Trader</th>
                        <th className="py-2 text-start px-4 font-medium">Total PNL</th>
                        <th className="py-2 text-start px-4 font-medium">ROI</th>
                        <th className="py-2 text-start px-4 font-medium">Win Rate</th>
                        <th className="py-2 text-start px-4 font-medium">Trades</th>
                    </tr>
                </thead>
                <tbody>
                    {tradersData.traders.map((trader, index) => (
                        <TopTraderRow key={trader.address} rank={index + 1} {...trader} />
                    ))}
                </tbody>
            </table>
        </div>
    );
};
