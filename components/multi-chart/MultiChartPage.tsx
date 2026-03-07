'use client';

import React, { useState, useCallback } from 'react';
import { MultiChartToolbar } from './MultiChartToolbar';
import { AddTokenChartModal } from './AddTokenChartModal';
import { ChartsGrid } from './ChartsGrid';
import type { TokenChartItem } from '@/features/multi-chart/types';

const MAX_CHARTS = 6;

const SAMPLE_TOKENS: TokenChartItem[] = [
  { id: '1', address: 'EPjFWaJy47gowzcQmqgJ2gFiYKXqerijeFZcT6UnKAU', symbol: 'USDC' },
  { id: '2', address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenEqw', symbol: 'USDT' },
  { id: '3', address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', symbol: 'RAY' },
  { id: '4', address: '8HGyAAB1yoM1ttS7H3B4pXscFSq4adCY6gburMychdM', symbol: 'COPE' },
  { id: '5', address: 'JET6zUm7wWyk9rArgcnVeTooE8r2L6Kx3MaFqnab5X8', symbol: 'JET' },
  { id: '6', address: 'MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac', symbol: 'MANGO' },
];

export const MultiChartPage: React.FC = () => {
  const [charts, setCharts] = useState<TokenChartItem[]>(SAMPLE_TOKENS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddChart = useCallback((tokenAddress: string, symbol?: string) => {
    setCharts((prev) => {
      if (prev.length >= MAX_CHARTS) return prev;

      // Prevent duplicate tokens
      if (prev.some((chart) => chart.address === tokenAddress)) {
        return prev;
      }

      const newChart: TokenChartItem = {
        id: `${tokenAddress}-${Date.now()}`,
        address: tokenAddress,
        symbol: symbol || 'Unknown',
      };

      return [...prev, newChart];
    });

    setIsAddModalOpen(false);
  }, []);

  const handleRemoveChart = useCallback((id: string) => {
    setCharts((prev) => prev.filter((chart) => chart.id !== id));
  }, []);

  const handleClearAll = useCallback(() => {
    if (confirm('Are you sure you want to remove all charts?')) {
      setCharts([]);
    }
  }, []);

  const handleReorderCharts = useCallback((reorderedCharts: TokenChartItem[]) => {
    setCharts(reorderedCharts);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Toolbar */}
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <MultiChartToolbar
          chartCount={charts.length}
          maxCharts={MAX_CHARTS}
          onAddChart={() => setIsAddModalOpen(true)}
          onClearAll={handleClearAll}
        />
      </div>

      {/* Content Area */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {charts.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-96">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4 opacity-50">
                <svg
                  className="w-8 h-8 text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-100 mb-2">
                No charts yet
              </h2>
              <p className="text-slate-400 mb-4">
                Add a token chart to get started monitoring its price and volume
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Your First Chart
              </button>
            </div>
          </div>
        ) : (
          <ChartsGrid
            charts={charts}
            onRemoveChart={handleRemoveChart}
            onReorderCharts={handleReorderCharts}
          />
        )}
      </div>

      {/* Add Token Modal */}
      <AddTokenChartModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddChart={handleAddChart}
        maxCharts={MAX_CHARTS}
        currentCharts={charts.length}
      />
    </div>
  );
};
