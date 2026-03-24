import React, { useState, useEffect } from "react";
import { useHolders } from "../hooks/token.hooks";
import { formatTimeAgo } from "../utils/token.utils";
import { currencyFormatter, compactFormatter } from "@/lib/formatters";
import type { Holder } from "../types/token.types";
import { WalletHoverCard } from "./WalletHoverCard";
import { Filter, ExternalLink, Wallet } from "lucide-react";

// Funding source icons - using colored circles to match Axiom style
const FundingIcon: React.FC<{ label: string }> = ({ label }) => {
    const iconConfig: Record<string, { color: string; text: string }> = {
        Binance: { color: "bg-yellow-500", text: "Binance" },
        Coinbase: { color: "bg-blue-500", text: "Coinbase" },
        Kraken: { color: "bg-purple-500", text: "Kraken" },
        OKX: { color: "bg-white", text: "OKX" },
        Bybit: { color: "bg-yellow-400", text: "Bybit" },
        KuCoin: { color: "bg-green-500", text: "KuCoin" },
        Huobi: { color: "bg-blue-400", text: "Huobi" },
        Gate: { color: "bg-gray-400", text: "Gate" }
    };

    const config = iconConfig[label] || { color: "bg-gray-500", text: label };

    return (
        <div className="flex items-center gap-1.5">
            <div className={`w-4 h-4 rounded-full ${config.color} flex items-center justify-center`}>
                {label === "Coinbase" && <span className="text-[8px] text-white font-bold">C</span>}
                {label === "Binance" && <span className="text-[8px] text-black font-bold">B</span>}
            </div>
            <span className="text-gray-300 text-xs">{config.text}</span>
        </div>
    );
};

// Badge for trader stats (tx count, link count, etc.)
const StatBadge: React.FC<{ value: number | string; variant?: "default" | "muted" }> = ({ value, variant = "default" }) => (
    <span className={`text-[10px] px-1 py-0.5 rounded ${variant === "muted" ? "bg-gray-700 text-gray-400" : "bg-gray-700 text-gray-300"}`}>{value}</span>
);

// Account type badge matching Axiom style
const AccountTypeBadge: React.FC<{ type: Holder["account_type"] }> = ({ type }) => {
    if (type === "LP") {
        return (
            <span className="text-purple-400 text-xs font-medium flex items-center gap-0.5">
                <Wallet className="w-3 h-3" />
                LIQUIDITY POOL
            </span>
        );
    }
    return null;
};

// Timer component for last active
const LastActiveTimer: React.FC<{ timestamp: number }> = ({ timestamp }) => {
    const [display, setDisplay] = useState(() => formatTimeAgo(timestamp));

    useEffect(() => {
        const interval = setInterval(() => {
            setDisplay(formatTimeAgo(timestamp));
        }, 1000);
        return () => clearInterval(interval);
    }, [timestamp]);

    return <span>{display}</span>;
};

