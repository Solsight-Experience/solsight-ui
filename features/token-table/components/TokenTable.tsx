'use client';

import { useEffect } from 'react';
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
import { TokenTabs } from './TokenTabs';
import { TimeFilters } from './TimeFilters';
import { FilterButton } from './FilterButton';
import { QuickBuyInput } from './QuickBuyInput';
import { RightPanelFilter } from './RightPanelFilter';
import { SortPanel } from './SortPanel';
import { CategorySearch } from './CategorySearch';
import { EmptyState } from './EmptyState';
import { CategoryTable } from './CategoryTable';
import { useTokenTable } from '../hooks/useTokenTable';
import { PoolFilterResponse, TokenFilterResponse } from '@/types/filter';
import { queryKeys } from '@/lib/react-query-keys';

/**
 * TokenTable Component
 * Displays a table of cryptocurrency tokens with filtering and sorting capabilities
 * For Categories tab, displays CategoryTable instead
 */
export default function TokenTable() {
    const router = useRouter();
    const {
        table,
        filters,
        setTimeFilter,
        setActiveTab,
        setQuickBuyAmount,
        setCategorySearch,
        toggleSort,
        toggleFavourite,
        resetFilters,
        applyFilterResults,
        isLoading,
        error,
    } = useTokenTable();

    // Debug log for favorites
    useEffect(() => {
        if (filters.activeTab === 'FAVOURITES') {
            console.log('Favorites Tab Active');
            console.log('Favorite IDs:', Array.from(filters.favouriteIds));
            console.log('Table rows:', table.getRowModel().rows.length);
        }
    }, [filters.activeTab, filters.favouriteIds, table]);

    const handleRowClick = (tokenAddress: string) => {
        router.push(`/token/${tokenAddress}`);
    };

    // Render different right panel content based on active tab
    const renderRightPanel = () => {
        switch (filters.activeTab) {
            case 'TOP':
                return (
                    <RightPanelFilter>
                        <TimeFilters
                            activeFilter={filters.timeFilter}
                            onFilterChange={setTimeFilter}
                        />
                        <SortPanel
                            sortState={{
                                option: filters.sortOption,
                                direction: filters.sortDirection,
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
                        <QuickBuyInput
                            value={filters.quickBuyAmount}
                            onChange={setQuickBuyAmount}
                        />
                    </RightPanelFilter>
                );

            case 'CATEGORIES':
                return (
                    <RightPanelFilter>
                        <TimeFilters
                            activeFilter={filters.timeFilter}
                            onFilterChange={setTimeFilter}
                        />
                        <CategorySearch
                            value={filters.categorySearch}
                            onChange={setCategorySearch}
                        />
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

            case 'FAVOURITES':
            case 'TRENDING':
            default:
                return (
                    <RightPanelFilter>
                        <TimeFilters
                            activeFilter={filters.timeFilter}
                            onFilterChange={setTimeFilter}
                        />
                        <FilterButton 
                            onReset={() => {
                                resetFilters();
                            }} 
                            onApply={(res: TokenFilterResponse | PoolFilterResponse) => {
                                applyFilterResults(res);
                            }} 
                        />
                        <QuickBuyInput
                            value={filters.quickBuyAmount}
                            onChange={setQuickBuyAmount}
                        />
                    </RightPanelFilter>
                );
        }
    };

    const hasData = table.getRowModel().rows.length > 0;

    // Render CategoryTable for Categories tab
    if (filters.activeTab === 'CATEGORIES') {
        return (
            <>
                <div className="flex justify-between">
                    <TokenTabs
                        activeTab={filters.activeTab}
                        onTabClick={setActiveTab}
                    />
                    {renderRightPanel()}
                </div>
                <CategoryTable 
                    searchQuery={filters.categorySearch} 
                />
            </>
        );
    }

    // Render regular TokenTable for other tabs
    return (
        <>
            <div className="flex justify-between">
                <TokenTabs
                    activeTab={filters.activeTab}
                    onTabClick={setActiveTab}
                />
                {renderRightPanel()}
            </div>
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
                {error ? (
                    <EmptyState message={`Error loading tokens: ${error instanceof Error ? error.message : 'Unknown error'}`} />
                ) : isLoading ? (
                    <EmptyState message="Loading tokens..." emptyStateForLoading={true} />
                ) : !hasData && filters.activeTab === 'FAVOURITES' ? (
                    <EmptyState message="No favorite tokens yet. Click the star icon on any token to add it to your favorites!" />
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
                                        data-state={row.getIsSelected() && 'selected'}
                                        onClick={() => handleRowClick(row.original.id)}
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
                    <EmptyState message="Oops, it's empty!" />
                )}
            </div>
        </>
    );
}