import { memo, useState } from 'react';
import { Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogTitle,
    DialogTrigger,
    DialogContent,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import FilterDialog, { FilterFormData, getFilterRequestBody } from './FilterDialog';
import { TokenFilterParams, PoolFilterParams } from '../services/filter.service';
import { TokenFilterResponse, PoolFilterResponse, SortBy, PoolSortBy, SortOrder } from '@/types/filter';
import { LoadingSpinner } from '@/components/loading';
import { useApplyTokenFilter, useApplyPoolFilter } from '../hooks/useTokenFilter';

export interface FilterOptions {
    filterType?: 'token' | 'pool';
    sort_by?: SortBy | PoolSortBy;
    sort_order?: SortOrder;
    limit?: number;
    offset?: number;
}

interface FilterButtonProps {
    filterOptions?: FilterOptions;
    onReset?: () => void;
    onApply?: (response: TokenFilterResponse | PoolFilterResponse) => void;
    onError?: (error: Error) => void;
}

const getInitialFormData = (): FilterFormData => ({
    age_min_minutes: '',
    age_max_minutes: '',
    liquidity_min: '',
    liquidity_max: '',
    market_cap_min: '',
    market_cap_max: '',
    volume_24h_min: '',
    volume_24h_max: '',
    txns_24h_min: '',
    txns_24h_max: '',
    mint_authority_disabled: false,
    freeze_authority_disabled: false,
    lp_burnt: false,
    has_social_links: false,
    categories: [],
});

export const FilterButton = memo<FilterButtonProps>(function FilterButton({
    filterOptions,
    onReset,
    onApply,
    onError,
}) {
    const [formData, setFormData] = useState<FilterFormData>(getInitialFormData());
    const [isOpen, setIsOpen] = useState(false);

    const filterType = filterOptions?.filterType || 'token';

    // React Query hooks
    const tokenFilterMutation = useApplyTokenFilter();
    const poolFilterMutation = useApplyPoolFilter();

    const isLoading = tokenFilterMutation.isPending || poolFilterMutation.isPending;

    const handleFormChange = (data: Partial<FilterFormData>) => {
        setFormData((prev) => ({ ...prev, ...data }));
    };

    const handleReset = () => {
        setFormData(getInitialFormData());
        onReset?.();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const requestBody = getFilterRequestBody(formData, filterType);

            if (filterType === 'token') {
                const params: TokenFilterParams = {
                    sort_by: filterOptions?.sort_by as SortBy,
                    sort_order: filterOptions?.sort_order,
                    limit: filterOptions?.limit,
                    offset: filterOptions?.offset,
                };

                const response = await tokenFilterMutation.mutateAsync({ body: requestBody, params });
                onApply?.(response);
            } else {
                const params: PoolFilterParams = {
                    sort_by: filterOptions?.sort_by as PoolSortBy,
                    sort_order: filterOptions?.sort_order,
                    limit: filterOptions?.limit,
                    offset: filterOptions?.offset,
                };

                const response = await poolFilterMutation.mutateAsync({ body: requestBody, params });
                onApply?.(response);
            }

            setIsOpen(false);
        } catch (error) {
            console.error('Filter error:', error);
            onError?.(error instanceof Error ? error : new Error('Failed to apply filters'));
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex items-center px-4"
                    aria-label="Open filters"
                >
                    <Filter fill="var(--color-brand-200)" stroke="none" size="1rem" />
                    <span>Filter</span>
                </Button>
            </DialogTrigger>
            <DialogContent aria-describedby="filter-description">
                <DialogTitle className="text-brand-200">Filter</DialogTitle>
                <p id="filter-description" className="sr-only">
                    Apply filters to {filterType} data
                </p>
                <form onSubmit={handleSubmit}>
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : (
                        <FilterDialog
                            filterType={filterType}
                            formData={formData}
                            onFormChange={handleFormChange}
                        />
                    )}
                    <DialogFooter>
                        <div className="flex justify-between flex-1">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleReset}
                                disabled={isLoading}
                                aria-label="Reset filters"
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Reset
                            </Button>
                            <DialogClose asChild>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? 'Applying...' : 'Apply'}
                                </Button>
                            </DialogClose>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
});
