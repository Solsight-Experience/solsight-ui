import { useMemo, useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCoreRowModel, getSortedRowModel, getPaginationRowModel, SortingState, PaginationState, useReactTable } from "@tanstack/react-table";
import { categoryColumns } from "../config/categoryColumns";
import { TokenDiscoveryService } from "../services/token-discovery.service";
import { queryKeys } from "@/lib/react-query-keys";

interface CategoryApiItem {
    id?: string;
    name?: string;
    slug?: string;
    content?: string;
    description?: string;
    market_cap?: number;
    market_cap_change_24h?: number;
    volume_24h?: number;
    volume?: number;
    top_3_coins_id?: string[];
    top_3_coins?: string[];
    top_tokens?: string[];
    updated_at?: string;
}

interface CategoryApiResponse {
    categories?: CategoryApiItem[];
    data?: CategoryApiItem[];
    total?: number;
}

interface UseCategoryTableOptions {
    searchQuery?: string;
}

export function useCategoryTable({ searchQuery = "" }: UseCategoryTableOptions = {}) {
    const queryClient = useQueryClient();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 7
    });

    // Debounce search query 300ms trước khi gọi API
    const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        };
    }, [searchQuery]);

    // Reset pagination khi search thay đổi
    useEffect(() => {
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, [debouncedSearch]);

    // Fetch categories from API
    const {
        data: apiData,
        isLoading,
        error
    } = useQuery({
        queryKey: [...queryKeys.tokens.categories(), pagination.pageIndex, pagination.pageSize, debouncedSearch],
        queryFn: () =>
            TokenDiscoveryService.getCategories({
                limit: pagination.pageSize,
                offset: pagination.pageIndex * pagination.pageSize,
                name: debouncedSearch || undefined
            }),
        staleTime: 30000,
        refetchInterval: 300000
    });

    // Prefetch next page
    useEffect(() => {
        const rawArray = Array.isArray(apiData) ? apiData : (apiData as CategoryApiResponse)?.categories || (apiData as CategoryApiResponse)?.data || [];
        if (apiData && rawArray.length >= pagination.pageSize) {
            queryClient.prefetchQuery({
                queryKey: [...queryKeys.tokens.categories(), pagination.pageIndex + 1, pagination.pageSize, debouncedSearch],
                queryFn: () =>
                    TokenDiscoveryService.getCategories({
                        limit: pagination.pageSize,
                        offset: (pagination.pageIndex + 1) * pagination.pageSize,
                        name: debouncedSearch || undefined
                    })
            });
        }
    }, [apiData, pagination.pageIndex, pagination.pageSize, debouncedSearch, queryClient]);

    const data = useMemo(() => {
        const rawArray = Array.isArray(apiData) ? apiData : (apiData as CategoryApiResponse)?.categories || (apiData as CategoryApiResponse)?.data || [];

        if (!rawArray || rawArray.length === 0) return [];

        return rawArray.map((cat: CategoryApiItem) => ({
            id: cat.id || "",
            name: cat.name || "",
            slug: cat.id || cat.slug || "",
            content: cat.content || cat.description || "",
            market_cap: cat.market_cap || 0,
            market_cap_change_24h: cat.market_cap_change_24h ?? 0,
            volume_24h: cat.volume_24h ?? cat.volume ?? 0,
            top_3_coins_id: cat.top_3_coins_id || [],
            top_3_coins: cat.top_3_coins || cat.top_tokens || [],
            updated_at: cat.updated_at || ""
        }));
    }, [apiData]);

    const pageCount = useMemo(() => {
        const total = (apiData as CategoryApiResponse)?.total || -1;
        if (total !== -1) {
            return Math.ceil(total / pagination.pageSize);
        }

        // If we don't have a total and we get back less than pageSize, we're on the last page
        const rawArray = Array.isArray(apiData) ? apiData : (apiData as CategoryApiResponse)?.categories || (apiData as CategoryApiResponse)?.data || [];
        if (rawArray.length < pagination.pageSize) {
            return pagination.pageIndex + 1;
        }

        // Default page count if we don't know
        return -1;
    }, [apiData, pagination.pageIndex, pagination.pageSize]);

    const table = useReactTable({
        data,
        columns: categoryColumns,
        state: {
            sorting,
            pagination
        },
        manualPagination: true,
        pageCount,
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel()
    });

    return {
        table,
        isLoading,
        error
    };
}
