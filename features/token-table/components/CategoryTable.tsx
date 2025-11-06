'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useMemo } from 'react';
import { categoryColumns } from '../config/categoryColumns';
import { mockCategoryData } from '../config/mock-data';
import { EmptyState } from './EmptyState';

interface CategoryTableProps {
    searchQuery?: string;
}

/**
 * CategoryTable Component
 * Displays category overview data for the Categories tab
 */
export function CategoryTable({ searchQuery = '' }: CategoryTableProps) {
    // Filter categories based on search query
    const data = useMemo(() => {
        if (!searchQuery) return mockCategoryData;
        
        return mockCategoryData.filter((category) =>
            category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            category.slug.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    const table = useReactTable({
        data,
        columns: categoryColumns,
        getCoreRowModel: getCoreRowModel(),
    });

    const hasData = table.getRowModel().rows.length > 0;

    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl px-4">
            {hasData ? (
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
