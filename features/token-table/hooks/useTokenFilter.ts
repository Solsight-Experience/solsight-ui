"use client";

import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { filterService, TokenFilterParams } from "../services/filter.service";
import { TokenFilterRequest, SortOrder } from "@/types/filter";
import { queryKeys } from "@/lib/react-query-keys";
import { toast } from "sonner";

/**
 * Hook to fetch categories
 * Categories are cached indefinitely as they rarely change
 */
export function useCategories() {
    return useQuery({
        queryKey: ["categories"],
        queryFn: () => filterService.getCategories(),
        staleTime: Infinity,
        gcTime: Infinity
    });
}

const CATEGORY_NAMES_PAGE_SIZE = 20;

/**
 * Hook to search categories by name for the Category filter tab, paginated
 */
export function useCategoryNames({ name, sortOrder = "asc" }: { name?: string; sortOrder?: SortOrder } = {}) {
    return useInfiniteQuery({
        queryKey: queryKeys.tokens.categoryNames({ name, sortOrder }),
        queryFn: ({ pageParam }) => filterService.getCategoryNames({ name, sort_order: sortOrder, limit: CATEGORY_NAMES_PAGE_SIZE, offset: pageParam }),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            const loaded = allPages.reduce((sum, page) => sum + page.data.length, 0);
            return loaded < lastPage.total ? loaded : undefined;
        },
        staleTime: 60_000
    });
}

/**
 * Hook to apply token filters
 */
export function useApplyTokenFilter() {
    return useMutation({
        mutationFn: ({ body, params }: { body: TokenFilterRequest; params?: TokenFilterParams }) => filterService.filterTokens(body, params),
        onSuccess: () => {
            toast.success("Filters applied successfully");
        },
        onError: (error: unknown) => {
            if (error && typeof error === "object" && "response" in error) {
                const resp = (error as { response?: { data?: { message?: string } } }).response;
                if (resp?.data?.message) {
                    toast.error(resp.data.message);
                    return;
                }
            }
            toast.error("Failed to apply filters");
        }
    });
}

/**
 * Hook to apply filters scoped to the user's favorited tokens only
 */
export function useApplyFavoritesFilter() {
    return useMutation({
        mutationFn: ({ body, params }: { body: TokenFilterRequest; params?: TokenFilterParams }) => filterService.filterFavorites(body, params),
        onSuccess: () => {
            toast.success("Filters applied successfully");
        },
        onError: (error: unknown) => {
            if (error && typeof error === "object" && "response" in error) {
                const resp = (error as { response?: { data?: { message?: string } } }).response;
                if (resp?.data?.message) {
                    toast.error(resp.data.message);
                    return;
                }
            }
            toast.error("Failed to apply filters");
        }
    });
}

/**
 * Hook for search with filters (combines search_query with filter options)
 * Used by SearchDialog to perform search with optional filters
 */
export function useSearchWithFilters() {
    const searchTokens = useMutation({
        mutationFn: ({ searchQuery, filters, params }: { searchQuery?: string; filters?: TokenFilterRequest; params?: TokenFilterParams }) => {
            const body: TokenFilterRequest = { ...filters };
            if (searchQuery?.trim()) {
                body.search_query = searchQuery.trim();
            }
            return filterService.filterTokens(body, params);
        },
        onError: (error: unknown) => {
            if (error && typeof error === "object" && "response" in error) {
                const resp = (error as { response?: { data?: { message?: string } } }).response;
                if (resp?.data?.message) {
                    toast.error(resp.data.message);
                    return;
                }
            }
            toast.error("Search failed");
        }
    });

    return {
        searchTokens: searchTokens.mutateAsync,
        isSearchingTokens: searchTokens.isPending,
        tokenSearchError: searchTokens.error
    };
}

/**
 * Combined hook for filter operations
 * Returns all filter-related queries and mutations
 */
export function useTokenFilter() {
    const categories = useCategories();
    const applyTokenFilter = useApplyTokenFilter();
    const search = useSearchWithFilters();

    return {
        // Categories query
        categories: categories.data?.categories ?? [],
        isCategoriesLoading: categories.isLoading,
        categoriesError: categories.error,

        // Token filter mutation
        applyTokenFilter: applyTokenFilter.mutate,
        applyTokenFilterAsync: applyTokenFilter.mutateAsync,
        isApplyingTokenFilter: applyTokenFilter.isPending,
        tokenFilterData: applyTokenFilter.data,
        tokenFilterError: applyTokenFilter.error,

        // Search with filters
        searchTokens: search.searchTokens,
        isSearchingTokens: search.isSearchingTokens,
        tokenSearchError: search.tokenSearchError
    };
}
