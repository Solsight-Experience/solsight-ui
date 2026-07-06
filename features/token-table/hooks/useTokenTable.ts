import { useState, useCallback, useMemo, useEffect } from "react";
import { getCoreRowModel, useReactTable, SortingState, getSortedRowModel } from "@tanstack/react-table";
import { useInfiniteQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { TimeFilterValue } from "../components/TimeFilters";
import { TokenTableTabOption } from "../components/TokenTabs";
import { SortOption, SortDirection } from "../components/SortPanel";
import { createColumns } from "../config/columns";
import type { TokenTableData } from "../config/types";
import { TokenDiscoveryService, SortBy, TimeFrame, CategorySortBy, CategorySortOrder } from "../services/token-discovery.service";
import { transformTokenOverviews } from "../utils/transform";
import { queryKeys } from "@/lib/react-query-keys";
import { useFavoriteTokens, useToggleFavorite } from "@/features/token/hooks/token.hooks";
import type { TokenFilterResponse } from "@/types/filter";
import type { TrendingResponse } from "../services/token-discovery.service";
import useSettingsStore from "@/stores/settings.store";

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
    categoryMarketCapMin: number | null;
    categoryMarketCapMax: number | null;
    categoryVolumeMin: number | null;
    categoryVolumeMax: number | null;
    categorySortBy: CategorySortBy;
    categorySortOrder: CategorySortOrder;
}

type CategoryFilterFields = Pick<
    TokenTableFilters,
    "categoryMarketCapMin" | "categoryMarketCapMax" | "categoryVolumeMin" | "categoryVolumeMax" | "categorySortBy" | "categorySortOrder"
>;

const DEFAULT_CATEGORY_FILTERS: CategoryFilterFields = {
    categoryMarketCapMin: null,
    categoryMarketCapMax: null,
    categoryVolumeMin: null,
    categoryVolumeMax: null,
    categorySortBy: "market_cap",
    categorySortOrder: "desc"
};

