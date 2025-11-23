'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { flexRender } from '@tanstack/react-table';
import { EmptyState } from './EmptyState';
import { useCategoryTable } from '../hooks/useCategoryTable';

interface CategoryTableProps {
    searchQuery?: string;
}

/**
 * CategoryTable Component
 * Displays category overview data for the Categories tab
 */
export function CategoryTable({ searchQuery = '' }: CategoryTableProps) {
    const { table, isLoading, error } = useCategoryTable({ searchQuery });

    const hasData = table.getRowModel().rows.length > 0;

    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl px-4">
            {error ? (
                <EmptyState message={`Error loading categories: ${error instanceof Error ? error.message : 'Unknown error'}`} />
            ) : isLoading ? (
                <EmptyState message="Loading categories..." />
            ) : hasData ? (
                <Table>
                    <TableHeader className="bg-muted/20">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id} className="py-4">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <EmptyState message="No categories found" />
            )}
        </div>
    );
}
