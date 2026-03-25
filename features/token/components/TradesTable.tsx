import React from "react";
import { ExternalLink } from "lucide-react";
import { useTrades } from "../hooks/token.hooks";
import { formatTimeAgo, formatNumber, formatTokenAmount } from "../utils/token.utils";
import type { Trade } from "../types/token.types";

interface TradesTableProps {
    tokenAddress: string;
}

const TradeRow: React.FC<Trade> = ({ timestamp, type, amount_token, price_usd, trader_address, market_cap, tx_url }) => (
    <tr className="border-b border-gray-700 hover:bg-gray-800/50">
        <td className="py-3 px-4 text-sm text-gray-400">{formatTimeAgo(timestamp)}</td>
        <td className="py-3 px-4">
            <span className={`px-3 py-1 rounded text-xs font-semibold ${type === "BUY" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
                {type}
            </span>
        </td>
        <td className="py-3 px-4 text-sm">{formatNumber(market_cap)}</td>
        <td className="py-3 px-4 text-sm">{formatTokenAmount(amount_token, 2)}</td>
        <td className="py-3 px-4 text-sm font-semibold">${price_usd.toFixed(2)}</td>
        <td className="py-3 px-4">
            <code className="text-xs bg-gray-800 px-2 py-1 rounded">{trader_address}</code>
        </td>
        <td className="py-3 px-4">
            <a href={tx_url} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">
                <ExternalLink className="w-4 h-4" />
            </a>
        </td>
    </tr>
);

export const TradesTable: React.FC<TradesTableProps> = ({ tokenAddress }) => {
    const { data: tradesData, isLoading } = useTrades(tokenAddress, { limit: 50 });

    // console.log('Trades');
    // console.log(tradesData);

    if (isLoading) {
        return (
            <div className="animate-pulse">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 bg-gray-800 rounded mb-2"></div>
                ))}
            </div>
        );
    }

    if (!tradesData?.trades || tradesData.trades.length === 0) {
        return <div className="text-center py-8 text-gray-400">No trades available</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="text-base text-gray-500 border-b border-gray-600">
                    <tr>
                        <th className="pb-2 text-start px-4">Age</th>
                        <th className="pb-2 text-start px-4">Type</th>
                        <th className="pb-2 text-start px-4">Market Cap</th>
                        <th className="pb-2 text-start px-4">Amount</th>
                        <th className="pb-2 text-start px-4">USD</th>
                        <th className="pb-2 text-start px-4">Trader</th>
                        <th className="pb-2 text-start px-4">View</th>
                    </tr>
                </thead>
                <tbody>
                    {tradesData.trades.map((trade) => (
                        <TradeRow key={trade.tx_hash} {...trade} />
                    ))}
                </tbody>
            </table>
        </div>
    );
};
