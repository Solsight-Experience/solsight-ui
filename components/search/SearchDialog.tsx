'use client';

import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { Link, RotateCw, Router, Search } from 'lucide-react';
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState, useCallback, useRef } from 'react';
import { SortButton } from '../sort/sort-button/SortButton';
import { DialogClose } from '@radix-ui/react-dialog';
import {
  FilterButton,
  useSearchWithFilters,
  type FilterFormData,
  getFilterRequestBody,
} from '@/features/token-table/components';
import type {
  TokenOverview,
  PoolOverview,
  SortBy,
  PoolSortBy,
  SortOrder,
  TokenFilterResponse,
  PoolFilterResponse,
} from '@/types/filter';
import { formatCompact, formatCurrency, formatPercent } from '@/lib/formatters';
import { useRouter } from 'next/navigation';

type SearchDialogProps = {
  isOpen: boolean;
  onClose: (arg: boolean) => void;
};

type TabType = 'token' | 'pool';

type SortItem = {
  id: SortBy | PoolSortBy;
  label: string;
};

const tokenSorts: SortItem[] = [
  { id: 'market_cap', label: 'MCAP' },
  { id: 'txns_24h', label: 'TXN (24h)' },
  { id: 'holders', label: 'Holders' },
  { id: 'volume_24h', label: 'Volume' },
  { id: 'age', label: 'Age' },
  { id: 'price_change_24h', label: 'Price Change' },
];

const poolSorts: SortItem[] = [
  { id: 'liquidity', label: 'Liquidity' },
  { id: 'volume_24h', label: 'Volume' },
  { id: 'apr', label: 'APR' },
  { id: 'fee', label: 'Fee' },
  { id: 'age', label: 'Age' },
];

