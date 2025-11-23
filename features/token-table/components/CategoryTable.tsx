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
import { useRouter } from 'next/navigation';
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
    const router = useRouter();
    const { table, isLoading, error } = useCategoryTable({ searchQuery });

    const handleRowClick = (categorySlug: string) => {
        // Navigate to category detail page - you can customize this route
        router.push(`/category/${categorySlug}`);
    };

    const hasData = table.getRowModel().rows.length > 0;

    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
            {error ? (
                <EmptyState message={`Error loading categories: ${error instanceof Error ? error.message : 'Unknown error'}`} />
            ) : isLoading ? (
                <EmptyState message="Loading categories..." emptyStateForLoading={true} />
            ) : hasData ? (
                <div className="overflow-y-auto max-h-[calc(100vh-250px)]">
                    <Table className="px-4">
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
                                <TableRow 
                                    key={row.id}
                                    onClick={() => handleRowClick(row.original.slug)}
                                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-4">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <EmptyState message="No categories found" />
            )}
        </div>
    );
}
