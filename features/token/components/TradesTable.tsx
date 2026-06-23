import React from "react";
import { ExternalLink } from "lucide-react";
import useClusterStore, { type Cluster } from "@/stores/cluster.store";
import { useTrades } from "../hooks/token.hooks";
import { formatTimeAgo, formatNumber, formatTokenAmount } from "../utils/token.utils";
import type { Trade } from "../types/token.types";

interface TradesTableProps {
    tokenAddress: string;
}

const getSolscanTxUrl = (txUrl: string, cluster: Cluster) => {
    const url = new URL(txUrl);
    if (cluster === "devnet") {
        url.searchParams.set("cluster", "devnet");
    }
    return url.toString();
};

const TradeRow: React.FC<Trade & { cluster: Cluster }> = ({ timestamp, type, amount_token, price_usd, trader_address, market_cap, tx_url, cluster }) => (
    <tr className="border-b border-[var(--border-subtle)] hover:bg-[var(--surface-btn)]">
        <td className="py-3 px-4 text-sm text-[var(--text-muted)]">{formatTimeAgo(timestamp)}</td>
        <td className="py-3 px-4">
            <span
                className={`px-3 py-1 rounded text-xs font-semibold ${type === "BUY" ? "bg-green-500/20 text-green-600 dark:text-green-500" : "bg-red-500/20 text-red-600 dark:text-red-500"}`}
            >
                {type}
            </span>
        </td>
        <td className="py-3 px-4 text-sm text-[var(--text-primary)]">{formatNumber(market_cap)}</td>
        <td className="py-3 px-4 text-sm text-[var(--text-primary)]">{formatTokenAmount(amount_token, 2)}</td>
        <td className="py-3 px-4 text-sm font-semibold text-[var(--text-primary)]">${price_usd.toFixed(2)}</td>
        <td className="py-3 px-4">
            <code className="text-xs bg-[var(--surface-btn)] border border-[var(--border-faint)] px-2 py-1 rounded text-[var(--text-muted)]">
                {trader_address}
            </code>
        </td>
        <td className="py-3 px-4">
            <a
                href={getSolscanTxUrl(tx_url, cluster)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300"
            >
                <ExternalLink className="w-4 h-4" />
            </a>
        </td>
    </tr>
);

export const TradesTable: React.FC<TradesTableProps> = ({ tokenAddress }) => {
    const cluster = useClusterStore((state) => state.cluster);
    const { data: tradesData, isLoading } = useTrades(tokenAddress, { limit: 50 });

    if (isLoading) {
        return (
            <div className="animate-pulse">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 bg-[var(--surface-btn)] rounded mb-2"></div>
                ))}
            </div>
        );
    }

    if (!tradesData?.trades || tradesData.trades.length === 0) {
        return <div className="text-center py-8 text-[var(--text-muted)]">No trades available</div>;
    }

    return (
        <div className="flex-1 overflow-auto w-full scrollbar-thin pb-4">
            <table className="w-full whitespace-nowrap min-w-[800px]">
                <thead className="sticky top-0 z-10 bg-[var(--surface-card)] backdrop-blur-md text-xs text-[var(--text-muted)] border-b border-[var(--border-subtle)] shadow-sm">
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
                        <TradeRow key={trade.tx_hash} cluster={cluster} {...trade} />
                    ))}
                </tbody>
            </table>
        </div>
    );
};
