"use client";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { RotateCw, Search } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import { useEffect, useState, useCallback, useRef } from "react";
import { SortButton } from "../sort/sort-button/SortButton";
import { DialogClose } from "@radix-ui/react-dialog";
import { FilterButton, useSearchWithFilters, type FilterFormData, getFilterRequestBody } from "@/features/token-table/components";
import type { TokenOverview, PoolOverview, SortBy, PoolSortBy, SortOrder, TokenFilterResponse, PoolFilterResponse } from "@/types/filter";
import { compactFormatter, currencyFormatter, percentFormatter } from "@/lib/formatters";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type SearchDialogProps = {
    isOpen: boolean;
    // onClose is a client callback; use Action suffix to avoid Next.js serializability warning
    onCloseAction: (arg: boolean) => void;
};

type TabType = "token" | "pool";

type SortItem = {
    id: SortBy | PoolSortBy;
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

const poolSorts: SortItem[] = [
    { id: "liquidity", label: "Liquidity" },
    { id: "volume_24h", label: "Volume" },
    { id: "apr", label: "APR" },
    { id: "fee", label: "Fee" },
    { id: "age", label: "Age" }
];

export const SearchDialog = ({ isOpen, onCloseAction }: SearchDialogProps) => {
    const [activeTab] = useState<TabType>("token");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<SortBy | PoolSortBy | "">("");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const [filterFormData, setFilterFormData] = useState<FilterFormData | null>(null);
    const [results, setResults] = useState<{
        tokens: TokenOverview[];
        pools: PoolOverview[];
        total: number;
    }>({ tokens: [], pools: [], total: 0 });

    const { searchTokens, searchPools, isSearchingTokens, isSearchingPools } = useSearchWithFilters();

    const isLoading = isSearchingTokens || isSearchingPools;
    const currentSorts = activeTab === "token" ? tokenSorts : poolSorts;
    const debounceTimerRef = useRef<number | null>(null);

    const handleSortClick = (id: SortBy | PoolSortBy) => {
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
            setResults({ tokens: [], pools: [], total: 0 });
            return;
        }

        try {
            if (activeTab === "token") {
                const filters = filterFormData ? getFilterRequestBody(filterFormData, "token") : {};
                const response = await searchTokens({
                    searchQuery: query,
                    filters,
                    params: { sort_by: (sortBy as SortBy) || "market_cap", sort_order: sortOrder, limit: 50 }
                });
                setResults({ tokens: response.tokens, pools: [], total: response.total });
            } else {
                const filters = filterFormData ? getFilterRequestBody(filterFormData, "pool") : {};
                const response = await searchPools({
                    searchQuery: query,
                    filters,
                    params: { sort_by: (sortBy as PoolSortBy) || "liquidity", sort_order: sortOrder, limit: 50 }
                });
                setResults({ tokens: [], pools: response.pools, total: response.total });
            }
        } catch (error) {
            console.error("Search error:", error);
        }
    }, [searchQuery, filterFormData, activeTab, sortBy, sortOrder, searchTokens, searchPools]);

    const handleFilterApply = (response: TokenFilterResponse | PoolFilterResponse) => {
        if ("tokens" in response) {
            setResults({ tokens: response.tokens, pools: [], total: response.total });
        } else {
            setResults({ tokens: [], pools: response.pools, total: response.total });
        }
    };

    useEffect(() => {
        if (!isOpen) {
            setSearchQuery("");
            setResults({ tokens: [], pools: [], total: 0 });
            setFilterFormData(null);
            setSortBy("");
            setSortOrder("desc");
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current as number);
        debounceTimerRef.current = window.setTimeout(() => {
            performSearch();
        }, 300);
        return () => {
            if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current as number);
        };
    }, [searchQuery, filterFormData, isOpen, performSearch]);

    useEffect(() => {
        if (!isOpen) return;
        const hasContent = searchQuery.trim().length >= 2 || filterFormData !== null;
        if (hasContent) performSearch();
    }, [sortBy, sortOrder, activeTab, isOpen, performSearch]);

    return (
        <Dialog open={isOpen} onOpenChange={onCloseAction}>
            <DialogContent
                showCloseButton={false}
                className="min-w-250 bg-[var(--surface-card)] border border-[var(--border-subtle)] shadow-[var(--shadow-dropdown)]"
            >
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

                <div className="grid grid-cols-[1fr_2fr] items-center gap-2">
                    <div className="text-xs text-[var(--text-muted)] font-medium">Sort by:</div>
                    <div className="flex items-center justify-end">
                        <div className="px-0 py-2 flex gap-2 justify-end">
                            {currentSorts.map((item) => (
                                <div key={item.id} onClick={() => handleSortClick(item.id)}>
                                    <SortButton label={item.label} type={sortBy === item.id ? sortOrder : "none"} />
                                </div>
                            ))}
                        </div>
                        <FilterButton
                            filterOptions={{ filterType: activeTab, sort_by: sortBy || undefined, sort_order: sortOrder, limit: 50 }}
                            onApply={handleFilterApply}
                            onReset={() => {
                                setFilterFormData(null);
                                if (searchQuery.trim().length >= 2) performSearch();
                                else setResults({ tokens: [], pools: [], total: 0 });
                            }}
                        />
                    </div>
                </div>

                {/* Results Area */}
                <div className="mt-4 min-h-56 max-h-96 overflow-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-panel)] p-3">
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

                    {!isLoading && results.total > 0 && (
                        <>
                            {activeTab === "token" && <TokenResults tokens={results.tokens} onClose={onCloseAction} />}
                            {activeTab === "pool" && <PoolResults pools={results.pools} />}
                        </>
                    )}
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
                    <div className="flex gap-8 flex-shrink-0">
                        <div className="text-right">
                            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">MCAP</div>
                            <div className="text-sm font-medium text-[var(--text-primary)]">{currencyFormatter.formatCompact(Number(t.market_cap))}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">TXN 24h</div>
                            <div className="text-sm font-medium text-[var(--text-primary)]">{compactFormatter.format(Number(t.txns_24h.total))}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Holders</div>
                            <div className="text-sm font-medium text-[var(--text-primary)]">{compactFormatter.format(Number(t.holders.count))}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Volume</div>
                            <div className="text-sm font-medium text-[var(--text-primary)]">{currencyFormatter.formatCompact(Number(t.volume_24h))}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Age</div>
                            <div className="text-sm font-medium text-[var(--text-primary)]">{formatAge(Number(t.age_seconds))}</div>
                        </div>
                        <div className="text-right">
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

function PoolResults({
    pools
}: {
    pools: Array<{
        address: string;
        protocol: string;
        base_token: { symbol: string; logo_uri?: string };
        quote_token: { symbol: string; logo_uri?: string };
        volume_24h?: number;
        fee_percent?: number;
    }>;
}) {
    if (!pools?.length) return <div className="text-[var(--text-muted)] text-sm">No pools found</div>;
    return (
        <div className="space-y-2">
            {pools.map((p) => (
                <div
                    key={p.address}
                    className="flex items-center justify-between gap-3 p-3 border border-[var(--border-subtle)] rounded-lg hover:border-[var(--border-default)] bg-[var(--surface-card)] hover:bg-[var(--surface-btn)] transition-all duration-200"
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex -space-x-3 isolate items-center shrink-0">
                            <Avatar className="size-8 rounded-full border-2 border-[var(--surface-card)] bg-[var(--surface-btn)] z-10 hover:z-20 transition-all">
                                <AvatarImage src={p.base_token?.logo_uri || ""} alt={p.base_token?.symbol} className="object-cover" />
                                <AvatarFallback delayMs={0} className="text-[var(--text-muted)] font-bold text-[10px]">
                                    {p.base_token?.symbol?.slice(0, 2).toUpperCase() || "?"}
                                </AvatarFallback>
                            </Avatar>
                            <Avatar className="size-8 rounded-full border-2 border-[var(--surface-card)] bg-[var(--surface-btn)] z-0 hover:z-20 transition-all">
                                <AvatarImage src={p.quote_token?.logo_uri || ""} alt={p.quote_token?.symbol} className="object-cover" />
                                <AvatarFallback delayMs={0} className="text-[var(--text-muted)] font-bold text-[10px]">
                                    {p.quote_token?.symbol?.slice(0, 2).toUpperCase() || "?"}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="min-w-0">
                            <div className="font-medium text-[var(--text-primary)] truncate">
                                {p.base_token?.symbol} / {p.quote_token?.symbol}
                            </div>
                            <div className="text-xs text-[var(--text-muted)] truncate">{p.protocol}</div>
                        </div>
                    </div>
                    <div className="text-right text-sm text-[var(--text-primary)] flex-shrink-0">
                        {typeof p.fee_percent === "number" && <div className="text-xs text-[var(--text-muted)]">Fee {p.fee_percent}%</div>}
                        {typeof p.volume_24h === "number" && <div className="font-medium">Vol ${p.volume_24h.toLocaleString()}</div>}
                    </div>
                </div>
            ))}
        </div>
    );
}
