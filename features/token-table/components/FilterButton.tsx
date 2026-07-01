import { memo, useMemo, useState } from "react";
import { Filter, RefreshCw, SlidersHorizontal } from "lucide-react";
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

interface FilterButtonProps {
    filterOptions?: FilterOptions;
    onReset?: () => void;
    onApply?: (response: TokenFilterResponse, formData: FilterFormData) => void;
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

function countActiveFilters(formData: FilterFormData): number {
    let count = 0;
    if (formData.age_min_minutes || formData.age_max_minutes) count++;
    if (formData.liquidity_min || formData.liquidity_max) count++;
    if (formData.market_cap_min || formData.market_cap_max) count++;
    if (formData.volume_24h_min || formData.volume_24h_max) count++;
    if (formData.txns_24h_min || formData.txns_24h_max) count++;
    if (formData.mint_authority_disabled) count++;
    if (formData.freeze_authority_disabled) count++;
    if (formData.lp_burnt) count++;
    if (formData.has_social_links) count++;
    if (formData.categories.length > 0) count++;
    return count;
}

export const FilterButton = memo<FilterButtonProps>(function FilterButton({ filterOptions, onReset, onApply, onError }) {
    const [formData, setFormData] = useState<FilterFormData>(getInitialFormData());
    const [isOpen, setIsOpen] = useState(false);

    const tokenFilterMutation = useApplyTokenFilter();
    const isLoading = tokenFilterMutation.isPending;

    const activeCount = useMemo(() => countActiveFilters(formData), [formData]);
    const hasActiveFilters = activeCount > 0;

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
                <Button
                    variant="ghost"
                    className="relative flex items-center gap-1.5 px-3 h-8 text-[12px] font-medium
                               text-white/60 hover:text-white/90 hover:bg-violet-500/10
                               border border-transparent hover:border-violet-500/25
                               transition-all duration-200 rounded-lg"
                    aria-label="Open filters"
                >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-violet-400" />
                    <span>Filters</span>
                    {hasActiveFilters && (
                        <span
                            className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full
                                        bg-violet-500 text-white text-[10px] font-bold leading-none"
                        >
                            {activeCount}
                        </span>
                    )}
                </Button>
            </DialogTrigger>

            <DialogContent
                aria-describedby="filter-description"
                showCloseButton={!isLoading}
                className="sm:max-w-[520px] p-0 overflow-hidden border-violet-500/15
                           bg-[#0c1018] shadow-[0_0_0_1px_rgba(139,92,246,0.10),0_24px_64px_rgba(0,0,0,0.6)]"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/[0.05]">
                    <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/25">
                            <Filter className="w-4 h-4 text-violet-400" fill="rgba(139,92,246,0.3)" stroke="rgb(167,139,250)" />
                        </div>
                        <div>
                            <DialogTitle className="text-[15px] font-semibold text-white leading-none">Token Filters</DialogTitle>
                            <p className="text-[11px] text-white/35 mt-1">
                                {hasActiveFilters ? `${activeCount} filter${activeCount > 1 ? "s" : ""} active` : "No filters applied"}
                            </p>
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <span
                            className="flex items-center gap-1 px-2.5 py-1 rounded-full
                                        bg-violet-500/15 border border-violet-500/30 text-[11px] font-semibold text-violet-300"
                        >
                            {activeCount} active
                        </span>
                    )}
                </div>

                <p id="filter-description" className="sr-only">
                    Apply filters to token data
                </p>

                {/* Body */}
                <form onSubmit={handleSubmit}>
                    <div className="px-5 pb-2">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-14 gap-3">
                                <LoadingSpinner size="lg" />
                                <p className="text-[12px] text-white/40">Applying filters…</p>
                            </div>
                        ) : (
                            <FilterDialog formData={formData} onFormChange={handleFormChange} />
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-4 border-t border-white/[0.05] bg-white/[0.015]">
                        <DialogFooter>
                            <div className="flex justify-between flex-1 gap-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleReset}
                                    disabled={isLoading || !hasActiveFilters}
                                    aria-label="Reset filters"
                                    className="gap-2 text-[12px] border border-white/[0.07] bg-white/[0.04]
                                               hover:bg-white/[0.07] text-white/60 hover:text-white/80
                                               disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    Reset
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading || !hasActiveFilters}
                                    className="flex-1 gap-2 text-[12px] font-semibold
                                               bg-violet-600 hover:bg-violet-500 text-white
                                               border border-violet-500/50
                                               shadow-[0_0_16px_rgba(139,92,246,0.25)]
                                               hover:shadow-[0_0_24px_rgba(139,92,246,0.4)]
                                               disabled:opacity-40 disabled:cursor-not-allowed
                                               transition-all duration-200"
                                >
                                    {isLoading ? (
                                        <>
                                            <LoadingSpinner size="sm" />
                                            Applying…
                                        </>
                                    ) : (
                                        <>
                                            <Filter className="w-3.5 h-3.5" />
                                            Apply Filters
                                        </>
                                    )}
                                </Button>
                            </div>
                        </DialogFooter>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
});
