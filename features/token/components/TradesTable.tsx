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
        <div className="flex-1 overflow-auto w-full scrollbar-thin pb-4">
            <table className="w-full whitespace-nowrap min-w-[800px]">
                <thead className="sticky top-0 z-10 bg-[black]/90 backdrop-blur-md text-xs text-gray-500 border-b border-gray-700 shadow-sm after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-gray-700">
                    <tr>
                        <th className="py-2 text-start px-4 font-medium">Age</th>
                        <th className="py-2 text-start px-4 font-medium">Type</th>
                        <th className="py-2 text-start px-4 font-medium">Market Cap</th>
                        <th className="py-2 text-start px-4 font-medium">Amount</th>
                        <th className="py-2 text-start px-4 font-medium">USD</th>
                        <th className="py-2 text-start px-4 font-medium">Trader</th>
                        <th className="py-2 text-start px-4 font-medium">View</th>
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
