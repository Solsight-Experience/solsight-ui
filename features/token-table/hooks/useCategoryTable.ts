import { useMemo, useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCoreRowModel, getPaginationRowModel, PaginationState, useReactTable } from "@tanstack/react-table";
import { categoryColumns } from "../config/categoryColumns";
import { TokenDiscoveryService, CategorySortBy, CategorySortOrder } from "../services/token-discovery.service";
import { queryKeys } from "@/lib/react-query-keys";
import { CategoryOverview } from "../config/types";

interface CategoryApiItem {
    id: string;
    name: string;
    content?: string;
    market_cap: number;
    market_cap_change_24h?: number;
    volume_24h?: number;
    top_3_coins_id?: string[];
    top_3_coins?: string[];
    updated_at?: string;
}

interface UseCategoryTableOptions {
    searchQuery?: string;
    marketCapMin?: number | null;
    marketCapMax?: number | null;
    volumeMin?: number | null;
    volumeMax?: number | null;
    sortBy?: CategorySortBy;
    sortOrder?: CategorySortOrder;
}

export function useCategoryTable({
    searchQuery = "",
    marketCapMin,
    marketCapMax,
    volumeMin,
    volumeMax,
    sortBy = "market_cap",
    sortOrder = "desc"
}: UseCategoryTableOptions = {}) {
    const queryClient = useQueryClient();
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

    // Reset pagination khi search hoặc filter/sort thay đổi
    useEffect(() => {
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, [debouncedSearch, marketCapMin, marketCapMax, volumeMin, volumeMax, sortBy, sortOrder]);

    const buildParams = (offset: number) => ({
        limit: pagination.pageSize,
        offset,
        name: debouncedSearch || undefined,
        market_cap_min: marketCapMin ?? undefined,
        market_cap_max: marketCapMax ?? undefined,
        volume_min: volumeMin ?? undefined,
        volume_max: volumeMax ?? undefined,
        sort_by: sortBy,
        sort_order: sortOrder
    });

    // Fetch categories from API
    const {
        data: apiData,
        isLoading,
        error
    } = useQuery({
        queryKey: [
            ...queryKeys.tokens.categories(),
            pagination.pageIndex,
            pagination.pageSize,
            debouncedSearch,
            marketCapMin,
            marketCapMax,
            volumeMin,
            volumeMax,
            sortBy,
            sortOrder
        ],
        queryFn: () => TokenDiscoveryService.getCategories(buildParams(pagination.pageIndex * pagination.pageSize)),
        staleTime: 30000,
        refetchInterval: 300000
    });

    // Prefetch next page
    useEffect(() => {
        if (apiData && apiData.data.length >= pagination.pageSize) {
            const nextOffset = (pagination.pageIndex + 1) * pagination.pageSize;
            queryClient.prefetchQuery({
                queryKey: [
                    ...queryKeys.tokens.categories(),
                    pagination.pageIndex + 1,
                    pagination.pageSize,
                    debouncedSearch,
                    marketCapMin,
                    marketCapMax,
                    volumeMin,
                    volumeMax,
                    sortBy,
                    sortOrder
                ],
                queryFn: () => TokenDiscoveryService.getCategories(buildParams(nextOffset))
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiData, pagination.pageIndex, pagination.pageSize, debouncedSearch, marketCapMin, marketCapMax, volumeMin, volumeMax, sortBy, sortOrder, queryClient]);

    const data = useMemo((): CategoryOverview[] => {
        const rawArray = (apiData?.data ?? []) as CategoryApiItem[];

        return rawArray.map((cat) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.id,
            content: cat.content ?? "",
            market_cap: cat.market_cap,
            market_cap_change_24h: cat.market_cap_change_24h ?? 0,
            volume_24h: cat.volume_24h ?? 0,
            top_3_coins_id: cat.top_3_coins_id ?? [],
            top_3_coins: cat.top_3_coins ?? [],
            updated_at: cat.updated_at ?? ""
        }));
    }, [apiData]);

    const pageCount = useMemo(() => {
        if (!apiData) return -1;
        return Math.ceil(apiData.total / pagination.pageSize);
    }, [apiData, pagination.pageSize]);

    const table = useReactTable({
        data,
        columns: categoryColumns,
        state: {
            pagination
        },
        manualPagination: true,
        pageCount,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel()
    });

    return {
        table,
        isLoading,
        error
    };
}
