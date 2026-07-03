import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Tag, X } from "lucide-react";
import { LoadingSpinner } from "@/components/loading";
import { useCategoryNames } from "@/features/token-table/hooks/useTokenFilter";
import { FilterListProps } from "../types/Filterdialog.types";
import { CategorySearch } from "./CategorySearch";

export function CategoryFilterList({ formData, onFormChange }: FilterListProps) {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    // Remembers id -> name for every category seen so selected chips keep their
    // label even after the user searches away from the page that had them.
    const [nameCache, setNameCache] = useState<Record<string, string>>({});

    useEffect(() => {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => setDebouncedSearch(search), 300);
        return () => {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        };
    }, [search]);

    const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useCategoryNames({
        name: debouncedSearch || undefined
    });

    const categories = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

    useEffect(() => {
        if (categories.length === 0) return;
        setNameCache((prev) => {
            const next = { ...prev };
            let changed = false;
            for (const category of categories) {
                if (next[category.id] !== category.name) {
                    next[category.id] = category.name;
                    changed = true;
                }
            }
            return changed ? next : prev;
        });
    }, [categories]);

    const handleCategoryToggle = (id: string, checked: boolean) => {
        if (id === "all") {
            onFormChange({ categories: [] });
        } else {
            const newCategories = checked ? [...formData.categories, id] : formData.categories.filter((c) => c !== id);
            onFormChange({ categories: newCategories });
        }
    };

    const isAllSelected = formData.categories.length === 0;

    return (
        <div className="py-4 space-y-3">
            <CategorySearch value={search} onChange={setSearch} />

            {/* Selected categories */}
            {formData.categories.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {formData.categories.map((id) => (
                        <span
                            key={id}
                            className="flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full border border-violet-500/30 bg-violet-500/15 text-[11px] font-medium text-violet-300"
                        >
                            <span className="truncate max-w-[120px]">{nameCache[id] ?? id}</span>
                            <button
                                type="button"
                                onClick={() => handleCategoryToggle(id, false)}
                                aria-label={`Remove ${nameCache[id] ?? id}`}
                                className="rounded-full p-0.5 hover:bg-violet-500/25"
                            >
                                <X className="w-2.5 h-2.5" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

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

            {isLoading ? (
                <div className="flex justify-center py-10">
                    <LoadingSpinner size="md" />
                </div>
            ) : error ? (
                <div className="flex flex-col items-center py-10 gap-2">
                    <span className="text-red-400 text-sm">Failed to load categories</span>
                </div>
            ) : (
                <>
                    {/* Category grid */}
                    <div className="grid grid-cols-2 gap-1.5 max-h-[200px] overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(139,92,246,0.2)_transparent]">
                        {categories.map((category) => {
                            const isSelected = formData.categories.includes(category.id);
                            return (
                                <button
                                    key={category.id}
                                    type="button"
                                    onClick={() => handleCategoryToggle(category.id, !isSelected)}
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
                        {categories.length === 0 && <span className="col-span-2 text-center text-[11px] text-white/30 py-4">No categories found</span>}
                    </div>

                    {hasNextPage && (
                        <button
                            type="button"
                            onClick={() => fetchNextPage()}
                            disabled={isFetchingNextPage}
                            className="w-full text-[11px] font-semibold text-violet-300/80 hover:text-violet-300 py-1.5 disabled:opacity-40"
                        >
                            {isFetchingNextPage ? "Loading…" : "Load more"}
                        </button>
                    )}
                </>
            )}
        </div>
    );
}
