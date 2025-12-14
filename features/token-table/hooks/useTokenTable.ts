import { useState, useCallback, useMemo, useEffect } from 'react';
import { getCoreRowModel, useReactTable, SortingState, getSortedRowModel } from '@tanstack/react-table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TimeFilterValue } from '../components/TimeFilters';
import { TokenTableTabOption } from '../components/TokenTabs';
import { SortOption, SortDirection } from '../components/SortPanel';
import { createColumns } from '../config/columns';
import { TokenDiscoveryService, SortBy, TimeFrame } from '../services/token-discovery.service';
import { transformTokenOverviews } from '../utils/transform';
import { queryKeys } from '@/lib/react-query-keys';
import { apiClient } from '@/lib/api-client';
import { USER_ENDPOINTS } from '@/lib/constants';

export interface TokenTableFilters {
    timeFilter: TimeFilterValue;
    activeTab: TokenTableTabOption;
    quickBuyAmount: string;
    categorySearch: string;
    sortOption: SortOption;
    sortDirection: SortDirection;
    favouriteIds: Set<string>;
    filteredData?: any[]; // Store filtered results from API
}

export function useTokenTable() {
    const queryClient = useQueryClient();
    const [filters, setFilters] = useState<TokenTableFilters>({
        timeFilter: '1m',
        activeTab: 'TRENDING',
        quickBuyAmount: '0.1',
        categorySearch: '',
        sortOption: 'volumes',
        sortDirection: 'none',
        favouriteIds: new Set(),
        filteredData: undefined,
    });

    const [sorting, setSorting] = useState<SortingState>([]);

    // Fetch favorites from backend
    const { data: favoritesData } = useQuery({
        queryKey: queryKeys.user.favorites(),
        queryFn: async () => {
            try {
                const response = await apiClient.get<Array<{ token_address: string }>>(USER_ENDPOINTS.FAVORITES);
                return response;
            } catch (error) {
                console.error('Failed to fetch favorites:', error);
                return [];
            }
        },
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    // Update local favorites when backend data changes
    useEffect(() => {
        if (favoritesData && Array.isArray(favoritesData)) {
            const favoriteIds = new Set(favoritesData.map((fav) => fav.token_address));
            setFilters((prev) => ({ ...prev, favouriteIds: favoriteIds }));
        }
    }, [favoritesData]);

    // Mutation for toggling favorites
    const toggleFavoriteMutation = useMutation({
        mutationFn: async ({ tokenId, isFavorite }: { tokenId: string; isFavorite: boolean }) => {
            if (isFavorite) {
                // Remove from favorites
                return apiClient.delete(`${USER_ENDPOINTS.FAVORITES}/${tokenId}`);
            } else {
                // Add to favorites
                return apiClient.post(USER_ENDPOINTS.FAVORITES, { token_address: tokenId });
            }
        },
        onMutate: async ({ tokenId, isFavorite }) => {
            // Optimistic update
            await queryClient.cancelQueries({ queryKey: queryKeys.user.favorites() });
            
            const previousFavorites = queryClient.getQueryData(queryKeys.user.favorites());
            
            // Update local state immediately
            setFilters((prev) => {
                const newFavourites = new Set(prev.favouriteIds);
                if (isFavorite) {
                    newFavourites.delete(tokenId);
                } else {
                    newFavourites.add(tokenId);
                }
                return { ...prev, favouriteIds: newFavourites };
            });
            
            return { previousFavorites };
        },
        onError: (err, variables, context) => {
            // Revert on error
            if (context?.previousFavorites) {
                queryClient.setQueryData(queryKeys.user.favorites(), context.previousFavorites);
            }
            console.error('Failed to toggle favorite:', err);
        },
        onSettled: () => {
            // Refetch to ensure sync with backend
            queryClient.invalidateQueries({ queryKey: queryKeys.user.favorites() });
        },
    });

    const toggleFavourite = useCallback((tokenId: string) => {
        const isFavorite = filters.favouriteIds.has(tokenId);
        toggleFavoriteMutation.mutate({ tokenId, isFavorite });
    }, [filters.favouriteIds, toggleFavoriteMutation]);

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
                        limit: 20,
                    });
                
                case 'TOP':
                    return TokenDiscoveryService.getTrending({
                        time_frame: timeFrame,
                        sort_by: mapSortOptionToSortBy(filters.sortOption),
                        limit: 20,
                    });
                
                case 'CATEGORIES':
                case 'FAVOURITES':
                default:
                    // For categories and favourites, still fetch trending data
                    // and filter client-side
                    return TokenDiscoveryService.getTrending({
                        time_frame: timeFrame,
                        limit: 20,
                    });
            }
        },
        staleTime: 30000, // 30 seconds
        refetchInterval: 60000, // Refetch every minute
    });

    // Process and filter data
    const data = useMemo(() => {
        // If we have filtered data from API, use that instead of regular data
        if (filters.filteredData && filters.filteredData.length > 0) {
            return filters.filteredData;
        }

        if (!apiData?.tokens) return [];

        let transformedData = transformTokenOverviews(apiData.tokens);

        // Filter by favourites
        if (filters.activeTab === 'FAVOURITES') {
            console.log('Filtering favorites - Total tokens:', transformedData.length);
            console.log('Favorite IDs:', Array.from(filters.favouriteIds));
            transformedData = transformedData.filter((token) => {
                const isFavorite = filters.favouriteIds.has(token.id);
                if (isFavorite) {
                    console.log('Found favorite token:', token.id, token.token.symbol);
                }
                return isFavorite;
            });
            console.log('Filtered favorites count:', transformedData.length);
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

    // Add function to apply filter results
    const applyFilterResults = useCallback((filterResponse: any) => {
        if ('tokens' in filterResponse) {
            // Transform the filtered tokens to match our table format
            const transformedFilteredData = transformTokenOverviews(filterResponse.tokens);
            setFilters(prev => ({ ...prev, filteredData: transformedFilteredData }));
        } else if ('pools' in filterResponse) {
            // Handle pool filtering if needed
            console.log('Pool filtering not yet implemented');
        }
    }, []);

    // Add function to clear filters and return to normal data
    const clearAppliedFilters = useCallback(() => {
        setFilters(prev => ({ ...prev, filteredData: undefined }));
    }, []);

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
            filteredData: undefined,
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
        applyFilterResults,
        isLoading,
        error,
    };
}
