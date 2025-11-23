import { useState, useCallback, useMemo } from 'react';
import { getCoreRowModel, useReactTable, SortingState, getSortedRowModel } from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { TimeFilterValue } from '../components/TimeFilters';
import { TokenTableTabOption } from '../components/TokenTabs';
import { SortOption, SortDirection } from '../components/SortPanel';
import { createColumns } from '../config/columns';
import { TokenDiscoveryService, SortBy, TimeFrame } from '../services/token-discovery.service';
import { transformTokenOverviews } from '../utils/transform';
import { queryKeys } from '@/lib/react-query-keys';

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

    // Map time filter to API TimeFrame
    const mapTimeFilterToTimeFrame = (timeFilter: TimeFilterValue): TimeFrame => {
        switch (timeFilter) {
            case '1h':
                return '1h';
            case '1m':
            case '5m':
            case '30m':
            default:
                return '24h';
        }
    };

    // Map sort option to API SortBy
    const mapSortOptionToSortBy = (sortOption: SortOption): SortBy => {
        switch (sortOption) {
            case 'volumes':
                return 'volume_24h';
            case 'txns':
                return 'txns_24h';
            default:
                return 'volume_24h';
        }
    };

    // Fetch tokens based on active tab
    const { data: apiData, isLoading, error } = useQuery({
        queryKey: queryKeys.tokens.trending({
            tab: filters.activeTab,
            timeFrame: mapTimeFilterToTimeFrame(filters.timeFilter),
            sortBy: mapSortOptionToSortBy(filters.sortOption),
        }),
        queryFn: async () => {
            const timeFrame = mapTimeFilterToTimeFrame(filters.timeFilter);
            
            switch (filters.activeTab) {
                case 'TRENDING':
                    return TokenDiscoveryService.getTrending({
                        time_frame: timeFrame,
                        sort_by: 'volume_24h',
                        limit: 100,
                    });
                
                case 'TOP':
                    return TokenDiscoveryService.getTrending({
                        time_frame: timeFrame,
                        sort_by: mapSortOptionToSortBy(filters.sortOption),
                        limit: 100,
                    });
                
                case 'CATEGORIES':
                case 'FAVOURITES':
                default:
                    // For categories and favourites, still fetch trending data
                    // and filter client-side
                    return TokenDiscoveryService.getTrending({
                        time_frame: timeFrame,
                        limit: 100,
                    });
            }
        },
        staleTime: 30000, // 30 seconds
        refetchInterval: 60000, // Refetch every minute
    });

    // Process and filter data
    const data = useMemo(() => {
        if (!apiData?.tokens) return [];

        let transformedData = transformTokenOverviews(apiData.tokens);

        // Filter by favourites
        if (filters.activeTab === 'FAVOURITES') {
            transformedData = transformedData.filter((token) => filters.favouriteIds.has(token.id));
        }

        // Filter by category search
        if (filters.categorySearch && filters.activeTab === 'CATEGORIES') {
            transformedData = transformedData.filter((token) =>
                token.token.category.toLowerCase().includes(filters.categorySearch.toLowerCase())
            );
        }

        // Apply custom sorting for Top tab
        if (filters.activeTab === 'TOP' && filters.sortDirection !== 'none') {
            transformedData.sort((a, b) => {
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

        return transformedData;
    }, [apiData, filters]);

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
        isLoading,
        error,
    };
}
