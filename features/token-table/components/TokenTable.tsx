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

/**
 * TokenTable Component
 * Displays a table of cryptocurrency tokens with filtering and sorting capabilities
 * For Categories tab, displays CategoryTable instead
 */
export default function TokenTable() {
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
    } = useTokenTable();

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
                        <FilterButton onReset={resetFilters} onApply={() => {
                            console.log('Filters applied', filters);
                        }} />
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
                        <FilterButton onReset={resetFilters} onApply={() => {
                            console.log('Filters applied', filters);
                        }} />

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
                        <FilterButton onReset={resetFilters} onApply={() => {
                            console.log('Filters applied', filters);
                        }} />
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
                <CategoryTable searchQuery={filters.categorySearch} />
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
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
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
                    <EmptyState message="Oops, it's empty!" />
                )}
            </div>
        </>
    );
}