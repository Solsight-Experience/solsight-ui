import { useState, useCallback, useMemo, useEffect } from "react";
import { getCoreRowModel, useReactTable, SortingState, getSortedRowModel } from "@tanstack/react-table";
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { TimeFilterValue } from "../components/TimeFilters";
import { TokenTableTabOption } from "../components/TokenTabs";
import { SortOption, SortDirection } from "../components/SortPanel";
import { createColumns } from "../config/columns";
import type { TokenTableData } from "../config/types";
import { TokenDiscoveryService, SortBy, TimeFrame } from "../services/token-discovery.service";
import { transformTokenOverviews } from "../utils/transform";
import { queryKeys } from "@/lib/react-query-keys";
import { apiClient } from "@/lib/api-client";
import { USER_ENDPOINTS } from "@/lib/constants";
import type { TokenFilterResponse } from "@/types/filter";
import type { TrendingResponse } from "../services/token-discovery.service";

const PAGE_SIZE = 20;

type TokenPage = Pick<TrendingResponse, "tokens" | "total">;

function resolveNextPageParam(lastPage: TokenPage | undefined, allPages: TokenPage[], activeTab: TokenTableTabOption): number | undefined {
    // Favourites filter client-side from trending data — never paginate.
    if (activeTab === "FAVOURITES") return undefined;

    const lastTokens = lastPage?.tokens;
    if (!lastTokens?.length) return undefined;
    if (lastTokens.length < PAGE_SIZE) return undefined;

    // Stop when the API repeats tokens from earlier pages (offset past end).
    if (allPages.length > 1) {
        const seen = new Set(allPages.slice(0, -1).flatMap((page) => (page?.tokens ?? []).map((token) => token.address)));
        if (!lastTokens.some((token) => !seen.has(token.address))) return undefined;
    }

    const total = allPages[0]?.total;
    if (total != null && total > 0) {
        const loadedCount = allPages.reduce((acc, page) => acc + (page?.tokens?.length ?? 0), 0);
        if (loadedCount >= total) return undefined;
    }

    return allPages.length;
}

export interface TokenTableFilters {
    timeFilter: TimeFilterValue;
    activeTab: TokenTableTabOption;
    quickBuyAmount: string;
    categorySearch: string;
    selectedCategorySlug: string | null;
    sortOption: SortOption;
    sortDirection: SortDirection;
    favouriteIds: Set<string>;
    filteredData?: TokenTableData[]; // Store filtered results from API
}

