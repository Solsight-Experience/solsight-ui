import { memo, useState } from "react";
import { Filter, RefreshCw } from "lucide-react";
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
}

interface FilterButtonProps {
    filterOptions?: FilterOptions;
    onReset?: () => void;
    onApply?: (response: TokenFilterResponse | null, formData: FilterFormData) => void;
    onError?: (error: Error) => void;
}

const getInitialFormData = (): FilterFormData => ({
    mint_authority_disabled: false,
    freeze_authority_disabled: false,
    lp_burnt: false,
    has_social_links: false,
    categories: []
});

export const FilterButton = memo<FilterButtonProps>(function FilterButton({ filterOptions, onReset, onApply, onError }) {
    const [formData, setFormData] = useState<FilterFormData>(getInitialFormData());
    const [isOpen, setIsOpen] = useState(false);

    const tokenFilterMutation = useApplyTokenFilter();
    const isLoading = tokenFilterMutation.isPending;

    const requestBody = getFilterRequestBody(formData);
    const isFormEmpty = Object.keys(requestBody).length === 0;

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
            const requestBody = getFilterRequestBody(formData);

            if (Object.keys(requestBody).length === 0) {
                // If the user hasn't specified any actual filters, we don't call the API.
                onApply?.(null, formData);
                setIsOpen(false);
                return;
            }

            const params: TokenFilterParams = {
                sort_by: filterOptions?.sort_by,
                sort_order: filterOptions?.sort_order,
                limit: filterOptions?.limit,
                offset: filterOptions?.offset
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
                        <FilterDialog formData={formData} onFormChange={handleFormChange} />
                    )}
                    <DialogFooter>
                        <div className="flex justify-between flex-1">
                            <Button type="button" variant="secondary" onClick={handleReset} disabled={isLoading} aria-label="Reset filters">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Reset
                            </Button>
                            <Button type="submit" disabled={isLoading || isFormEmpty}>
                                {isLoading ? "Applying..." : "Apply"}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
});
