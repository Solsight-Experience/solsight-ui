import React, { useState, useEffect } from "react";
import { useHolders } from "../hooks/token.hooks";
import { formatTimeAgo } from "../utils/token.utils";
import { currencyFormatter, compactFormatter } from "@/lib/formatters";
import type { Holder } from "../types/token.types";
import { WalletHoverCard } from "./WalletHoverCard";
import { useTokenUIStore } from "../stores/token.stores";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter, ExternalLink, Wallet, Settings2 } from "lucide-react";

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
            <span className="text-[var(--text-secondary)] text-xs">{config.text}</span>
        </div>
    );
};

// Badge for trader stats (tx count, link count, etc.)
const StatBadge: React.FC<{ value: number | string; variant?: "default" | "muted" }> = ({ value, variant = "default" }) => (
    <span
        className={`text-[10px] px-1 py-0.5 rounded ${variant === "muted" ? "bg-[var(--surface-btn)] text-[var(--text-muted)]" : "bg-[var(--surface-btn)] text-[var(--text-secondary)]"}`}
    >
        {value}
    </span>
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

const HoldersTableSettings = () => {
    const { holdersTableColumns, toggleHoldersTableColumn } = useTokenUIStore();

    const columns = [
        { id: "balance", label: "Bal/Last Active" },
        { id: "bought", label: "Bought/Avg MC" },
        { id: "sold", label: "Sold/Avg MC" },
        { id: "unrealized", label: "Unrealized" },
        { id: "remaining", label: "Remaining" },
        { id: "funding", label: "Funding/TF Amount" },
        { id: "held", label: "Holding Duration" }
    ];

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className="cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-[1px]">
                    <Settings2 className="w-3.5 h-3.5" />
                </div>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className="w-[200px] p-2 bg-[var(--surface-card)] backdrop-blur-md border border-[var(--border-subtle)] shadow-xl rounded-lg"
            >
                <div className="flex items-center px-1 pb-2 mb-1 border-b border-[var(--border-faint)]">
                    <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest">Table Settings</span>
                </div>
                <div className="space-y-0.5">
                    {columns.map((col) => (
                        <label
                            key={col.id}
                            className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-[var(--surface-btn)] rounded cursor-pointer group transition-colors"
                        >
                            <Checkbox
                                checked={holdersTableColumns[col.id]}
                                onCheckedChange={() => toggleHoldersTableColumn(col.id)}
                                className="border-[var(--border-default)] data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 rounded"
                            />
                            <span className="text-xs text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors flex-1">
                                {col.label}
                            </span>
                        </label>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
};

const HolderRow: React.FC<{ holder: Holder; rank: number; tokenSymbol?: string; columns: Record<string, boolean> }> = ({
    holder,
    rank,
    tokenSymbol,
    columns
}) => {
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
        <tr className="border-b border-[var(--border-faint)] hover:bg-[var(--surface-btn)] text-[13px] group">
            {/* Rank */}
            <td className="py-2.5 px-2 text-[var(--text-muted)] font-medium w-8">{rank}</td>

            {/* Wallet Column */}
            <td className="py-2.5 px-2">
                <WalletHoverCard holder={holder} tokenSymbol={tokenSymbol}>
                    <div className="flex items-center gap-2 cursor-pointer">
                        {/* Action icons */}
                        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100">
                            <Filter className="w-3.5 h-3.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer" />
                            <ExternalLink className="w-3.5 h-3.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer" />
                        </div>

                        {/* Wallet address/name */}
                        {isLP ? (
                            <AccountTypeBadge type={account_type} />
                        ) : (
                            <div className="flex items-center gap-1.5">
                                <span className="text-[var(--text-primary)] font-medium hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                                    {name || shortAddr}
                                </span>
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
            {columns.balance && (
                <td className="py-2.5 px-2 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                        <span className="text-[var(--text-muted)]">≡</span>
                        <span className="text-[var(--text-primary)]">{compactFormatter.format(balance)}</span>
                        <span className="text-[var(--text-muted)]">
                            (<LastActiveTimer timestamp={last_active_ts} />)
                        </span>
                    </div>
                </td>
            )}

            {/* Bought (Avg Buy) */}
            {columns.bought && (
                <td className="py-2.5 px-2 whitespace-nowrap">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                            <span className="text-green-400 font-medium">{currencyFormatter.format(total_bought)}</span>
                            <span className="text-[var(--text-muted)]">({currencyFormatter.format(totalBoughtUsd)})</span>
                        </div>
                        <span className="text-[var(--text-muted)] text-xs">
                            {compactFormatter.format(total_bought / (buy_tx_count || 1))} / {buy_tx_count}
                        </span>
                    </div>
                </td>
            )}

            {/* Sold (Avg Sell) */}
            {columns.sold && (
                <td className="py-2.5 px-2 whitespace-nowrap">
                    <div className="flex flex-col">
                        {total_sold > 0 ? (
                            <>
                                <div className="flex items-center gap-1">
                                    <span className="text-red-400 font-medium">{currencyFormatter.format(total_sold)}</span>
                                    <span className="text-[var(--text-muted)]">({currencyFormatter.format(totalSoldUsd)})</span>
                                </div>
                                <span className="text-[var(--text-muted)] text-xs">
                                    {compactFormatter.format(total_sold / (sell_tx_count || 1))} / {sell_tx_count}
                                </span>
                            </>
                        ) : (
                            <span className="text-[var(--text-muted)]">$0</span>
                        )}
                    </div>
                </td>
            )}

            {/* Unrealized PnL */}
            {columns.unrealized && (
                <td className="py-2.5 px-2 whitespace-nowrap">
                    <span className={`font-medium ${unrealized_pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {unrealized_pnl >= 0 ? "+" : ""}
                        {currencyFormatter.format(unrealized_pnl)}
                    </span>
                </td>
            )}

            {/* Remaining */}
            {columns.remaining && (
                <td className="py-2.5 px-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                        <span className="text-[var(--text-primary)]">{currencyFormatter.format(remaining_usd)}</span>
                        <span className="text-green-400 text-xs">{balance_percent.toFixed(3)}%</span>
                        {/* Progress bar indicator */}
                        <div className="w-8 h-1 bg-[var(--surface-btn)] rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(balance_percent * 10, 100)}%` }} />
                        </div>
                    </div>
                </td>
            )}

            {/* Funding */}
            {columns.funding && (
                <td className="py-2.5 px-2 whitespace-nowrap">
                    {funding_label ? (
                        <div className="flex flex-col">
                            <FundingIcon label={funding_label} />
                            <span className="text-[var(--text-muted)] text-[10px]">{formatHeldTime(first_tx_time)} • ≡ 0.01 • 1</span>
                        </div>
                    ) : (
                        <span className="text-[var(--text-muted)]">—</span>
                    )}
                </td>
            )}

            {/* Held Time */}
            {columns.held && (
                <td className="py-2.5 px-2 whitespace-nowrap">
                    <span
                        className={`font-medium ${first_tx_time > Date.now() - 3600000 ? "text-green-500 dark:text-green-400" : "text-[var(--text-secondary)]"}`}
                    >
                        {formatHeldTime(first_tx_time)}
                    </span>
                </td>
            )}
        </tr>
    );
};

interface HoldersTableProps {
    tokenAddress: string;
    tokenSymbol?: string;
}

export const HoldersTable: React.FC<HoldersTableProps> = ({ tokenAddress, tokenSymbol }) => {
    const { data: holdersData, isLoading } = useHolders(tokenAddress, { limit: 100 });
    const { holdersTableColumns } = useTokenUIStore();
    const [currentPage, setCurrentPage] = useState(1);

    if (isLoading) {
        return (
            <div className="animate-pulse">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 bg-[var(--surface-btn)] rounded mb-2"></div>
                ))}
            </div>
        );
    }

    if (!holdersData?.holders || holdersData.holders.length === 0) {
        return <div className="text-center py-8 text-[var(--text-muted)]">No holder data available</div>;
    }

    const itemsPerPage = 20;
    const totalPages = Math.ceil(holdersData.holders.length / itemsPerPage);
    const paginatedHolders = holdersData.holders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="flex flex-col w-full h-full overflow-hidden">
            <div className="flex-1 overflow-auto w-full relative group scrollbar-thin pb-4">
                <table className="w-full whitespace-nowrap min-w-[1000px]">
                    <thead className="sticky top-0 z-20 bg-[var(--surface-card)] backdrop-blur-md text-xs text-[var(--text-muted)] border-b border-[var(--border-subtle)] shadow-sm">
                        <tr>
                            <th className="py-2 text-start px-2 font-medium">#</th>
                            <th className="py-2 text-start px-2 font-medium">
                                <div className="flex items-center gap-1.5">
                                    <HoldersTableSettings />
                                    Wallet
                                </div>
                            </th>
                            {holdersTableColumns.balance && <th className="py-2 text-start px-2 font-medium">SOL Balance (Last Active)</th>}
                            {holdersTableColumns.bought && <th className="py-2 text-start px-2 font-medium">Bought (Avg Buy)</th>}
                            {holdersTableColumns.sold && <th className="py-2 text-start px-2 font-medium">Sold (Avg Sell)</th>}
                            {holdersTableColumns.unrealized && <th className="py-2 text-start px-2 font-medium">U. PnL ↑↓</th>}
                            {holdersTableColumns.remaining && <th className="py-2 text-start px-2 font-medium">Remaining</th>}
                            {holdersTableColumns.funding && <th className="py-2 text-start px-2 font-medium">Funding</th>}
                            {holdersTableColumns.held && <th className="py-2 text-start px-2 font-medium">Held</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedHolders.map((holder, index) => (
                            <HolderRow
                                key={holder.address}
                                holder={holder}
                                rank={(currentPage - 1) * itemsPerPage + index + 1}
                                tokenSymbol={tokenSymbol}
                                columns={holdersTableColumns}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-3 py-3 border-t border-[var(--border-subtle)] bg-[var(--surface-card)]">
                    <div className="text-xs text-[var(--text-muted)]">
                        Showing <span className="text-[var(--text-primary)]">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                        <span className="text-[var(--text-primary)]">{Math.min(currentPage * itemsPerPage, holdersData.holders.length)}</span> of{" "}
                        <span className="text-[var(--text-primary)]">{holdersData.holders.length}</span> entries
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 text-xs rounded-md bg-[var(--surface-btn)] text-[var(--text-secondary)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--surface-btn-hover)] transition-colors border border-[var(--border-subtle)]"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 text-xs rounded-md bg-[var(--surface-btn)] text-[var(--text-secondary)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--surface-btn-hover)] transition-colors border border-[var(--border-subtle)]"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
