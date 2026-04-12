"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { flexRender } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { EmptyState } from "./EmptyState";
import { useCategoryTable } from "../hooks/useCategoryTable";

interface CategoryTableProps {
    searchQuery?: string;
    onCategorySelect?: (slug: string) => void;
}

/**
 * CategoryTable Component
 * Displays category overview data for the Categories tab
 */
export function CategoryTable({ searchQuery = "", onCategorySelect }: CategoryTableProps) {
    const router = useRouter();
    const { table, isLoading, error } = useCategoryTable({ searchQuery });

    const handleRowClick = (categorySlug: string) => {
        if (onCategorySelect) {
            onCategorySelect(categorySlug);
        } else {
            // Navigate to category detail page as fallback
            router.push(`/category/${categorySlug}`);
        }
    };

    const hasData = table.getRowModel().rows.length > 0;

    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
            {error ? (
                <EmptyState message={`Error loading categories: ${error instanceof Error ? error.message : "Unknown error"}`} />
            ) : isLoading ? (
                <EmptyState message="Loading categories..." emptyStateForLoading={true} />
            ) : hasData ? (
                <div className="w-full">
                    <Table className="px-4 table-fixed w-full">
                        <TableHeader className="bg-muted/20">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead
                                            key={header.id}
                                            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                                            style={{ width: `${header.getSize()}px` }}
                                        >
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    onClick={() => handleRowClick(row.original.slug)}
                                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-4" style={{ width: `${cell.column.getSize()}px` }}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="flex items-center justify-end space-x-2 py-4 px-4 bg-muted/10 border-t border-border">
                        <div className="flex-1 text-sm text-muted-foreground mr-4">
                            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
                        </div>
                        <button
                            className="px-3 py-1 bg-muted/30 hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-sm transition-colors"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Previous
                        </button>
                        <button
                            className="px-3 py-1 bg-muted/30 hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-sm transition-colors"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Next
                        </button>
                    </div>
                </div>
            ) : (
                <EmptyState message="No categories found" />
            )}
        </div>
    );
}