export function useTokenTable(onQuickBuy?: (token: TokenTableData) => void) {
    const { user } = useAuth();
    const isLoggedIn = !!user;
    const queryClient = useQueryClient();
    const [filters, setFilters] = useState<TokenTableFilters>({
        timeFilter: "1m",
        activeTab: "TRENDING",
        quickBuyAmount: "0.1",
        categorySearch: "",
        selectedCategorySlug: null,
        sortOption: "volumes",
        sortDirection: "none",
        favouriteIds: new Set(),
        filteredData: undefined
    });

    const [sorting, setSorting] = useState<SortingState>([]);

    // Fetch favorites from backend — only when logged in
    const { data: favoritesData } = useQuery({
        queryKey: queryKeys.user.favorites(),
        queryFn: async () => {
            try {
                const response = await apiClient.get<Array<{ token_address: string }>>(USER_ENDPOINTS.FAVORITES);
                return response;
            } catch (error) {
                console.error("Failed to fetch favorites:", error);
                return [];
            }
        },
        enabled: isLoggedIn,
        staleTime: 5 * 60 * 1000 // Cache for 5 minutes
    });

    // Update local favorites when backend data changes
    useEffect(() => {
        if (favoritesData && Array.isArray(favoritesData)) {
            const favoriteIds = new Set(favoritesData.map((fav) => fav.token_address));
            setFilters((prev) => ({ ...prev, favouriteIds: favoriteIds }));
        }
    }, [favoritesData]);

    // If the user logs out while viewing FAVOURITES, redirect to TRENDING
    useEffect(() => {
        if (!isLoggedIn) {
            setFilters((prev) => ({
                ...prev,
                activeTab: prev.activeTab === "FAVOURITES" ? "TRENDING" : prev.activeTab,
                favouriteIds: new Set()
            }));
        }
    }, [isLoggedIn]);

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
            console.error("Failed to toggle favorite:", err);
        },
        onSettled: () => {
            // Refetch to ensure sync with backend
            queryClient.invalidateQueries({ queryKey: queryKeys.user.favorites() });
        }
    });

    // Only expose toggleFavourite when the user is authenticated.
    // Passing undefined to createColumns omits the star column entirely.
    const toggleFavourite = useCallback(
        (tokenId: string) => {
            if (!isLoggedIn) {
                toast.info("Sign in to save favourite tokens.");
                return;
            }
            const isFavorite = filters.favouriteIds.has(tokenId);
            toggleFavoriteMutation.mutate({ tokenId, isFavorite });
        },
        [isLoggedIn, filters.favouriteIds, toggleFavoriteMutation]
    );

    // Memoize columns — pass undefined for toggleFavourite when not logged in
    const columns = useMemo(
        () => createColumns(isLoggedIn ? toggleFavourite : undefined, filters.favouriteIds, filters.quickBuyAmount, onQuickBuy),
        [isLoggedIn, toggleFavourite, filters.favouriteIds, filters.quickBuyAmount, onQuickBuy]
    );

    // Map time filter to API TimeFrame
    const mapTimeFilterToTimeFrame = (timeFilter: TimeFilterValue): TimeFrame => {
        switch (timeFilter) {
            case "1h":
                return "1h";
            case "1m":
            case "5m":
            case "30m":
            default:
                return "24h";
        }
    };

    // Map sort option to API SortBy
    const mapSortOptionToSortBy = (sortOption: SortOption): SortBy => {
        switch (sortOption) {
            case "volumes":
                return "volume_24h";
            case "txns":
                return "txns_24h";
            default:
                return "volume_24h";
        }
    };

    // Fetch tokens based on active tab — with infinite scroll pagination
    const {
        data: infiniteData,
        isPending,
        isFetching,
        isFetchingNextPage,
        fetchNextPage,
        hasNextPage,
        error,
        dataUpdatedAt,
        refetch
    } = useInfiniteQuery({
        queryKey:
            filters.activeTab === "CATEGORIES" && filters.selectedCategorySlug
                ? [
                      "infinite",
                      ...queryKeys.tokens.categoryDetail(filters.selectedCategorySlug, {
                          timeFrame: mapTimeFilterToTimeFrame(filters.timeFilter),
                          sortBy: mapSortOptionToSortBy(filters.sortOption)
                      })
                  ]
                : [
                      "infinite",
                      ...queryKeys.tokens.trending({
                          tab: filters.activeTab,
                          timeFrame: mapTimeFilterToTimeFrame(filters.timeFilter),
                          sortBy: mapSortOptionToSortBy(filters.sortOption)
                      })
                  ],
        queryFn: async ({ pageParam = 0 }) => {
            const timeFrame = mapTimeFilterToTimeFrame(filters.timeFilter);
            const offset = (pageParam as number) * PAGE_SIZE;

            switch (filters.activeTab) {
                case "TRENDING":
                    return TokenDiscoveryService.getTrending({
                        time_frame: timeFrame,
                        sort_by: "volume_24h",
                        limit: PAGE_SIZE,
                        offset
                    });

                case "TOP":
                    return TokenDiscoveryService.getTrending({
                        time_frame: timeFrame,
                        sort_by: mapSortOptionToSortBy(filters.sortOption),
                        limit: PAGE_SIZE,
                        offset
                    });

                case "CATEGORIES":
                    if (filters.selectedCategorySlug) {
                        const res = await TokenDiscoveryService.getCategoryDetail(filters.selectedCategorySlug, {
                            limit: PAGE_SIZE,
                            offset,
                            sort_by: mapSortOptionToSortBy(filters.sortOption)
                        });
                        return { tokens: res.tokens, total: res.total, updated_at: res.category.updated_at };
                    }
                    return { tokens: [], total: 0, updated_at: "" };

                case "FAVOURITES":
                default:
                    return TokenDiscoveryService.getTrending({
                        time_frame: timeFrame,
                        limit: PAGE_SIZE,
                        offset
                    });
            }
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => resolveNextPageParam(lastPage, allPages, filters.activeTab),
        staleTime: 30000,
        refetchInterval: (query) => {
            const pages = query.state.data?.pages;
            if (!pages?.length) return 60_000;

            const lastPage = pages[pages.length - 1];
            return resolveNextPageParam(lastPage, pages, filters.activeTab) !== undefined ? 60_000 : false;
        }
    });

    // Flatten all pages into a single token array
    const apiData = useMemo(() => {
        if (!infiniteData?.pages?.length) return undefined;
        const allTokens = infiniteData.pages.flatMap((p) => p?.tokens ?? []);
        const firstPage = infiniteData.pages[0];
        return {
            tokens: allTokens,
            total: firstPage?.total ?? 0,
            updated_at: firstPage?.updated_at ?? ""
        };
    }, [infiniteData]);

    // Process and filter data
    const data = useMemo(() => {
        // If we have filtered data from API, use that instead of regular data
        if (filters.filteredData && filters.filteredData.length > 0) {
            if (filters.activeTab === "TOP" && filters.sortDirection !== "none") {
                return [...filters.filteredData].sort((a, b) => {
                    let aValue = 0;
                    let bValue = 0;
                    if (filters.sortOption === "volumes") {
                        aValue = a.volume24h;
                        bValue = b.volume24h;
                    } else if (filters.sortOption === "txns") {
                        aValue = a.transactions.buyCount + a.transactions.sellCount;
                        bValue = b.transactions.buyCount + b.transactions.sellCount;
                    }
                    return filters.sortDirection === "desc" ? bValue - aValue : aValue - bValue;
                });
            }
            return filters.filteredData;
        }

        if (!apiData?.tokens) return [];

        let transformedData = transformTokenOverviews(apiData.tokens);

        // Filter by favourites
        if (filters.activeTab === "FAVOURITES") {
            transformedData = transformedData.filter((token) => filters.favouriteIds.has(token.id));
        }

        // Filter by category search
        if (filters.categorySearch && filters.activeTab === "CATEGORIES") {
            transformedData = transformedData.filter((token) => token.token.category.toLowerCase().includes(filters.categorySearch.toLowerCase()));
        }

        // Apply custom sorting for Top tab
        if (filters.activeTab === "TOP" && filters.sortDirection !== "none") {
            transformedData.sort((a, b) => {
                let aValue = 0;
                let bValue = 0;

                if (filters.sortOption === "volumes") {
                    aValue = a.volume24h;
                    bValue = b.volume24h;
                } else if (filters.sortOption === "txns") {
                    aValue = a.transactions.buyCount + a.transactions.sellCount;
                    bValue = b.transactions.buyCount + b.transactions.sellCount;
                }

                return filters.sortDirection === "desc" ? bValue - aValue : aValue - bValue;
            });
        }

        return transformedData;
    }, [apiData, filters]);

    const applyFilterResults = useCallback((filterResponse: TokenFilterResponse) => {
        const transformedFilteredData = transformTokenOverviews(filterResponse.tokens);
        setFilters((prev) => ({ ...prev, filteredData: transformedFilteredData }));
    }, []);

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel()
    });

    const setTimeFilter = useCallback((timeFilter: TimeFilterValue) => {
        setFilters((prev) => ({ ...prev, timeFilter }));
    }, []);

    const setActiveTab = useCallback(
        (activeTab: TokenTableTabOption) => {
            if (activeTab === "FAVOURITES" && !isLoggedIn) {
                toast.info("Sign in to view your favourite tokens.");
                return;
            }
            setFilters((prev) => ({ ...prev, activeTab, selectedCategorySlug: null }));
        },
        [isLoggedIn]
    );

    const setSelectedCategorySlug = useCallback((selectedCategorySlug: string | null) => {
        setFilters((prev) => ({ ...prev, selectedCategorySlug }));
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
                    none: "asc",
                    asc: "desc",
                    desc: "none"
                };
                return {
                    ...prev,
                    sortDirection: directionCycle[prev.sortDirection]
                };
            } else {
                // New option, start with asc
                return {
                    ...prev,
                    sortOption: option,
                    sortDirection: "asc"
                };
            }
        });
    }, []);

    const resetFilters = useCallback(() => {
        setFilters((prev) => ({
            timeFilter: "1m",
            activeTab: "TRENDING",
            quickBuyAmount: "0.1",
            categorySearch: "",
            selectedCategorySlug: null,
            sortOption: "volumes",
            sortDirection: "none",
            // Preserve favouriteIds — they are synced from the server,
            // not a UI filter, and should not be wiped on reset.
            favouriteIds: prev.favouriteIds,
            filteredData: undefined
        }));
    }, []);

    const isFavouritesTab = filters.activeTab === "FAVOURITES";
    const isFilteredResults = filters.filteredData != null && filters.filteredData.length > 0;
    const canLoadMore = !isFavouritesTab && !isFilteredResults && hasNextPage;

    return {
        table,
        filters,
        setTimeFilter,
        setActiveTab,
        setQuickBuyAmount,
        setCategorySearch,
        setSelectedCategorySlug,
        toggleSort,
        toggleFavourite,
        resetFilters,
        applyFilterResults,
        isLoading: isPending,
        isFetching,
        isFetchingNextPage: canLoadMore ? isFetchingNextPage : false,
        fetchNextPage,
        hasNextPage: canLoadMore,
        error,
        dataUpdatedAt,
        refetch
    };
}
