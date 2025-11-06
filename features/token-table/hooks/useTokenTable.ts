import { useState, useCallback, useMemo } from 'react';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { TimeFilterValue } from '../components/TimeFilters';
import { TokenTableTabOption } from '../components/TokenTabs';
import columns from '../config/columns';
import { mockTokenData } from '../config/mock-data';
import { TokenTableData } from '../config/types';

export interface TokenTableFilters {
    timeFilter: TimeFilterValue;
    activeTab: TokenTableTabOption;
    quickBuyAmount: string;
}

export function useTokenTable() {
    const [filters, setFilters] = useState<TokenTableFilters>({
        timeFilter: '1m',
        activeTab: 'TRENDING',
        quickBuyAmount: '0.1',
    });

    // TODO: Replace with actual API call
    const data = useMemo(() => mockTokenData, []);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
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

    const resetFilters = useCallback(() => {
        setFilters({
            timeFilter: '1m',
            activeTab: 'TRENDING',
            quickBuyAmount: '0.1',
        });
    }, []);

    return {
        table,
        filters,
        setTimeFilter,
        setActiveTab,
        setQuickBuyAmount,
        resetFilters,
    };
}
