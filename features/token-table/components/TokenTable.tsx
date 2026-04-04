"use client";

import { useCallback, useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { flexRender } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { TokenTabs } from "./TokenTabs";
import { TimeFilters } from "./TimeFilters";
import { FilterButton } from "./FilterButton";
import { QuickBuyInput } from "./QuickBuyInput";
import { RightPanelFilter } from "./RightPanelFilter";
import { SortPanel } from "./SortPanel";
import { CategorySearch } from "./CategorySearch";
import { EmptyState } from "./EmptyState";
import { CategoryTable } from "./CategoryTable";
import { useTokenTable } from "../hooks/useTokenTable";
import { PoolFilterResponse, TokenFilterResponse } from "@/types/filter";
import type { TokenTableData } from "../config/types";
import { QuickBuyReviewModal } from "./QuickBuyReviewModal";

/**
 * TokenTable Component
 * Displays a table of cryptocurrency tokens with filtering and sorting capabilities
 * For Categories tab, displays CategoryTable instead
 */
export default function TokenTable() {
    const router = useRouter();
    const [quickBuyToken, setQuickBuyToken] = useState<TokenTableData | null>(null);
    const [quickBuyModalOpen, setQuickBuyModalOpen] = useState(false);
    const handleQuickBuy = useCallback((token: TokenTableData) => {
        setQuickBuyToken(token);
        setQuickBuyModalOpen(true);
    }, []);
    const {
        table,
        filters,
        setTimeFilter,
        setActiveTab,
        setQuickBuyAmount,
        setCategorySearch,
        toggleSort,
        resetFilters,
        applyFilterResults,
        isLoading,
        error
    } = useTokenTable(handleQuickBuy);

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
                            onReset={() => {
                                resetFilters();
                            }}
                            onApply={(res: TokenFilterResponse | PoolFilterResponse) => {
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
                            onReset={() => {
                                resetFilters();
                            }}
                            onApply={(res: TokenFilterResponse | PoolFilterResponse) => {
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
                            onReset={() => {
                                resetFilters();
                            }}
                            onApply={(res: TokenFilterResponse | PoolFilterResponse) => {
                                applyFilterResults(res);
                            }}
                        />
                        <QuickBuyInput value={filters.quickBuyAmount} onChange={setQuickBuyAmount} />
                    </RightPanelFilter>
                );
        }
    };

    const hasData = table.getRowModel().rows.length > 0;

    // Render CategoryTable for Categories tab
    if (filters.activeTab === "CATEGORIES") {
        return (
            <>
                <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <TokenTabs activeTab={filters.activeTab} onTabClick={setActiveTab} />
                    {renderRightPanel()}
                </div>
                <CategoryTable searchQuery={filters.categorySearch} />
            </>
        );
    }

    return (
        <>
            <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <TokenTabs activeTab={filters.activeTab} onTabClick={setActiveTab} />
                {renderRightPanel()}
            </div>

            <div
                className="overflow-hidden rounded-2xl border border-purple-500/15 bg-[#0d1117]
                            shadow-[0_0_0_1px_rgba(139,92,246,0.06),0_8px_32px_rgba(0,0,0,0.4)]"
            >
                {error ? (
                    <EmptyState message={`Error loading tokens: ${error instanceof Error ? error.message : "Unknown error"}`} />
                ) : isLoading ? (
                    <LoadingSkeleton />
                ) : !hasData && filters.activeTab === "FAVOURITES" ? (
                    <EmptyState message="No favorite tokens yet. Click the star icon on any token to add it to your favorites!" />
                ) : hasData ? (
                    <div
                        className="overflow-y-auto max-h-[calc(100vh-250px)]
                                    [scrollbar-width:thin] [scrollbar-color:rgba(139,92,246,0.25)_transparent]"
                    >
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id} className="border-b border-white/[0.06] hover:bg-transparent">
                                        {headerGroup.headers.map((header) => (
                                            <TableHead
                                                key={header.id}
                                                className="h-9 px-4 bg-white/[0.02]
                                                           text-xs font-semibold uppercase tracking-wider text-white/50"
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
                                            "transition-all duration-150",
                                            "hover:bg-purple-500/[0.06] hover:border-purple-500/20",
                                            idx % 2 !== 0 ? "bg-white/[0.01]" : "bg-transparent"
                                        ].join(" ")}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="px-4 py-3 text-sm font-medium text-white/80">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <EmptyState message="Oops, it's empty!" />
                )}
            </div>
            <QuickBuyReviewModal open={quickBuyModalOpen} onOpenChange={setQuickBuyModalOpen} token={quickBuyToken} amountSol={filters.quickBuyAmount} />
        </>
    );
}

/* ── Loading Skeleton ────────────────────────────────────────────────────── */
function LoadingSkeleton() {
    return (
        <div className="divide-y divide-white/[0.04]">
            {/* Fake header */}
            <div className="flex items-center gap-6 px-4 h-9 bg-white/[0.02]">
                {[80, 120, 60, 90, 70, 80, 60].map((w, i) => (
                    <div key={i} className="h-2 rounded-full bg-white/10 animate-pulse" style={{ width: w }} />
                ))}
            </div>
            {/* Fake rows */}
            {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-center gap-6 px-4 py-3">
                    <div className="flex items-center gap-2.5 shrink-0" style={{ width: 160 }}>
                        <div className="w-7 h-7 rounded-full bg-purple-500/10 animate-pulse" />
                        <div className="space-y-1.5">
                            <div className="h-2.5 w-16 rounded-full bg-white/10 animate-pulse" />
                            <div className="h-2 w-10 rounded-full bg-white/[0.06] animate-pulse" />
                        </div>
                    </div>
                    {[70, 80, 65, 75, 60, 55].map((w, j) => (
                        <div
                            key={j}
                            className="h-2.5 rounded-full animate-pulse"
                            style={{
                                width: w,
                                backgroundColor: `rgba(255,255,255,${0.04 + (j % 2) * 0.02})`,
                                animationDelay: `${i * 50 + j * 25}ms`
                            }}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}
