'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X, RotateCw } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { useSearchWithFilters } from '@/features/token-table/components';
import type { TokenOverview } from '@/types/filter';

interface AddTokenChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddChart: (tokenAddress: string, symbol?: string) => void;
  maxCharts: number;
  currentCharts: number;
}

export const AddTokenChartModal: React.FC<AddTokenChartModalProps> = ({
  isOpen,
  onClose,
  onAddChart,
  maxCharts,
  currentCharts,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<TokenOverview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { searchTokens } = useSearchWithFilters();

  const canAddMore = currentCharts < maxCharts;

  const performSearch = useCallback(async () => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await searchTokens({
        searchQuery: query,
        filters: {},
        params: {
          sort_by: 'market_cap',
          sort_order: 'desc' as const,
          limit: 10,
        },
      });
      setResults(response.tokens);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, searchTokens]);

  useEffect(() => {
    if (!isOpen) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      performSearch();
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, isOpen, performSearch]);

  const handleSelect = (token: TokenOverview) => {
    onAddChart(token.address, token.symbol);
    setSearchQuery('');
    setResults([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!canAddMore) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-950 border border-slate-700">
        <DialogTitle className="text-slate-100">Add Token Chart</DialogTitle>
        <DialogDescription className="text-slate-400">
          Search for a token to add it to your dashboard
        </DialogDescription>

        {!canAddMore && (
          <div className="bg-amber-500/10 border  rounded px-3 py-2 text-xs text-purple-500">
            Maximum {maxCharts} charts reached
          </div>
        )}

        {canAddMore && (
          <div className="space-y-3">
            {/* Search Input */}
            <InputGroup>
              <InputGroupInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search token symbol, name, or address..."
                className="bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-600"
                autoFocus
                disabled={!canAddMore}
              />
              <InputGroupAddon align="inline-end">
                {isLoading ? (
                  <RotateCw className="w-4 h-4 text-slate-500 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 text-slate-500" />
                )}
              </InputGroupAddon>
            </InputGroup>

            {/* Results */}
            {searchQuery.trim().length > 0 && (
              <div className="border border-slate-700 rounded-lg bg-slate-900/50 max-h-60 overflow-y-auto">
                {isLoading && (
                  <div className="flex items-center justify-center py-4 text-slate-400">
                    <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                    <span className="text-sm">Searching...</span>
                  </div>
                )}

                {!isLoading && results.length === 0 && (
                  <div className="flex items-center justify-center py-6 text-slate-500 text-sm">
                    No tokens found
                  </div>
                )}

                {!isLoading && results.length > 0 && (
                  <div className="divide-y divide-slate-700">
                    {results.map((token, index) => (
                      <button
                        key={token.address}
                        onClick={() => handleSelect(token)}
                        className={`w-full px-4 py-3 text-left transition-colors ${
                          index === selectedIndex
                            ? 'bg-blue-500/20'
                            : 'hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {token.logo_uri && (
                            <img
                              src={token.logo_uri}
                              alt={token.symbol}
                              className="w-8 h-8 rounded-full"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-slate-100 text-sm">
                              {token.symbol}
                            </div>
                            <div className="text-xs text-slate-500 truncate">
                              {token.name}
                            </div>
                            <div className="text-xs text-slate-600 font-mono">
                              {token.address.slice(0, 6)}...
                              {token.address.slice(-4)}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {searchQuery.trim().length === 0 && (
              <div className="flex items-center justify-center py-8 text-center">
                <div>
                  <Search className="w-8 h-8 text-slate-600 mx-auto mb-3 opacity-50" />
                  <p className="text-slate-300 text-sm font-medium">
                    Start typing to search
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    Search by symbol, name, or token address
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-slate-700">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
