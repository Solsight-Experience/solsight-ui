import React, { useState, useEffect } from "react";
import { ExternalLink, Search, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { useActivities } from "../hooks/portfolio.hooks";
import { usePortfolioUIStore } from "../stores/portfolioUIStore";
import type { Activity } from "../types/portfolio.types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ensureMs } from "@/lib/formatters";

const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - ensureMs(timestamp);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) return "Just now";
    if (minutes === 1) return "1 minute ago";
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours === 1) return "1 hour ago";
    if (hours < 24) return `${hours} hours ago`;
    if (days === 1) return "1 day ago";
    if (days < 7) return `${days} days ago`;
    if (weeks === 1) return "1 week ago";
    if (weeks < 4) return `${weeks} weeks ago`;
    if (months === 1) return "1 month ago";
    if (months < 12) return `${months} months ago`;
    if (years === 1) return "1 year ago";
    return `${years} years ago`;
};

const truncateWallet = (address: string) => (address.length > 8 ? `${address.slice(0, 4)}...${address.slice(-4)}` : address);

const formatDate = (timestamp: number) => {
    const date = new Date(ensureMs(timestamp));
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const groupActivitiesByDate = (activities: Activity[]) => {
    const grouped: { [key: string]: Activity[] } = {};
    activities.forEach((activity) => {
        const dateKey = formatDate(activity.timestamp);
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(activity);
    });
    return grouped;
};

interface ActivityRowProps extends Activity {
    wallet_icon?: string;
}

const ActivityRow: React.FC<ActivityRowProps> = ({ timestamp, tx_hash, token_in, token_out, token, from, to, wallet, fee_sol, fee_usd, tags, tx_url }) => {
    const isReceived = token && to === wallet;
    const isSent = token && from === wallet;

    return (
        <tr className="border-b border-[var(--border-faint)] hover:bg-[var(--surface-btn)] transition-colors">
            <td className="py-4 px-3 text-sm text-[var(--text-secondary)]">{formatRelativeTime(timestamp)}</td>
            <td className="py-4 px-3">
                <span className="text-sm font-mono text-[var(--text-primary)]" title={tx_hash}>
                    {truncateWallet(tx_hash)}
                </span>
            </td>
            <td className="py-4 px-3">
                <div className="flex flex-col gap-0.5">
                    {token_out && (
                        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            +{token_out.amount.toFixed(token_out.amount < 0.001 ? 10 : 4)} {token_out.symbol}
                        </span>
                    )}
                    {token_in && (
                        <span className="text-sm font-medium text-red-600 dark:text-red-400">
                            -{token_in.amount.toFixed(4)} {token_in.symbol}
                        </span>
                    )}
                    {isReceived && (
                        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            +{token!.amount.toFixed(4)} {token!.symbol}
                        </span>
                    )}
                    {isSent && (
                        <span className="text-sm font-medium text-red-600 dark:text-red-400">
                            -{token!.amount.toFixed(4)} {token!.symbol}
                        </span>
                    )}
                </div>
            </td>
            <td className="py-4 px-3">
                <span className="text-sm font-mono text-[var(--text-primary)]" title={wallet}>
                    {truncateWallet(wallet)}
                </span>
            </td>
            <td className="py-4 px-3">
                <div className="flex flex-col">
                    <span className="text-sm text-[var(--text-secondary)]">{fee_sol.toFixed(6)} SOL</span>
                    <span className="text-xs text-[var(--text-muted)]">${fee_usd.toFixed(4)}</span>
                </div>
            </td>
            <td className="py-4 px-3">
                <div className="flex items-center gap-1 flex-wrap">
                    {tags.slice(0, 1).map((tag, index) => (
                        <span
                            key={index}
                            className="px-2 py-0.5 rounded-full border border-blue-500/50 text-blue-600 dark:text-blue-400 text-xs whitespace-nowrap"
                        >
                            {tag}
                        </span>
                    ))}
                    {tags.length > 1 && (
                        <span className="px-2 py-0.5 rounded-full border border-[var(--border-default)] text-[var(--text-muted)] text-xs">
                            +{tags.length - 1}
                        </span>
                    )}
                </div>
            </td>
            <td className="py-4 px-2">
                <a
                    href={tx_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-8 h-8 rounded-lg
                               bg-violet-500/10 border border-violet-500/20
                               hover:bg-violet-500/20 hover:border-violet-500/35
                               transition-all"
                >
                    <ExternalLink className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" />
                </a>
            </td>
        </tr>
    );
};

export const ActivityTab: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const { filters } = usePortfolioUIStore();
    const fromTs = filters.timeFrom ? Math.floor(new Date(filters.timeFrom).getTime() / 1000) : undefined;
    const toTs = filters.timeTo ? Math.floor(new Date(filters.timeTo).getTime() / 1000) : undefined;

    useEffect(() => {
        setPage(1);
    }, [filters.timeFrom, filters.timeTo]);

    const {
        data: activitiesData,
        isLoading,
        error
    } = useActivities({
        limit: 50,
        type: "all",
        from: fromTs,
        to: toTs
    });

    if (error) {
        return (
            <div className="border border-[var(--border-default)] bg-[var(--surface-card)] p-8 rounded-2xl">
                <div className="flex flex-col items-center justify-center text-center gap-3">
                    <AlertTriangle className="size-8 text-violet-500" />
                    <div className="text-[var(--text-primary)] text-lg font-semibold">Error Loading Activities</div>
                    <div className="text-[var(--text-muted)] text-sm">{error instanceof Error ? error.message : "Network error. Please try again."}</div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6">
                {[1, 2].map((i) => (
                    <div key={i} className="flex flex-col gap-4 animate-pulse">
                        <div className="h-5 bg-[var(--surface-panel)] rounded w-48" />
                        <div className="h-64 bg-[var(--surface-panel)] rounded-2xl" />
                    </div>
                ))}
            </div>
        );
    }

    if (!activitiesData?.activities) return null;

    if (activitiesData.activities.length === 0) {
        return (
            <div className="border border-[var(--border-default)] bg-[var(--surface-card)] p-12 rounded-2xl">
                <div className="flex flex-col items-center justify-center text-center gap-2">
                    <div className="text-[var(--text-primary)] text-lg font-medium">No activities yet</div>
                    <div className="text-[var(--text-muted)] text-sm">Your transaction history will appear here</div>
                </div>
            </div>
        );
    }

    const filteredActivities = activitiesData.activities.filter((activity) => {
        if (!searchQuery) return true;
        return activity.wallet.toLowerCase().includes(searchQuery.toLowerCase()) || activity.tx_hash.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const totalPages = Math.ceil(filteredActivities.length / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedActivities = filteredActivities.slice(startIndex, endIndex);
    const groupedActivities = groupActivitiesByDate(paginatedActivities);

    return (
        <div className="flex flex-col gap-6">
            {/* Search and page size */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                    <Input
                        placeholder="Search by wallet address or tx hash..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPage(1);
                        }}
                        className="pl-10 h-10 text-sm border-[var(--border-default)]"
                    />
                </div>
                <select
                    value={pageSize}
                    onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setPage(1);
                    }}
                    className="h-10 px-3 rounded-lg border border-[var(--border-default)]
                               bg-[var(--surface-card)] text-[var(--text-primary)] text-sm
                               focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                >
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={50}>50 / page</option>
                    <option value={100}>100 / page</option>
                </select>
            </div>

            {/* Activities table */}
            {Object.keys(groupedActivities).length === 0 ? (
                <div className="text-center py-12 text-[var(--text-muted)] text-sm">No activities found</div>
            ) : (
                Object.entries(groupedActivities).map(([date, activities]) => (
                    <div key={date} className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-violet-500" />
                                <span className="text-[var(--text-primary)] text-sm font-semibold">{date}</span>
                            </div>
                            <span className="text-[var(--text-muted)] text-xs">{activities.length} activities</span>
                        </div>

                        <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden">
                            <table className="w-full table-fixed">
                                <colgroup>
                                    <col className="w-[11%]" />
                                    <col className="w-[16%]" />
                                    <col className="w-[20%]" />
                                    <col className="w-[14%]" />
                                    <col className="w-[12%]" />
                                    <col className="w-[22%]" />
                                    <col className="w-[5%]" />
                                </colgroup>
                                <thead className="bg-[var(--surface-panel)]">
                                    <tr className="border-b border-[var(--border-faint)]">
                                        <th className="py-3 px-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Time</th>
                                        <th className="py-3 px-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                            Signature
                                        </th>
                                        <th className="py-3 px-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Amount</th>
                                        <th className="py-3 px-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Wallet</th>
                                        <th className="py-3 px-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Fee</th>
                                        <th className="py-3 px-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Tags</th>
                                        <th className="py-3 px-3 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Link</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activities.map((activity) => (
                                        <ActivityRow key={`${activity.tx_hash}-${activity.wallet}`} {...activity} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-[var(--text-muted)]">
                        Showing {startIndex + 1}–{Math.min(endIndex, filteredActivities.length)} of {filteredActivities.length}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            className="h-9 border-[var(--border-default)]"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum: number;
                                if (totalPages <= 5) pageNum = i + 1;
                                else if (page <= 3) pageNum = i + 1;
                                else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                                else pageNum = page - 2 + i;

                                return (
                                    <Button
                                        key={pageNum}
                                        variant={page === pageNum ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setPage(pageNum)}
                                        className={`h-9 w-9 ${page === pageNum ? "bg-violet-600 hover:bg-violet-700 border-violet-600" : "border-[var(--border-default)]"}`}
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(page + 1)}
                            disabled={page === totalPages}
                            className="h-9 border-[var(--border-default)]"
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
