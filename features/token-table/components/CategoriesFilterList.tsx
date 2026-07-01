import { cn } from "@/lib/utils";
import { Tag } from "lucide-react";
import { LoadingSpinner } from "@/components/loading";
import { useCategories } from "@/features/token-table/hooks/useTokenFilter";
import { FilterListProps } from "../types/Filterdialog.types";

export function CategoriesFilterList({ formData, onFormChange }: FilterListProps) {
    const { data, isLoading, error } = useCategories();

    const handleCategoryToggle = (slug: string, checked: boolean) => {
        if (slug === "all") {
            onFormChange({ categories: [] });
        } else {
            const newCategories = checked ? [...formData.categories, slug] : formData.categories.filter((c) => c !== slug);
            onFormChange({ categories: newCategories });
        }
    };

    const isAllSelected = formData.categories.length === 0;

    if (isLoading) {
        return (
            <div className="flex justify-center py-10">
                <LoadingSpinner size="md" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center py-10 gap-2">
                <span className="text-red-400 text-sm">Failed to load categories</span>
            </div>
        );
    }

    const categories = data?.categories ?? [];

    return (
        <div className="py-4 space-y-3">
            {/* All categories pill */}
            <button
                type="button"
                onClick={() => handleCategoryToggle("all", true)}
                className={cn(
                    "w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-left",
                    "transition-all duration-150",
                    isAllSelected
                        ? "border-violet-500/50 bg-violet-500/15 text-violet-300"
                        : "border-white/[0.07] bg-white/[0.03] text-white/50 hover:border-white/15 hover:text-white/70"
                )}
            >
                <Tag className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[12px] font-semibold">All Categories</span>
                {isAllSelected && (
                    <span className="ml-auto text-[10px] font-bold tracking-wider bg-violet-500/30 text-violet-300 px-2 py-0.5 rounded-full">ACTIVE</span>
                )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-white/[0.05]" />
                <span className="text-[10px] font-semibold tracking-wider text-white/25 uppercase">or select</span>
                <div className="h-px flex-1 bg-white/[0.05]" />
            </div>

            {/* Category grid */}
            <div className="grid grid-cols-2 gap-1.5 max-h-[200px] overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(139,92,246,0.2)_transparent]">
                {categories.map((category) => {
                    const isSelected = formData.categories.includes(category.slug);
                    return (
                        <button
                            key={category.slug}
                            type="button"
                            onClick={() => handleCategoryToggle(category.slug, !isSelected)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-lg border text-left",
                                "transition-all duration-150 text-[11px] font-medium",
                                isSelected
                                    ? "border-violet-500/40 bg-violet-500/12 text-violet-300"
                                    : "border-white/[0.06] bg-white/[0.025] text-white/50 hover:border-white/12 hover:text-white/70"
                            )}
                        >
                            <div
                                className={cn(
                                    "w-3 h-3 rounded-sm border flex items-center justify-center shrink-0 transition-all",
                                    isSelected ? "border-violet-400 bg-violet-500" : "border-white/20"
                                )}
                            >
                                {isSelected && (
                                    <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            <span className="truncate">{category.name}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
