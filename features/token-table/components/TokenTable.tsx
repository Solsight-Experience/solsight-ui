"use client";

import { useCallback, useState } from "react";
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
import { CategoryDetailModal } from "./CategoryDetailModal";
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
        setSelectedCategorySlug,
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
                </div>
            );
        }
        return <EmptyState message="Oops, it's empty!" />;
    };

    return (
        <>
            <div
                className="overflow-hidden rounded-2xl border border-purple-500/15 bg-[#0d1117]
                            shadow-[0_0_0_1px_rgba(139,92,246,0.06),0_8px_32px_rgba(0,0,0,0.4)]"
            >
                {/* ── Toolbar ── */}
                <div
                    className="flex flex-col gap-3 px-4 py-3 border-b border-white/[0.05] bg-white/[0.015]
                                sm:flex-row sm:items-center sm:justify-between"
                >
                    <TokenTabs activeTab={filters.activeTab} onTabClick={setActiveTab} />
                    {renderRightPanel()}
                </div>

                {/* ── Content ── */}
                {renderContent()}
            </div>

            {isCategories && <CategoryDetailModal categorySlug={filters.selectedCategorySlug} onClose={() => setSelectedCategorySlug(null)} />}
            {!isCategories && (
                <QuickBuyReviewModal open={quickBuyModalOpen} onOpenChange={setQuickBuyModalOpen} token={quickBuyToken} amountSol={filters.quickBuyAmount} />
            )}
        </>
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
