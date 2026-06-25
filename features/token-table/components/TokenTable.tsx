"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { flexRender } from "@tanstack/react-table";
import { Clock, RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { TokenFilterResponse } from "@/types/filter";

import { TokenTabs } from "./TokenTabs";
import { TimeFilters } from "./TimeFilters";
import { FilterButton } from "./FilterButton";
import { QuickBuyInput } from "./QuickBuyInput";
import { RightPanelFilter } from "./RightPanelFilter";
import { SortPanel } from "./SortPanel";
import { CategorySearch } from "./CategorySearch";
import { EmptyState } from "./EmptyState";
import { CategoryTable } from "./CategoryTable";
import { CategoryDetailModal } from "./CategoryDetailModal";
import { useTokenTable } from "../hooks/useTokenTable";
import type { TokenTableData } from "../config/types";
import { QuickBuyReviewModal } from "./QuickBuyReviewModal";

/**
 * TokenTable Component
 * Displays a table of cryptocurrency tokens with filtering and sorting capabilities
 * For Categories tab, displays CategoryTable instead
 */
export default function TokenTable() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const [quickBuyToken, setQuickBuyToken] = useState<TokenTableData | null>(null);
    const [quickBuyModalOpen, setQuickBuyModalOpen] = useState(false);
    const handleQuickBuy = useCallback(
        (token: TokenTableData) => {
            if (!isAuthenticated) {
                toast.info("Please sign in to your Solsight account to buy tokens.");
                return;
            }
            setQuickBuyToken(token);
            setQuickBuyModalOpen(true);
        },
        [isAuthenticated]
    );
    const {
        table,
        filters,
        setTimeFilter,
        setActiveTab,
        setQuickBuyAmount,
        setCategorySearch,
        setSelectedCategorySlug,
        toggleSort,
        resetFilters,
        applyFilterResults,
        isLoading,
        isFetching,
        isFetchingNextPage,
        fetchNextPage,
        hasNextPage,
        error,
        dataUpdatedAt,
        refetch
    } = useTokenTable(handleQuickBuy);

    // Sentinel ref for infinite scroll
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        // Favourites and API-filtered results are complete lists — no infinite scroll.
        if (filters.activeTab === "FAVOURITES" || filters.filteredData) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage && !isFetching) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [filters.activeTab, filters.filteredData, hasNextPage, isFetchingNextPage, isFetching, fetchNextPage]);

    const isRefetching = isFetching && !isLoading;

    // Debug log for favorites
    const handleRowClick = (tokenAddress: string) => {
        router.push(`/token/${tokenAddress}`);
    };

    // Render different right panel content based on active tab
    const renderRightPanel = () => {
        switch (filters.activeTab) {
            case "TOP":
                return (
                    <RightPanelFilter>
                        <TimeFilters activeFilter={filters.timeFilter} onFilterChange={setTimeFilter} />
                        <SortPanel
                            sortState={{
                                option: filters.sortOption,
                                direction: filters.sortDirection
                            }}
                            onSortChange={toggleSort}
                        />
                        <FilterButton
                            filterOptions={{ limit: 100 }}
                            onReset={() => {
                                resetFilters();
                            }}
                            onApply={(res: TokenFilterResponse | null) => {
                                applyFilterResults(res);
                            }}
                        />
                        <QuickBuyInput value={filters.quickBuyAmount} onChange={setQuickBuyAmount} />
                    </RightPanelFilter>
                );

            case "CATEGORIES":
                return (
                    <RightPanelFilter>
                        <TimeFilters activeFilter={filters.timeFilter} onFilterChange={setTimeFilter} />
                        <CategorySearch value={filters.categorySearch} onChange={setCategorySearch} />
                        <FilterButton
                            filterOptions={{ limit: 100 }}
                            onReset={() => {
                                resetFilters();
                            }}
                            onApply={(res: TokenFilterResponse | null) => {
                                applyFilterResults(res);
                            }}
                        />
                    </RightPanelFilter>
                );

            case "FAVOURITES":
            case "TRENDING":
            default:
                return (
                    <RightPanelFilter>
                        <TimeFilters activeFilter={filters.timeFilter} onFilterChange={setTimeFilter} />
                        <FilterButton
                            filterOptions={{ limit: 100 }}
                            onReset={() => {
                                resetFilters();
                            }}
                            onApply={(res: TokenFilterResponse | null) => {
                                applyFilterResults(res);
                            }}
                        />
                        <QuickBuyInput value={filters.quickBuyAmount} onChange={setQuickBuyAmount} />
                    </RightPanelFilter>
                );
        }
    };

    const hasData = table.getRowModel().rows.length > 0;
    const isCategories = filters.activeTab === "CATEGORIES";

    const renderContent = () => {
        if (isCategories) {
            return <CategoryTable searchQuery={filters.categorySearch} onCategorySelect={setSelectedCategorySlug} />;
        }
        if (error) {
            return <EmptyState message={`Error loading tokens: ${error instanceof Error ? error.message : "Unknown error"}`} />;
        }
        if (isLoading) return <LoadingSkeleton />;
        if (!hasData && filters.activeTab === "FAVOURITES") {
            return <EmptyState message="No favourite tokens yet — click the star on any token to save it here." />;
        }
        if (hasData) {
            return (
                <div
                    className="overflow-y-auto max-h-[calc(100vh-260px)]
                                [scrollbar-width:thin] [scrollbar-color:rgba(139,92,246,0.25)_transparent]"
                >
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="border-b border-white/[0.05] hover:bg-transparent">
                                    {headerGroup.headers.map((header) => (
                                        <TableHead
                                            key={header.id}
                                            className="h-8 px-4 bg-white/[0.015]
                                                       text-[10px] font-bold uppercase tracking-[0.08em] text-white/35"
                                        >
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.map((row, idx) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    onClick={() => handleRowClick(row.original.id)}
                                    className={[
                                        "cursor-pointer border-b border-white/[0.04]",
                                        "transition-colors duration-100",
                                        "hover:bg-violet-500/[0.05] hover:border-violet-500/[0.12]",
                                        idx % 2 !== 0 ? "bg-white/[0.012]" : "bg-transparent"
                                    ].join(" ")}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="px-4 py-2.5 text-[13px] font-medium text-white/80">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Infinite scroll sentinel */}
                    <div ref={sentinelRef} className="h-1" />
                    {isFetchingNextPage && (
                        <div className="flex items-center justify-center py-4 gap-2 text-white/30 text-xs">
                            <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Loading more tokens...
                        </div>
                    )}
                    {!hasNextPage && table.getRowModel().rows.length > 0 && (
                        <div className="flex items-center justify-center py-3 text-white/20 text-xs">All tokens loaded</div>
                    )}
                </div>
            );
        }
        return <EmptyState message="Oops, it's empty!" />;
    };

    return (
        <>
            <div className="relative">
                {/* ── Cache freshness note ── */}
                {!isCategories && dataUpdatedAt > 0 && (
                    <div className="absolute -top-9 right-0">
                        <CacheNote timestamp={dataUpdatedAt} isRefetching={isRefetching} onRefresh={() => refetch()} />
                    </div>
                )}

                <div
                    className="overflow-hidden rounded-2xl border border-purple-500/15 bg-[#0d1117]
                                shadow-[0_0_0_1px_rgba(139,92,246,0.06),0_8px_32px_rgba(0,0,0,0.4)]"
                >
                    {/* ── Toolbar ── */}
                    <div
                        className="flex flex-col gap-3 px-4 py-3 border-b border-white/[0.05] bg-white/[0.015]
                                    sm:flex-row sm:items-center sm:justify-between"
                    >
                        <TokenTabs activeTab={filters.activeTab} onTabClick={setActiveTab} showFavourites={isAuthenticated} />
                        {renderRightPanel()}
                    </div>

                    {/* ── Content ── */}
                    {renderContent()}
                </div>
            </div>

            {isCategories && <CategoryDetailModal categorySlug={filters.selectedCategorySlug} onClose={() => setSelectedCategorySlug(null)} />}
            {!isCategories && (
                <QuickBuyReviewModal open={quickBuyModalOpen} onOpenChange={setQuickBuyModalOpen} token={quickBuyToken} amountSol={filters.quickBuyAmount} />
            )}
        </>
    );
}

/* ── Cache Note ──────────────────────────────────────────────────────────── */
function formatDataAge(timestamp: number): string {
    const ageMs = Date.now() - timestamp;
    const ageSec = Math.floor(ageMs / 1000);
    if (ageSec < 10) return "just now";
    if (ageSec < 60) return `${ageSec}s ago`;
    const ageMin = Math.floor(ageSec / 60);
    if (ageMin < 60) return `${ageMin} min${ageMin > 1 ? "s" : ""} ago`;
    const ageHour = Math.floor(ageMin / 60);
    return `${ageHour}h ago`;
}

function CacheNote({ timestamp, isRefetching, onRefresh }: { timestamp: number; isRefetching: boolean; onRefresh: () => void }) {
    const [age, setAge] = useState(() => formatDataAge(timestamp));

    useEffect(() => {
        setAge(formatDataAge(timestamp));
        const id = setInterval(() => setAge(formatDataAge(timestamp)), 10_000);
        return () => clearInterval(id);
    }, [timestamp]);

    return (
        <span className="flex items-center gap-3 select-none">
            <span className="flex items-center gap-1.5 text-[11px] text-white/30">
                <Clock className="w-3 h-3 shrink-0" />
                Updated {age}
            </span>
            <button
                onClick={onRefresh}
                disabled={isRefetching}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-white/10
                           text-[11px] font-medium text-white/50
                           hover:border-violet-500/40 hover:text-violet-400 hover:bg-violet-500/5
                           disabled:opacity-40 disabled:cursor-not-allowed
                           transition-all duration-150"
            >
                <RotateCw className={`w-3 h-3 ${isRefetching ? "animate-spin" : ""}`} />
                Refresh
            </button>
        </span>
    );
}

/* ── Loading Skeleton ────────────────────────────────────────────────────── */
function SkBar({ className, style }: { className?: string; style?: React.CSSProperties }) {
    return <div className={`rounded-full animate-pulse bg-black/[0.07] dark:bg-white/[0.07] ${className ?? ""}`} style={style} />;
}

function LoadingSkeleton() {
    return (
        <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
            {/* Header row */}
            <div className="flex items-center gap-4 px-4 h-8 bg-black/[0.02] dark:bg-white/[0.015]">
                <SkBar className="w-4 h-1.5 shrink-0" />
                <SkBar className="flex-[2] h-1.5" />
                {[1, 1, 1, 1, 1, 1, 1].map((_, i) => (
                    <SkBar key={i} className="flex-[1] h-1.5" />
                ))}
                <SkBar className="w-16 h-1.5 shrink-0" />
            </div>

            {/* Data rows */}
            {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-2.5">
                    {/* Star */}
                    <SkBar className="w-4 h-4 shrink-0" style={{ animationDelay: `${i * 35}ms` }} />

                    {/* Token cell */}
                    <div className="flex items-center gap-2.5 flex-[2] min-w-0">
                        <div
                            className="w-7 h-7 rounded-full animate-pulse shrink-0 bg-violet-500/[0.12] dark:bg-violet-500/[0.10]"
                            style={{ animationDelay: `${i * 35}ms` }}
                        />
                        <div className="space-y-1.5 min-w-0">
                            <SkBar className="h-2 w-20" style={{ animationDelay: `${i * 35}ms` }} />
                            <SkBar className="h-1.5 w-12 opacity-60" style={{ animationDelay: `${i * 35 + 80}ms` }} />
                        </div>
                    </div>

                    {/* Data columns */}
                    {[1, 1, 1, 1, 1, 1, 1].map((_, j) => (
                        <div key={j} className="flex-[1] flex flex-col items-end gap-1.5">
                            <SkBar className="h-2 w-full max-w-[64px]" style={{ animationDelay: `${i * 35 + j * 20}ms` }} />
                            <SkBar className="h-1.5 w-3/5 max-w-[40px] opacity-60" style={{ animationDelay: `${i * 35 + j * 20 + 60}ms` }} />
                        </div>
                    ))}

                    {/* Action button placeholder */}
                    <div
                        className="w-20 h-6 rounded-lg animate-pulse shrink-0 bg-violet-500/[0.08] dark:bg-violet-500/[0.07]"
                        style={{ animationDelay: `${i * 35 + 140}ms` }}
                    />
                </div>
            ))}
        </div>
    );
}
