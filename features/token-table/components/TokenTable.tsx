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
import columns from '../config/columns';
import { TokenTabs } from './TokenTabs';
import { TimeFilters } from './TimeFilters';
import { FilterButton } from './FilterButton';
import { QuickBuyInput } from './QuickBuyInput';
import { useTokenTable } from '../hooks/useTokenTable';

/**
 * TokenTable Component
 * Displays a table of cryptocurrency tokens with filtering and sorting capabilities
 */
export default function TokenTable() {
    const {
        table,
        filters,
        setTimeFilter,
        setActiveTab,
        setQuickBuyAmount,
        resetFilters,
    } = useTokenTable();

    return (
        <>
            <div className="flex justify-between">
                <TokenTabs 
                    activeTab={filters.activeTab}
                    onTabClick={setActiveTab}
                />
                <div className="flex items-center gap-[18px]">
                    <TimeFilters
                        activeFilter={filters.timeFilter}
                        onFilterChange={setTimeFilter}
                    />
                    <FilterButton
                        onReset={resetFilters}
                        onApply={() => {
                            // TODO: Implement filter apply logic
                            console.log('Filters applied', filters);
                        }}
                    />
                    <QuickBuyInput
                        value={filters.quickBuyAmount}
                        onChange={setQuickBuyAmount}
                    />
                </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl px-4">
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
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-4">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}
