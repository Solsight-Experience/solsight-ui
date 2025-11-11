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
 * Combined hook for filter operations
 * Returns all filter-related queries and mutations
 */
export function useTokenFilter() {
    const categories = useCategories();
    const applyTokenFilter = useApplyTokenFilter();
    const applyPoolFilter = useApplyPoolFilter();

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
    };
}
