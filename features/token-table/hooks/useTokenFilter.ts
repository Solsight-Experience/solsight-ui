'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { filterService, TokenFilterParams, PoolFilterParams } from '../services/filter.service';
import { TokenFilterRequest, TokenFilterResponse, PoolFilterRequest, PoolFilterResponse } from '@/types/filter';
import { toast } from 'sonner';

/**
 * Hook to fetch categories
 * Categories are cached indefinitely as they rarely change
 */
export function useCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: () => filterService.getCategories(),
        staleTime: Infinity,
        gcTime: Infinity,
    });
}

/**
 * Hook to apply token filters
 */
export function useApplyTokenFilter() {
    return useMutation({
        mutationFn: ({ body, params }: { body: TokenFilterRequest; params?: TokenFilterParams }) =>
            filterService.filterTokens(body, params),
        onSuccess: () => {
            toast.success('Filters applied successfully');
        },
        onError: (error: unknown) => {
            if (error && typeof error === 'object' && 'response' in error) {
                const resp = (error as any).response;
                if (resp?.data?.message) {
                    toast.error(resp.data.message);
                    return;
                }
            }
            toast.error('Failed to apply filters');
        },
    });
}

/**
 * Hook to apply pool filters
 */
export function useApplyPoolFilter() {
    return useMutation({
        mutationFn: ({ body, params }: { body: PoolFilterRequest; params?: PoolFilterParams }) =>
            filterService.filterPools(body, params),
        onSuccess: () => {
            toast.success('Filters applied successfully');
        },
        onError: (error: unknown) => {
            if (error && typeof error === 'object' && 'response' in error) {
                const resp = (error as any).response;
                if (resp?.data?.message) {
                    toast.error(resp.data.message);
                    return;
                }
            }
            toast.error('Failed to apply filters');
        },
    });
}

/**
 * Hook for search with filters (combines search_query with filter options)
 * Used by SearchDialog to perform search with optional filters
 */
export function useSearchWithFilters() {
    const searchTokens = useMutation({
        mutationFn: ({ 
            searchQuery, 
            filters, 
            params 
        }: { 
            searchQuery?: string; 
            filters?: TokenFilterRequest; 
            params?: TokenFilterParams 
        }) => {
            const body: TokenFilterRequest = { ...filters };
            if (searchQuery?.trim()) {
                body.search_query = searchQuery.trim();
            }
            return filterService.filterTokens(body, params);
        },
        onError: (error: unknown) => {
            if (error && typeof error === 'object' && 'response' in error) {
                const resp = (error as any).response;
                if (resp?.data?.message) {
                    toast.error(resp.data.message);
                    return;
                }
            }
            toast.error('Search failed');
        },
    });

    const searchPools = useMutation({
        mutationFn: ({ 
            searchQuery, 
            filters, 
            params 
        }: { 
            searchQuery?: string; 
            filters?: PoolFilterRequest; 
            params?: PoolFilterParams 
        }) => {
            const body: PoolFilterRequest = { ...filters };
            if (searchQuery?.trim()) {
                body.search_query = searchQuery.trim();
            }
            return filterService.filterPools(body, params);
        },
        onError: (error: unknown) => {
            if (error && typeof error === 'object' && 'response' in error) {
                const resp = (error as any).response;
                if (resp?.data?.message) {
                    toast.error(resp.data.message);
                    return;
                }
            }
            toast.error('Search failed');
        },
    });

    return {
        searchTokens: searchTokens.mutateAsync,
        searchPools: searchPools.mutateAsync,
        isSearchingTokens: searchTokens.isPending,
        isSearchingPools: searchPools.isPending,
        tokenSearchError: searchTokens.error,
        poolSearchError: searchPools.error,
    };
}

/**
 * Combined hook for filter operations
 * Returns all filter-related queries and mutations
 */
export function useTokenFilter() {
    const categories = useCategories();
    const applyTokenFilter = useApplyTokenFilter();
    const applyPoolFilter = useApplyPoolFilter();
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

        // Pool filter mutation
        applyPoolFilter: applyPoolFilter.mutate,
        applyPoolFilterAsync: applyPoolFilter.mutateAsync,
        isApplyingPoolFilter: applyPoolFilter.isPending,
        poolFilterData: applyPoolFilter.data,
        poolFilterError: applyPoolFilter.error,

        // Search with filters
        searchTokens: search.searchTokens,
        searchPools: search.searchPools,
        isSearchingTokens: search.isSearchingTokens,
        isSearchingPools: search.isSearchingPools,
        tokenSearchError: search.tokenSearchError,
        poolSearchError: search.poolSearchError,
    };
}
