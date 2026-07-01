import { memo, useState } from "react";
import { Filter, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTitle, DialogTrigger, DialogContent, DialogFooter } from "@/components/ui/dialog";
import FilterDialog, { FilterFormData, getFilterRequestBody } from "./FilterDialog";
import { TokenFilterParams } from "../services/filter.service";
import { TokenFilterResponse, SortBy, SortOrder } from "@/types/filter";
import { LoadingSpinner } from "@/components/loading";
import { useApplyTokenFilter } from "../hooks/useTokenFilter";

export interface FilterOptions {
    sort_by?: SortBy;
    sort_order?: SortOrder;
    limit?: number;
    offset?: number;
    time_frame?: string;
}

export interface CategoryFilterValues {
    marketCapMin?: number;
    marketCapMax?: number;
    volumeMin?: number;
    volumeMax?: number;
}

interface FilterButtonProps {
    filterOptions?: FilterOptions;
    /** When true, Apply maps the form's Market Cap/Volume fields onto the category API instead of calling /tokens/filter. */
    isCategory?: boolean;
    /** Which filter fields to show in the dialog. Omit to show every field (default). */
    visibleFields?: (keyof FilterFormData)[];
    onReset?: () => void;
    onApply?: (response: TokenFilterResponse, formData: FilterFormData) => void;
    onApplyCategory?: (values: CategoryFilterValues) => void;
    onError?: (error: Error) => void;
}

const getInitialFormData = (): FilterFormData => ({
    age_min_minutes: 0,
    age_max_minutes: null,
    liquidity_min: 0,
    liquidity_max: null,
    market_cap_min: 0,
    market_cap_max: null,
    volume_24h_min: 0,
    volume_24h_max: null,
    txns_24h_min: 0,
    txns_24h_max: null,
    mint_authority_disabled: false,
    freeze_authority_disabled: false,
    lp_burnt: false,
    has_social_links: false,
    categories: []
});

export const FilterButton = memo<FilterButtonProps>(function FilterButton({
    filterOptions,
    isCategory,
    visibleFields,
    onReset,
    onApply,
    onApplyCategory,
    onError
}) {
    const [formData, setFormData] = useState<FilterFormData>(getInitialFormData());
    const [isOpen, setIsOpen] = useState(false);

    const tokenFilterMutation = useApplyTokenFilter();
    const isLoading = tokenFilterMutation.isPending;

    const hasValidationErrors = (
        [
            [formData.age_min_minutes, formData.age_max_minutes],
            [formData.liquidity_min, formData.liquidity_max],
            [formData.market_cap_min, formData.market_cap_max],
            [formData.volume_24h_min, formData.volume_24h_max],
            [formData.txns_24h_min, formData.txns_24h_max]
        ] as [number, number | null][]
    ).some(([min, max]) => max !== null && min > max);

    const handleFormChange = (data: Partial<FilterFormData>) => {
        setFormData((prev) => ({ ...prev, ...data }));
    };

    const handleReset = () => {
        setFormData(getInitialFormData());
        onReset?.();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Category tab has no /tokens/filter equivalent — map the same form
        // onto the category API's own min/max params instead of calling it.
        if (isCategory) {
            onApplyCategory?.({
                marketCapMin: formData.market_cap_min || undefined,
                marketCapMax: formData.market_cap_max ?? undefined,
                volumeMin: formData.volume_24h_min || undefined,
                volumeMax: formData.volume_24h_max ?? undefined
            });
            toast.success("Filters applied successfully");
            setIsOpen(false);
            return;
        }

        try {
            const requestBody = getFilterRequestBody(formData);
            const params: TokenFilterParams = {
                sort_by: filterOptions?.sort_by,
                sort_order: filterOptions?.sort_order,
                limit: filterOptions?.limit,
                offset: filterOptions?.offset,
                time_frame: filterOptions?.time_frame
            };

            const response = await tokenFilterMutation.mutateAsync({ body: requestBody, params });
            onApply?.(response, formData);
            setIsOpen(false);
        } catch (error) {
            console.error("Filter error:", error);
            onError?.(error instanceof Error ? error : new Error("Failed to apply filters"));
        }
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open && isLoading) return;
                setIsOpen(open);
            }}
        >
            <DialogTrigger asChild>
                <Button variant="ghost" className="flex items-center px-4" aria-label="Open filters">
                    <Filter fill="var(--color-brand-200)" stroke="none" size="1rem" />
                    <span>Filter</span>
                </Button>
            </DialogTrigger>
            <DialogContent aria-describedby="filter-description" showCloseButton={!isLoading}>
                <DialogTitle className="text-brand-200">Filter</DialogTitle>
                <p id="filter-description" className="sr-only">
                    Apply filters to token data
                </p>
                <form onSubmit={handleSubmit}>
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : (
                        <FilterDialog formData={formData} onFormChange={handleFormChange} visibleFields={visibleFields} />
                    )}
                    <DialogFooter>
                        <div className="flex justify-between flex-1">
                            <Button type="button" variant="secondary" onClick={handleReset} disabled={isLoading} aria-label="Reset filters">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Reset
                            </Button>
                            <Button type="submit" disabled={isLoading || hasValidationErrors}>
                                {isLoading ? "Applying..." : "Apply"}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
});
