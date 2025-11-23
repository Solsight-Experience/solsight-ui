import { useState, useCallback, useMemo } from 'react';
import { getCoreRowModel, useReactTable, SortingState, getSortedRowModel } from '@tanstack/react-table';
import { TimeFilterValue } from '../components/TimeFilters';
import { TokenTableTabOption } from '../components/TokenTabs';
import { SortOption, SortDirection } from '../components/SortPanel';
import { createColumns } from '../config/columns';
import { mockTokenData } from '../config/mock-data';

export interface TokenTableFilters {
    timeFilter: TimeFilterValue;
    activeTab: TokenTableTabOption;
    quickBuyAmount: string;
    categorySearch: string;
    sortOption: SortOption;
    sortDirection: SortDirection;
    favouriteIds: Set<string>;
}

export function useTokenTable() {
    const [filters, setFilters] = useState<TokenTableFilters>({
        timeFilter: '1m',
        activeTab: 'TRENDING',
        quickBuyAmount: '0.1',
        categorySearch: '',
        sortOption: 'volumes',
        sortDirection: 'none',
        favouriteIds: new Set(),
    });

    const [sorting, setSorting] = useState<SortingState>([]);

    const toggleFavourite = useCallback((tokenId: string) => {
        setFilters((prev) => {
            const newFavourites = new Set(prev.favouriteIds);
            if (newFavourites.has(tokenId)) {
                newFavourites.delete(tokenId);
            } else {
                newFavourites.add(tokenId);
            }
            return { ...prev, favouriteIds: newFavourites };
        });
    }, []);

    // Memoize columns
    const columns = useMemo(
        () => createColumns(toggleFavourite, filters.favouriteIds, filters.quickBuyAmount),
        [toggleFavourite, filters.favouriteIds, filters.quickBuyAmount]
    );

    // TODO: Replace with actual API call
    const data = useMemo(() => {
        let filteredData = [...mockTokenData];

        // Filter by favourites
        if (filters.activeTab === 'FAVOURITES') {
            filteredData = filteredData.filter((token) => filters.favouriteIds.has(token.id));
        }

        // Filter by category search
        if (filters.categorySearch && filters.activeTab === 'CATEGORIES') {
            filteredData = filteredData.filter((token) =>
                token.token.category.toLowerCase().includes(filters.categorySearch.toLowerCase())
            );
        }

        // Apply custom sorting for Top tab
        if (filters.activeTab === 'TOP' && filters.sortDirection !== 'none') {
            filteredData.sort((a, b) => {
                let aValue = 0;
                let bValue = 0;

                if (filters.sortOption === 'volumes') {
                    aValue = a.volume24h;
                    bValue = b.volume24h;
                } else if (filters.sortOption === 'txns') {
                    aValue = a.transactions.buyCount + a.transactions.sellCount;
                    bValue = b.transactions.buyCount + b.transactions.sellCount;
                }

                return filters.sortDirection === 'desc' ? bValue - aValue : aValue - bValue;
            });
        }

        return filteredData;
    }, [filters]);

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    const setTimeFilter = useCallback((timeFilter: TimeFilterValue) => {
        setFilters((prev) => ({ ...prev, timeFilter }));
    }, []);

    const setActiveTab = useCallback((activeTab: TokenTableTabOption) => {
        setFilters((prev) => ({ ...prev, activeTab }));
    }, []);

    const setQuickBuyAmount = useCallback((quickBuyAmount: string) => {
        setFilters((prev) => ({ ...prev, quickBuyAmount }));
    }, []);

    const setCategorySearch = useCallback((categorySearch: string) => {
        setFilters((prev) => ({ ...prev, categorySearch }));
    }, []);

    const toggleSort = useCallback((option: SortOption) => {
        setFilters((prev) => {
            if (prev.sortOption === option) {
                // Cycle through: none -> asc -> desc -> none
                const directionCycle: Record<SortDirection, SortDirection> = {
                    none: 'asc',
                    asc: 'desc',
                    desc: 'none',
                };
                return {
                    ...prev,
                    sortDirection: directionCycle[prev.sortDirection],
                };
            } else {
                // New option, start with asc
                return {
                    ...prev,
                    sortOption: option,
                    sortDirection: 'asc',
                };
            }
        });
    }, []);

    const resetFilters = useCallback(() => {
        setFilters({
            timeFilter: '1m',
            activeTab: 'TRENDING',
            quickBuyAmount: '0.1',
            categorySearch: '',
            sortOption: 'volumes',
            sortDirection: 'none',
            favouriteIds: new Set(),
        });
    }, []);

    return {
        table,
        filters,
        setTimeFilter,
        setActiveTab,
        setQuickBuyAmount,
        setCategorySearch,
        toggleSort,
        toggleFavourite,
        resetFilters,
    };
}
