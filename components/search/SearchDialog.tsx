'use client';

import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { RotateCw, Search } from 'lucide-react';
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useRef, useState } from 'react';
import { SortButton } from '../sort/sort-button/SortButton';
import { DialogClose } from '@radix-ui/react-dialog';
import apiClient from '@/lib/api-client';
import { FilterButton } from '@/features/token-table/components';
import { useFilterStore } from '@/stores/filter.stores';
import filterService from '@/lib/filter-service';
import type { TokenOverview, PoolOverview, SortBy, PoolSortBy } from '@/types/filter';

type SearchDialogProps = {
  isOpen: boolean;
  onClose: (arg: boolean) => void;
};

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

type SearchResponse = {
  tokens: TokenOverview[];
  pools: PoolOverview[];
  total: number;
};

export const SearchDialog = ({ isOpen, onClose }: SearchDialogProps) => {
  const { 
    activeTab, 
    setActiveTab, 
    searchQuery, 
    setSearchQuery,
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,
    getTokenFilterRequest,
    getPoolFilterRequest,
    resetFilters 
  } = useFilterStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{ tokens: TokenOverview[]; pools: PoolOverview[]; total: number }>({ 
    tokens: [], 
    pools: [], 
    total: 0 
  });
  const controllerRef = useRef<AbortController | null>(null);

  const currentSorts = activeTab === 'token' ? tokenSorts : poolSorts;

  const handleSortClick = (id: SortBy | PoolSortBy) => {
    if (sortBy === id) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(id);
      setSortOrder('desc');
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as 'token' | 'pool');
    // Clear results when switching tabs
    setResults({ tokens: [], pools: [], total: 0 });
    setError(null);
  };

  const handleFilterReset = () => {
    resetFilters();
    setResults({ tokens: [], pools: [], total: 0 });
    setError(null);
  };

  const handleFilterApply = async () => {
    await performSearch();
  };

  // Reset search state on open/close
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setResults({ tokens: [], pools: [], total: 0 });
      setError(null);
      setLoading(false);
    }
  }, [isOpen, setSearchQuery]);

  const performSearch = async () => {
    const query = searchQuery.trim();
    
    // If no query and no filters, clear results
    const hasFilters = activeTab === 'token' 
      ? Object.keys(getTokenFilterRequest()).length > 0
      : Object.keys(getPoolFilterRequest()).length > 0;
      
    if (query.length < 2 && !hasFilters) {
      setResults({ tokens: [], pools: [], total: 0 });
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    // Abort previous request
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      if (activeTab === 'token') {
        const tokenFilters = getTokenFilterRequest();
        if (query) {
          tokenFilters.search_query = query;
        }
        
        const data = await filterService.filterTokens({
          filters: tokenFilters,
          sort_by: sortBy as SortBy || 'market_cap',
          sort_order: sortOrder,
          limit: 50,
        });
        
        setResults({ tokens: data.tokens, pools: [], total: data.total });
      } else {
        const poolFilters = getPoolFilterRequest();
        if (query) {
          poolFilters.search_query = query;
        }
        
        const data = await filterService.filterPools({
          filters: poolFilters,
          sort_by: sortBy as PoolSortBy || 'liquidity',
          sort_order: sortOrder,
          limit: 50,
        });
        
        setResults({ tokens: [], pools: data.pools, total: data.total });
      }
    } catch (e: unknown) {
      if (e && typeof e === 'object' && ('name' in e && e.name === 'CanceledError' || 'code' in e && e.code === 'ERR_CANCELED')) return;
      const message = e && typeof e === 'object' && 'message' in e && typeof e.message === 'string' ? e.message : 'Search failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search for query changes
  useEffect(() => {
    if (!isOpen) return;
    
    const timeout = setTimeout(() => {
      performSearch();
    }, 300);

    return () => {
      clearTimeout(timeout);
    };
  }, [searchQuery, isOpen]); // Don't include performSearch to avoid infinite loop

  // Trigger search when sort changes
  useEffect(() => {
    if (!isOpen || (!searchQuery.trim() && Object.keys(activeTab === 'token' ? getTokenFilterRequest() : getPoolFilterRequest()).length === 0)) return;
    performSearch();
  }, [sortBy, sortOrder, activeTab, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="min-w-250">
        <DialogTitle className="sr-only">Search Dialog</DialogTitle>
        <DialogDescription className="sr-only">
          Search dialog: find token and pool.
        </DialogDescription>
        <div className="flex gap-4">
          <InputGroup>
            <InputGroupInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search token address, symbol, pool..."
              autoFocus
            />
            <InputGroupAddon align={'inline-end'}>
              <Search />
            </InputGroupAddon>
          </InputGroup>
          <DialogClose asChild>
            <Button variant={'outline'}>Cancel</Button>
          </DialogClose>
        </div>
        <div className="grid grid-cols-[1fr_2fr] items-center gap-2">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1">
            <TabsList className="w-full">
              <TabsTrigger value="token">Token</TabsTrigger>
              <TabsTrigger value="pool">Pool</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center justify-end">
            <div className="px-8 py-4 flex gap-4 justify-end">
              {currentSorts.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSortClick(item.id)}
                >
                  <SortButton 
                    label={item.label} 
                    type={sortBy === item.id ? sortOrder : 'none'} 
                  />
                </div>
              ))}
            </div>
            <FilterButton onReset={handleFilterReset} onApply={handleFilterApply} />
          </div>
        </div>

        {/* Results Area */}
        <div className="mt-2 min-h-56 max-h-96 overflow-auto rounded-lg border border-border p-2">
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <RotateCw className="animate-spin" />
              <span>Searching…</span>
            </div>
          )}
          {!loading && error && (
            <div className="text-destructive">{error}</div>
          )}
          {!loading && !error && searchQuery.trim().length < 2 && results.total === 0 && (
            <div className="text-muted-foreground">Type at least 2 characters to search or apply filters.</div>
          )}

          {!loading && !error && results.total > 0 && (
            <div className="space-y-4">
              {activeTab === 'token' && (
                <TokenResults tokens={results.tokens} />
              )}
              {activeTab === 'pool' && (
                <PoolResults pools={results.pools} />
              )}
            </div>
          )}
          
          {!loading && !error && searchQuery.trim().length >= 2 && results.total === 0 && (
            <div className="text-muted-foreground">No results found.</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

function TokenResults({ tokens }: { tokens: Array<{ address: string; symbol: string; name: string; logo_uri?: string; price?: number; price_change_24h?: number }> }) {
  if (!tokens?.length) return <div className="text-muted-foreground">No tokens found.</div>;
  return (
    <ul className="divide-y divide-border">
      {tokens.map((t) => (
        <li key={t.address} className="flex items-center justify-between gap-3 py-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-6 rounded-full bg-muted" aria-hidden />
            <div className="min-w-0">
              <div className="font-medium truncate">{t.symbol || t.name}</div>
              <div className="text-xs text-muted-foreground truncate">{t.name}</div>
            </div>
          </div>
          <div className="text-right text-sm">
            {typeof t.price === 'number' ? <div>${t.price.toFixed(4)}</div> : null}
            {typeof t.price_change_24h === 'number' ? (
              <div className={t.price_change_24h >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                {t.price_change_24h.toFixed(2)}%
              </div>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

function PoolResults({ pools }: { pools: Array<{ address: string; protocol: string; base_token: { symbol: string }; quote_token: { symbol: string }; volume_24h?: number; fee_percent?: number }> }) {
  if (!pools?.length) return <div className="text-muted-foreground">No pools found.</div>;
  return (
    <ul className="divide-y divide-border">
      {pools.map((p) => (
        <li key={p.address} className="flex items-center justify-between gap-3 py-2">
          <div className="min-w-0">
            <div className="font-medium truncate">{p.base_token.symbol} / {p.quote_token.symbol}</div>
            <div className="text-xs text-muted-foreground truncate">{p.protocol}</div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            {typeof p.fee_percent === 'number' ? <div>Fee {p.fee_percent}%</div> : null}
            {typeof p.volume_24h === 'number' ? <div>Vol 24h ${p.volume_24h.toLocaleString()}</div> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