// Format held time (time since first tx)
const formatHeldTime = (firstTxTimestamp: number): string => {
    const now = Date.now();
    const diff = now - firstTxTimestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years}y`;
    if (months > 0) return `${months}mo`;
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
};

const HolderRow: React.FC<{ holder: Holder; rank: number; tokenSymbol?: string }> = ({ holder, rank, tokenSymbol }) => {
    const {
        address,
        name,
        balance,
        balance_percent,
        last_active_ts,
        first_tx_time,
        total_bought,
        avg_buy_price,
        total_sold,
        avg_sell_price,
        unrealized_pnl,
        remaining_usd,
        funding_label,
        account_type,
        tx_count,
        buy_tx_count,
        sell_tx_count
    } = holder;

    const shortAddr = `${address.slice(0, 6)}...${address.slice(-4)}`;
    const isLP = account_type === "LP";
    const totalBoughtUsd = total_bought * avg_buy_price;
    const totalSoldUsd = total_sold * avg_sell_price;

    return (
        <tr className="border-b border-gray-800/50 hover:bg-gray-800/30 text-[13px] group">
            {/* Rank */}
            <td className="py-2.5 px-2 text-gray-500 font-medium w-8">{rank}</td>

            {/* Wallet Column */}
            <td className="py-2.5 px-2">
                <WalletHoverCard holder={holder} tokenSymbol={tokenSymbol}>
                    <div className="flex items-center gap-2 cursor-pointer">
                        {/* Action icons */}
                        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100">
                            <Filter className="w-3.5 h-3.5 text-gray-500 hover:text-gray-300 cursor-pointer" />
                            <ExternalLink className="w-3.5 h-3.5 text-gray-500 hover:text-gray-300 cursor-pointer" />
                        </div>

                        {/* Wallet address/name */}
                        {isLP ? (
                            <AccountTypeBadge type={account_type} />
                        ) : (
                            <div className="flex items-center gap-1.5">
                                <span className="text-gray-200 font-medium hover:text-white transition-colors">{name || shortAddr}</span>
                                {/* Badges for tx count and other stats */}
                                {tx_count > 1 && <StatBadge value={tx_count} />}
                                {account_type === "DEV" && <StatBadge value="DEV" variant="muted" />}
                                {account_type === "CEX" && <StatBadge value="CEX" variant="muted" />}
                            </div>
                        )}
                    </div>
                </WalletHoverCard>
            </td>

            {/* SOL Balance + Last Active */}
            <td className="py-2.5 px-2 whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                    <span className="text-gray-400">≡</span>
                    <span className="text-gray-200">{compactFormatter.format(balance)}</span>
                    <span className="text-gray-500">
                        (<LastActiveTimer timestamp={last_active_ts} />)
                    </span>
                </div>
            </td>

            {/* Bought (Avg Buy) */}
            <td className="py-2.5 px-2 whitespace-nowrap">
                <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                        <span className="text-green-400 font-medium">{currencyFormatter.format(total_bought)}</span>
                        <span className="text-gray-500">({currencyFormatter.format(totalBoughtUsd)})</span>
                    </div>
                    <span className="text-gray-500 text-xs">
                        {compactFormatter.format(total_bought / (buy_tx_count || 1))} / {buy_tx_count}
                    </span>
                </div>
            </td>

            {/* Sold (Avg Sell) */}
            <td className="py-2.5 px-2 whitespace-nowrap">
                <div className="flex flex-col">
                    {total_sold > 0 ? (
                        <>
                            <div className="flex items-center gap-1">
                                <span className="text-red-400 font-medium">{currencyFormatter.format(total_sold)}</span>
                                <span className="text-gray-500">({currencyFormatter.format(totalSoldUsd)})</span>
                            </div>
                            <span className="text-gray-500 text-xs">
                                {compactFormatter.format(total_sold / (sell_tx_count || 1))} / {sell_tx_count}
                            </span>
                        </>
                    ) : (
                        <span className="text-gray-600">$0</span>
                    )}
                </div>
            </td>

            {/* Unrealized PnL */}
            <td className="py-2.5 px-2 whitespace-nowrap">
                <span className={`font-medium ${unrealized_pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {unrealized_pnl >= 0 ? "+" : ""}
                    {currencyFormatter.format(unrealized_pnl)}
                </span>
            </td>

            {/* Remaining */}
            <td className="py-2.5 px-2 whitespace-nowrap">
                <div className="flex items-center gap-2">
                    <span className="text-gray-200">{currencyFormatter.format(remaining_usd)}</span>
                    <span className="text-green-400 text-xs">{balance_percent.toFixed(3)}%</span>
                    {/* Progress bar indicator */}
                    <div className="w-8 h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(balance_percent * 10, 100)}%` }} />
                    </div>
                </div>
            </td>

            {/* Funding */}
            <td className="py-2.5 px-2 whitespace-nowrap">
                {funding_label ? (
                    <div className="flex flex-col">
                        <FundingIcon label={funding_label} />
                        <span className="text-gray-500 text-[10px]">{formatHeldTime(first_tx_time)} • ≡ 0.01 • 1</span>
                    </div>
                ) : (
                    <span className="text-gray-600">—</span>
                )}
            </td>

            {/* Held Time */}
            <td className="py-2.5 px-2 whitespace-nowrap">
                <span className={`font-medium ${first_tx_time > Date.now() - 3600000 ? "text-green-400" : "text-gray-300"}`}>
                    {formatHeldTime(first_tx_time)}
                </span>
            </td>
        </tr>
    );
};

interface HoldersTableProps {
    tokenAddress: string;
    tokenSymbol?: string;
}

export const HoldersTable: React.FC<HoldersTableProps> = ({ tokenAddress, tokenSymbol }) => {
    const { data: holdersData, isLoading } = useHolders(tokenAddress, { limit: 100 });

    if (isLoading) {
        return (
            <div className="animate-pulse">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 bg-gray-800 rounded mb-2"></div>
                ))}
            </div>
        );
    }

    if (!holdersData?.holders || holdersData.holders.length === 0) {
        return <div className="text-center py-8 text-gray-400">No holder data available</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="text-xs text-gray-500 border-b border-gray-700">
                    <tr>
                        <th className="py-2 text-start px-2 font-medium">#</th>
                        <th className="py-2 text-start px-2 font-medium">Wallet</th>
                        <th className="py-2 text-start px-2 font-medium">SOL Balance (Last Active)</th>
                        <th className="py-2 text-start px-2 font-medium">Bought (Avg Buy)</th>
                        <th className="py-2 text-start px-2 font-medium">Sold (Avg Sell)</th>
                        <th className="py-2 text-start px-2 font-medium">U. PnL ↑↓</th>
                        <th className="py-2 text-start px-2 font-medium">Remaining</th>
                        <th className="py-2 text-start px-2 font-medium">Funding</th>
                        <th className="py-2 text-start px-2 font-medium">Held</th>
                    </tr>
                </thead>
                <tbody>
                    {holdersData.holders.map((holder, index) => (
                        <HolderRow key={holder.address} holder={holder} rank={index + 1} tokenSymbol={tokenSymbol} />
                    ))}
                </tbody>
            </table>
        </div>
    );
};
