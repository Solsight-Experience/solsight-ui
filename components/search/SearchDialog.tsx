"use client";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { RotateCw, Search } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import { useEffect, useState, useCallback, useRef } from "react";
import { SortButton } from "../sort/sort-button/SortButton";
import { DialogClose } from "@radix-ui/react-dialog";
import { FilterButton, useSearchWithFilters, type FilterFormData, getFilterRequestBody } from "@/features/token-table/components";
import type { TokenOverview, SortBy, SortOrder, TokenFilterResponse } from "@/types/filter";
import { compactFormatter, currencyFormatter, percentFormatter } from "@/lib/formatters";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type SearchDialogProps = {
    isOpen: boolean;
    // onClose is a client callback; use Action suffix to avoid Next.js serializability warning
    onCloseAction: (arg: boolean) => void;
};

type SortItem = {
    id: SortBy;
    label: string;
};

const tokenSorts: SortItem[] = [
    { id: "market_cap", label: "MCAP" },
    { id: "txns_24h", label: "TXN (24h)" },
    { id: "holders", label: "Holders" },
    { id: "volume_24h", label: "Volume" },
    { id: "age", label: "Age" },
    { id: "price_change_24h", label: "Price Change" }
];

export const SearchDialog = ({ isOpen, onCloseAction }: SearchDialogProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<SortBy | "">("");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const [filterFormData, setFilterFormData] = useState<FilterFormData | null>(null);
    const [results, setResults] = useState<{
        tokens: TokenOverview[];
        total: number;
    }>({ tokens: [], total: 0 });

    const { searchTokens, isSearchingTokens } = useSearchWithFilters();

    const isLoading = isSearchingTokens;
    const debounceTimerRef = useRef<number | null>(null);

    const handleSortClick = (id: SortBy) => {
        if (sortBy === id) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(id);
            setSortOrder("desc");
        }
    };

    const performSearch = useCallback(async () => {
        const query = searchQuery.trim();
        const hasFilters = filterFormData !== null;
        const hasSearchQuery = query.length >= 2;

        if (!hasSearchQuery && !hasFilters) {
            setResults({ tokens: [], total: 0 });
            return;
        }

        try {
            const filters = filterFormData ? getFilterRequestBody(filterFormData) : {};
            const response = await searchTokens({
                searchQuery: query,
                filters,
                params: { sort_by: (sortBy as SortBy) || "market_cap", sort_order: sortOrder, limit: 50 }
            });
            setResults({ tokens: response.tokens, total: response.total });
        } catch (error) {
            console.error("Search error:", error);
        }
    }, [searchQuery, filterFormData, sortBy, sortOrder, searchTokens]);

    // Always-current ref so effects don't need performSearch as a dependency
    const performSearchRef = useRef(performSearch);
    useEffect(() => {
        performSearchRef.current = performSearch;
    });

    const handleFilterApply = (_response: TokenFilterResponse | null, formData: FilterFormData) => {
        setFilterFormData(formData);
        // The immediate search effect below handles triggering the combined filter+search
    };

    // Reset state when dialog closes
    useEffect(() => {
        if (!isOpen) {
            setSearchQuery("");
            setResults({ tokens: [], total: 0 });
            setFilterFormData(null);
            setSortBy("");
            setSortOrder("desc");
        }
    }, [isOpen]);

    // Debounced search — fires only when search text changes
    useEffect(() => {
        if (!isOpen) return;
        if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current as number);
        debounceTimerRef.current = window.setTimeout(() => {
            performSearchRef.current();
        }, 300);
        return () => {
            if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current as number);
        };
    }, [searchQuery, isOpen]);

    // Immediate search — fires when filter or sort changes
    useEffect(() => {
        if (!isOpen) return;
        performSearchRef.current();
    }, [filterFormData, sortBy, sortOrder, isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onCloseAction}>
            <DialogContent
                showCloseButton={false}
                className="flex flex-col bg-[var(--surface-card)] border border-[var(--border-subtle)] shadow-[var(--shadow-dropdown)]
                           w-full sm:max-w-[700px]
                           max-h-[min(90svh,calc(100svh-2rem))] overflow-hidden p-0"
            >
                <div className="flex flex-col gap-4 p-4 sm:p-6 overflow-hidden flex-1 min-h-0">
                    <DialogTitle className="sr-only">Search Dialog</DialogTitle>
                    <DialogDescription className="sr-only">Search dialog: find token and pool.</DialogDescription>

                    <div className="flex gap-2">
                        <InputGroup className="border-[var(--border-subtle)] bg-[var(--surface-panel)]">
                            <InputGroupInput
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search token symbol, address, or pool..."
                                className="text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                                autoFocus
                            />
                            <InputGroupAddon align={"inline-end"}>
                                <Search className="text-[var(--text-muted)]" />
                            </InputGroupAddon>
                        </InputGroup>
                        <DialogClose asChild>
                            <Button
                                variant={"outline"}
                                className="border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--surface-btn-hover)] hover:border-[var(--border-default)]"
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                    </div>

                    <div className="grid grid-cols-[auto_1fr] items-start gap-y-1 gap-x-2">
                        <div className="text-xs text-[var(--text-muted)] font-medium pt-2">Sort by:</div>
                        <div className="flex items-center justify-end flex-wrap gap-1">
                            <div className="flex items-center flex-wrap gap-1 justify-end">
                                {tokenSorts.map((item) => (
                                    <div key={item.id} onClick={() => handleSortClick(item.id)}>
                                        <SortButton label={item.label} type={sortBy === item.id ? sortOrder : "none"} />
                                    </div>
                                ))}
                            </div>
                            <FilterButton
                                filterOptions={{ sort_by: sortBy || undefined, sort_order: sortOrder, limit: 50 }}
                                onApply={handleFilterApply}
                                onReset={() => {
                                    setFilterFormData(null);
                                    // immediate search effect re-runs; performSearch handles empty state
                                }}
                            />
                        </div>
                    </div>

                    {/* Results Area */}
                    <div className="flex-1 min-h-56 overflow-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-panel)] p-3">
                        {isLoading && (
                            <div className="flex items-center justify-center gap-3 text-[var(--text-muted)] py-8">
                                <RotateCw className="animate-spin w-5 h-5" />
                                <span className="font-medium text-sm">Searching…</span>
                            </div>
                        )}

                        {!isLoading && searchQuery.trim().length < 2 && !filterFormData && (
                            <div className="flex items-center justify-center py-8 text-center">
                                <div>
                                    <Search className="w-8 h-8 text-[var(--text-disabled)] mx-auto mb-3" />
                                    <p className="text-[var(--text-primary)] text-sm font-medium">Start searching</p>
                                    <p className="text-[var(--text-muted)] text-xs mt-2">Type at least 2 characters to find tokens</p>
                                </div>
                            </div>
                        )}

                        {!isLoading && (searchQuery.trim().length >= 2 || filterFormData) && results.total === 0 && (
                            <div className="flex items-center justify-center py-8 text-center">
                                <div>
                                    <p className="text-[var(--text-primary)] text-sm font-medium">No results</p>
                                    <p className="text-[var(--text-muted)] text-xs mt-2">Try different keywords</p>
                                </div>
                            </div>
                        )}

                        {!isLoading && results.total > 0 && <TokenResults tokens={results.tokens} onClose={onCloseAction} />}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

function TokenResults({ tokens, onClose }: { tokens: TokenOverview[]; onClose: (open: boolean) => void }) {
    const router = useRouter();
    if (!tokens?.length) return <div className="text-[var(--text-muted)] text-sm">No tokens found</div>;

    const formatAge = (seconds: number) => {
        const days = Math.floor(seconds / 86400);
        if (days > 0) return `${days}d`;
        const hours = Math.floor(seconds / 3600);
        if (hours > 0) return `${hours}h`;
        const minutes = Math.floor(seconds / 60);
        return `${minutes}m`;
    };

    const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

    const formatPrice = (value: number) => {
        if (value >= 1) return currencyFormatter.formatCompact(value);
        return `$${value.toFixed(2)}`;
    };

    const handleTokenClick = (address: string) => {
        onClose(false);
        router.push(`/token/${address}`);
    };

    return (
        <div className="space-y-2">
            {tokens.map((t) => (
                <div
                    key={t.address}
                    className="flex items-center gap-4 p-3 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--border-default)] bg-[var(--surface-card)] hover:bg-[var(--surface-btn)] cursor-pointer transition-all duration-200"
                    onClick={() => handleTokenClick(t.address)}
                >
                    {/* Token Info - Left Side */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Avatar className="size-10 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-btn)] shrink-0">
                            <AvatarImage src={t.logo_uri || ""} alt={t.symbol} className="object-cover" />
                            <AvatarFallback delayMs={0} className="text-[var(--text-muted)] font-medium text-sm">
                                {t.symbol?.slice(0, 2).toUpperCase() || "?"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <div className="font-semibold text-[var(--text-primary)] truncate">{t.symbol}</div>
                            <div className="text-xs text-[var(--text-muted)] truncate">{t.name}</div>
                            <div className="text-xs text-[var(--text-muted)] font-mono">{formatAddress(t.address)}</div>
                        </div>
                    </div>

                    {/* Data Metrics - Right Side */}
                    <div className="flex gap-3 sm:gap-6 flex-shrink-0 overflow-x-auto">
                        <div className="text-right shrink-0">
                            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">MCAP</div>
                            <div className="text-sm font-medium text-[var(--text-primary)]">{currencyFormatter.formatCompact(Number(t.market_cap))}</div>
                        </div>
                        <div className="text-right shrink-0 hidden sm:block">
                            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">TXN 24h</div>
                            <div className="text-sm font-medium text-[var(--text-primary)]">{compactFormatter.format(Number(t.txns_24h.total))}</div>
                        </div>
                        <div className="text-right shrink-0 hidden md:block">
                            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Holders</div>
                            <div className="text-sm font-medium text-[var(--text-primary)]">{compactFormatter.format(Number(t.holders.count))}</div>
                        </div>
                        <div className="text-right shrink-0 hidden sm:block">
                            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Volume</div>
                            <div className="text-sm font-medium text-[var(--text-primary)]">{currencyFormatter.formatCompact(Number(t.volume_24h))}</div>
                        </div>
                        <div className="text-right shrink-0 hidden md:block">
                            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Age</div>
                            <div className="text-sm font-medium text-[var(--text-primary)]">{formatAge(Number(t.age_seconds))}</div>
                        </div>
                        <div className="text-right shrink-0">
                            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Price</div>
                            <div className="text-sm font-medium">
                                <span className="text-[var(--text-primary)]">{formatPrice(Number(t.price))}</span>
                                <span className="mx-1 text-[var(--text-muted)]">/</span>
                                <span className={Number(t.price_change_24h) >= 0 ? "text-emerald-500" : "text-red-500"}>
                                    {percentFormatter.format(Number(t.price_change_24h))}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