export const SearchDialog = ({ isOpen, onClose }: SearchDialogProps) => {
  // Local state
  const [activeTab, setActiveTab] = useState<TabType>('token');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy | PoolSortBy | ''>('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterFormData, setFilterFormData] = useState<FilterFormData | null>(null);
  const [results, setResults] = useState<{
    tokens: TokenOverview[];
    pools: PoolOverview[];
    total: number;
  }>({
    tokens: [],
    pools: [],
    total: 0,
  });

  // React Query hook
  const { searchTokens, searchPools, isSearchingTokens, isSearchingPools } = useSearchWithFilters();

  const isLoading = isSearchingTokens || isSearchingPools;
  const currentSorts = activeTab === 'token' ? tokenSorts : poolSorts;
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSortClick = (id: SortBy | PoolSortBy) => {
    if (sortBy === id) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(id);
      setSortOrder('desc');
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as TabType);
    setResults({ tokens: [], pools: [], total: 0 });
    setSortBy('');
    setSortOrder('desc');
  };

  const performSearch = useCallback(async () => {
    const query = searchQuery.trim();

    // Check if we have any filters applied
    const hasFilters = filterFormData !== null;
    const hasSearchQuery = query.length >= 2;

    // If no search query and no filters, clear results
    if (!hasSearchQuery && !hasFilters) {
      setResults({ tokens: [], pools: [], total: 0 });
      return;
    }

    try {
      if (activeTab === 'token') {
        const filters = filterFormData ? getFilterRequestBody(filterFormData, 'token') : {};

        const response = await searchTokens({
          searchQuery: query,
          filters,
          params: {
            sort_by: (sortBy as SortBy) || 'market_cap',
            sort_order: sortOrder,
            limit: 50,
          },
        });

        setResults({ tokens: response.tokens, pools: [], total: response.total });
      } else {
        const filters = filterFormData ? getFilterRequestBody(filterFormData, 'pool') : {};

        const response = await searchPools({
          searchQuery: query,
          filters,
          params: {
            sort_by: (sortBy as PoolSortBy) || 'liquidity',
            sort_order: sortOrder,
            limit: 50,
          },
        });

        setResults({ tokens: [], pools: response.pools, total: response.total });
      }
    } catch (error) {
      // Error already handled by toast in hook
      console.error('Search error:', error);
    }
  }, [searchQuery, filterFormData, activeTab, sortBy, sortOrder, searchTokens, searchPools]);

  const handleFilterApply = (response: TokenFilterResponse | PoolFilterResponse) => {
    // Update results with filter response
    if ('tokens' in response) {
      setResults({ tokens: response.tokens, pools: [], total: response.total });
    } else {
      setResults({ tokens: [], pools: response.pools, total: response.total });
    }
  };

  // Reset on dialog open/close
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setResults({ tokens: [], pools: [], total: 0 });
      setFilterFormData(null);
      setSortBy('');
      setSortOrder('desc');
    }
  }, [isOpen]);

  // Debounced search on query change
  useEffect(() => {
    if (!isOpen) return;

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      performSearch();
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, isOpen, performSearch]);

  // Trigger search when sort changes (only if we have query or filters)
  useEffect(() => {
    if (!isOpen) return;
    const hasContent = searchQuery.trim().length >= 2 || filterFormData !== null;
    if (hasContent) {
      performSearch();
    }
  }, [sortBy, sortOrder, activeTab, isOpen, performSearch]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="min-w-250 bg-slate-950 border border-slate-700">
        <DialogTitle className="sr-only">Search Dialog</DialogTitle>
        <DialogDescription className="sr-only">
          Search dialog: find token and pool.
        </DialogDescription>
        <div className="flex gap-2">
          <InputGroup>
            <InputGroupInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search token symbol, address, or pool..."
              className="bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500"
              autoFocus
            />
            <InputGroupAddon align={'inline-end'}>
              <Search className="text-slate-500" />
            </InputGroupAddon>
          </InputGroup>
          <DialogClose asChild>
            <Button variant={'outline'} className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600">Cancel</Button>
          </DialogClose>
        </div>
        <div className="grid grid-cols-[1fr_2fr] items-center gap-2">
          <div className="text-xs text-slate-500 font-medium">Sort by:</div>
          <div className="flex items-center justify-end">
            <div className="px-0 py-2 flex gap-2 justify-end">
              {currentSorts.map((item) => (
                <div key={item.id} onClick={() => handleSortClick(item.id)}>
                  <SortButton label={item.label} type={sortBy === item.id ? sortOrder : 'none'} />
                </div>
              ))}
            </div>
            <FilterButton
              filterOptions={{
                filterType: activeTab,
                sort_by: sortBy || undefined,
                sort_order: sortOrder,
                limit: 50,
              }}
              onApply={handleFilterApply}
              onReset={() => {
                setFilterFormData(null);
                // Re-run search with query only (without filters)
                if (searchQuery.trim().length >= 2) {
                  performSearch();
                } else {
                  setResults({ tokens: [], pools: [], total: 0 });
                }
              }}
            />
          </div>
        </div>

        {/* Results Area */}
        <div className="mt-4 min-h-56 max-h-96 overflow-auto rounded-lg border border-slate-700 bg-slate-900/50 p-3">
          {isLoading && (
            <div className="flex items-center justify-center gap-3 text-slate-400 py-8">
              <RotateCw className="animate-spin w-5 h-5" />
              <span className="font-medium text-sm">Searching…</span>
            </div>
          )}

          {!isLoading && searchQuery.trim().length < 2 && !filterFormData && (
            <div className="flex items-center justify-center py-8 text-center">
              <div>
                <Search className="w-8 h-8 text-slate-600 mx-auto mb-3 opacity-60" />
                <p className="text-slate-300 text-sm font-medium">Start searching</p>
                <p className="text-slate-500 text-xs mt-2">Type at least 2 characters to find tokens</p>
              </div>
            </div>
          )}

          {!isLoading && (searchQuery.trim().length >= 2 || filterFormData) && results.total === 0 && (
            <div className="flex items-center justify-center py-8 text-center">
              <div>
                <p className="text-slate-300 text-sm font-medium">No results</p>
                <p className="text-slate-500 text-xs mt-2">Try different keywords</p>
              </div>
            </div>
          )}

          {!isLoading && results.total > 0 && (
            <>
              {activeTab === 'token' && <TokenResults tokens={results.tokens} onClose={onClose} />}
              {activeTab === 'pool' && <PoolResults pools={results.pools} />}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

function TokenResults({
  tokens,
  onClose,
}: {
  tokens: TokenOverview[];
  onClose: (open: boolean) => void;
}) {
  const router = useRouter();
  if (!tokens?.length) return <div className="text-slate-400 text-sm">No tokens found</div>;

  const formatAge = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    if (days > 0) return `${days}d`;
    const hours = Math.floor(seconds / 3600);
    if (hours > 0) return `${hours}h`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatPrice = (value: number) => {
    if (value >= 1) {
      return formatCurrency(value);
    } else {
      return `$${value.toFixed(2)}`;
    }
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
          className="flex items-center gap-4 p-3 rounded-lg border border-slate-700 hover:border-slate-600 bg-slate-900/30 hover:bg-slate-800/40 cursor-pointer transition-all duration-200"
          onClick={() => handleTokenClick(t.address)}
        >
          {/* Token Info - Left Side */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="size-10 rounded-full bg-slate-800 flex-shrink-0 overflow-hidden border border-slate-700">
              {t.logo_uri ? (
                <img src={t.logo_uri} alt={t.symbol} className="size-10 object-cover" />
              ) : (
                <div className="size-10 bg-slate-700" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-slate-200 truncate">{t.symbol}</div>
              <div className="text-xs text-slate-400 truncate">{t.name}</div>
              <div className="text-xs text-slate-500 font-mono">{formatAddress(t.address)}</div>
            </div>
          </div>

          {/* Data Metrics - Right Side */}
          <div className="flex gap-8 flex-shrink-0">
            {/* Market Cap */}
            <div className="text-right">
              <div className="text-xs text-slate-500 uppercase tracking-wide">MCAP</div>
              <div className="text-sm font-medium text-slate-200">{formatCurrency(Number(t.market_cap))}</div>
            </div>

            {/* Transactions */}
            <div className="text-right">
              <div className="text-xs text-slate-500 uppercase tracking-wide">TXN 24h</div>
              <div className="text-sm font-medium text-slate-200">{formatCompact(Number(t.txns_24h.total))}</div>
            </div>

            {/* Holders */}
            <div className="text-right">
              <div className="text-xs text-slate-500 uppercase tracking-wide">Holders</div>
              <div className="text-sm font-medium text-slate-200">{formatCompact(Number(t.holders.count))}</div>
            </div>

            {/* Volume */}
            <div className="text-right">
              <div className="text-xs text-slate-500 uppercase tracking-wide">Volume</div>
              <div className="text-sm font-medium text-slate-200">{formatCurrency(Number(t.volume_24h))}</div>
            </div>

            {/* Age */}
            <div className="text-right">
              <div className="text-xs text-slate-500 uppercase tracking-wide">Age</div>
              <div className="text-sm font-medium text-slate-200">{formatAge(Number(t.age_seconds))}</div>
            </div>

            {/* Price Change */}
            <div className="text-right">
              <div className="text-xs text-slate-500 uppercase tracking-wide">Price</div>
              <div className="text-sm font-medium">
                <span className="text-slate-200">{formatPrice(Number(t.price))}</span>
                <span className="mx-1 text-slate-500">/</span>
                <span className={`${Number(t.price_change_24h) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {formatPercent(Number(t.price_change_24h))}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PoolResults({ pools }: { pools: Array<{ address: string; protocol: string; base_token: { symbol: string }; quote_token: { symbol: string }; volume_24h?: number; fee_percent?: number }> }) {
  if (!pools?.length) return <div className="text-slate-400 text-sm">No pools found</div>;
  return (
    <div className="space-y-2">
      {pools.map((p) => (
        <div key={p.address} className="flex items-center justify-between gap-3 p-3 border border-slate-700 rounded-lg hover:border-slate-600 bg-slate-900/30 hover:bg-slate-800/40 transition-all duration-200">
          <div className="min-w-0">
            <div className="font-medium text-slate-200 truncate">{p.base_token.symbol} / {p.quote_token.symbol}</div>
            <div className="text-xs text-slate-400 truncate">{p.protocol}</div>
          </div>
          <div className="text-right text-sm text-slate-200 flex-shrink-0">
            {typeof p.fee_percent === 'number' ? <div className="text-xs text-slate-500">Fee {p.fee_percent}%</div> : null}
            {typeof p.volume_24h === 'number' ? <div className="font-medium">Vol ${p.volume_24h.toLocaleString()}</div> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