export function useTokenTable(onQuickBuy?: (token: TokenTableData) => void) {
    const { user } = useAuth();
    const isLoggedIn = !!user;
    const defaultQuickBuyAmount = useSettingsStore((state) => state.defaultQuickBuyAmount);
    const [filters, setFilters] = useState<TokenTableFilters>(() => ({
        timeFilter: "24h",
        activeTab: "TRENDING",
        quickBuyAmount: useSettingsStore.getState().defaultQuickBuyAmount,
        categorySearch: "",
        selectedCategorySlug: null,
        sortOption: "volumes",
        sortDirection: "none",
        favouriteIds: new Set(),
        filteredData: undefined,
        ...DEFAULT_CATEGORY_FILTERS
    }));

    const [sorting, setSorting] = useState<SortingState>([]);

    // Fetch favorites from backend — only when logged in
    const { data: favoritesData, isPending: isFavoritesLoading } = useFavoriteTokens();

    const favoritesTokens = useMemo(() => {
        if (!favoritesData || !Array.isArray(favoritesData)) return [];
        return favoritesData.map((fav) => fav.token).filter((t): t is NonNullable<typeof t> => t !== null);
    }, [favoritesData]);

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

    useEffect(() => {
        setFilters((prev) => ({ ...prev, quickBuyAmount: defaultQuickBuyAmount }));
    }, [defaultQuickBuyAmount]);

    // Mutation for toggling favorites
    const toggleFavoriteMutation = useToggleFavorite();

    // Only expose toggleFavourite when the user is authenticated.
    // Passing undefined to createColumns omits the star column entirely.
    const toggleFavourite = useCallback(
        (tokenId: string) => {
            if (!isLoggedIn) {
                toast.info("Sign in to save favourite tokens.");
                return;
            }
            const isFavorite = filters.favouriteIds.has(tokenId);
            toggleFavoriteMutation.mutate({ address: tokenId, isFavorite });
        },
        [isLoggedIn, filters.favouriteIds, toggleFavoriteMutation]
    );

    // Memoize columns — pass undefined for toggleFavourite when not logged in
    const columns = useMemo(
        () => createColumns(isLoggedIn ? toggleFavourite : undefined, filters.favouriteIds, filters.quickBuyAmount, onQuickBuy),
        [isLoggedIn, toggleFavourite, filters.favouriteIds, filters.quickBuyAmount, onQuickBuy]
    );

    const mapTimeFilterToTimeFrame = (timeFilter: TimeFilterValue): TimeFrame => timeFilter;

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
                        sort_by: "txns_24h",
                        limit: PAGE_SIZE,
                        offset
                    });

                case "TOP":
                    return TokenDiscoveryService.getTrending({
                        time_frame: timeFrame,
                        sort_by: "volume_24h",
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
        // NOTE: filteredData=[] (empty array) means filter is active but returned no results —
        // must NOT fall through to apiData/favoritesTokens, otherwise the full unfiltered list shows instead.
        if (filters.filteredData !== undefined) {
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

        if (filters.activeTab === "FAVOURITES") {
            return transformTokenOverviews(favoritesTokens);
        }

        if (!apiData?.tokens) return [];

        let transformedData = transformTokenOverviews(apiData.tokens);

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
    }, [apiData, filters, favoritesTokens]);

    const applyFilterResults = useCallback((filterResponse: TokenFilterResponse | null) => {
        if (!filterResponse) {
            setFilters((prev) => ({ ...prev, filteredData: undefined }));
            return;
        }
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
            setFilters((prev) => ({
                ...prev,
                activeTab,
                selectedCategorySlug: null,
                categorySearch: "",
                filteredData: undefined,
                ...DEFAULT_CATEGORY_FILTERS
            }));
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

    const setCategoryFilters = useCallback((values: Partial<CategoryFilterFields>) => {
        setFilters((prev) => ({ ...prev, ...values }));
    }, []);

    const resetCategoryFilters = useCallback(() => {
        setFilters((prev) => ({ ...prev, ...DEFAULT_CATEGORY_FILTERS }));
    }, []);

    // Unlike resetFilters(), this stays on the Favourites tab — it only clears the applied filter.
    const resetFavouritesFilters = useCallback(() => {
        setFilters((prev) => ({ ...prev, filteredData: undefined }));
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
            timeFilter: "24h",
            activeTab: "TRENDING",
            quickBuyAmount: useSettingsStore.getState().defaultQuickBuyAmount,
            categorySearch: "",
            selectedCategorySlug: null,
            sortOption: "volumes",
            sortDirection: "none",
            // Preserve favouriteIds — they are synced from the server,
            // not a UI filter, and should not be wiped on reset.
            favouriteIds: prev.favouriteIds,
            filteredData: undefined,
            ...DEFAULT_CATEGORY_FILTERS
        }));
    }, []);

    const isFavouritesTab = filters.activeTab === "FAVOURITES";
    const isFilteredResults = filters.filteredData != null; // true even when empty — prevents infinite scroll in filter mode
    const canLoadMore = !isFavouritesTab && !isFilteredResults && hasNextPage;

    return {
        table,
        filters,
        setTimeFilter,
        setActiveTab,
        setQuickBuyAmount,
        setCategorySearch,
        setCategoryFilters,
        resetCategoryFilters,
        resetFavouritesFilters,
        setSelectedCategorySlug,
        toggleSort,
        toggleFavourite,
        resetFilters,
        applyFilterResults,
        isLoading: filters.activeTab === "FAVOURITES" ? isFavoritesLoading : isPending,
        isFetching,
        isFetchingNextPage: canLoadMore ? isFetchingNextPage : false,
        fetchNextPage,
        hasNextPage: canLoadMore,
        error,
        dataUpdatedAt,
        refetch
    };
}
