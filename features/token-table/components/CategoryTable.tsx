"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { flexRender } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { EmptyState } from "./EmptyState";
import { useCategoryTable } from "../hooks/useCategoryTable";
import type { CategorySortBy, CategorySortOrder } from "../services/token-discovery.service";

interface CategoryTableProps {
    searchQuery?: string;
    onCategorySelect?: (slug: string) => void;
    marketCapMin?: number | null;
    marketCapMax?: number | null;
    volumeMin?: number | null;
    volumeMax?: number | null;
    sortBy?: CategorySortBy;
    sortOrder?: CategorySortOrder;
}

/**
 * CategoryTable Component
 * Displays category overview data for the Categories tab
 */
export function CategoryTable({ searchQuery = "", onCategorySelect, marketCapMin, marketCapMax, volumeMin, volumeMax, sortBy, sortOrder }: CategoryTableProps) {
    const router = useRouter();
    const { table, isLoading, error } = useCategoryTable({ searchQuery, marketCapMin, marketCapMax, volumeMin, volumeMax, sortBy, sortOrder });

    const handleRowClick = (categorySlug: string) => {
        if (onCategorySelect) {
            onCategorySelect(categorySlug);
        } else {
            // Navigate to category detail page as fallback
            router.push(`/category/${categorySlug}`);
        }
    };

    const hasData = table.getRowModel().rows.length > 0;

    if (error) {
        return (
            <EmptyState
                title="Failed to Load Categories"
                message={error instanceof Error ? error.message : "An unexpected error occurred while fetching categories."}
                type="error"
            />
        );
    }
    if (isLoading) {
        return <EmptyState message="Loading categories..." emptyStateForLoading={true} />;
    }
    if (!hasData) {
        return <EmptyState title="No Categories Found" message="No token categories match your search filters." type="filters" />;
    }

    return (
        <div className="w-full">
            <Table className="px-4 table-fixed w-full">
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="border-b border-white/[0.05] hover:bg-transparent">
                            {headerGroup.headers.map((header) => (
                                <TableHead
                                    key={header.id}
                                    className="h-8 px-4 bg-white/[0.015]
                                               text-[10px] font-bold uppercase tracking-[0.08em] text-white/35"
                                    style={{ width: `${header.getSize()}px` }}
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
                            onClick={() => handleRowClick(row.original.slug)}
                            className={[
                                "cursor-pointer border-b border-white/[0.04]",
                                "transition-colors duration-100",
                                "hover:bg-violet-500/[0.05] hover:border-violet-500/[0.12]",
                                idx % 2 !== 0 ? "bg-white/[0.012]" : "bg-transparent"
                            ].join(" ")}
                        >
                            {row.getVisibleCells().map((cell) => (
                                <TableCell
                                    key={cell.id}
                                    className="px-4 py-2.5 text-[13px] font-medium text-white/80"
                                    style={{ width: `${cell.column.getSize()}px` }}
                                >
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="flex items-center justify-end space-x-2 py-4 px-4 bg-white/[0.015] border-t border-white/[0.05]">
                <div className="flex-1 text-sm text-white/30 mr-4">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
                </div>
                <button
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-white/10
                               text-sm font-medium text-white/50
                               hover:border-violet-500/40 hover:text-violet-400 hover:bg-violet-500/5
                               disabled:opacity-40 disabled:cursor-not-allowed
                               transition-all duration-150"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </button>
                <button
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-white/10
                               text-sm font-medium text-white/50
                               hover:border-violet-500/40 hover:text-violet-400 hover:bg-violet-500/5
                               disabled:opacity-40 disabled:cursor-not-allowed
                               transition-all duration-150"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                </button>
            </div>
        </div>
    );
}
