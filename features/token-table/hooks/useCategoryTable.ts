import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { categoryColumns } from "../config/categoryColumns";
import { TokenDiscoveryService } from "../services/token-discovery.service";
import { queryKeys } from "@/lib/react-query-keys";

interface UseCategoryTableOptions {
    searchQuery?: string;
}

export function useCategoryTable({ searchQuery = "" }: UseCategoryTableOptions = {}) {
    // Fetch categories from API
    const {
        data: apiData,
        isLoading,
        error
    } = useQuery({
        queryKey: queryKeys.tokens.categories(),
        queryFn: () => TokenDiscoveryService.getCategories(),
        staleTime: 30000, // 30 seconds - shorter to ensure fresher data
        refetchInterval: 300000 // Refetch every 5 minutes
    });

    // Filter categories based on search query
    const data = useMemo(() => {
        console.log("Helo");
        if (!apiData?.categories) return [];

        if (!searchQuery) return apiData.categories;

        return apiData.categories.filter(
            (category) => category.name.toLowerCase().includes(searchQuery.toLowerCase()) // ||
            //category.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
            //category.description.toLowerCase().includes(searchQuery.toLowerCase())
        ); // Limit to top 20 results
    }, [apiData, searchQuery]);

    const table = useReactTable({
        data: data, // Limit to top 20 results
        columns: categoryColumns,
        getCoreRowModel: getCoreRowModel()
    });

    return {
        table,
        isLoading,
        error
    };
}
