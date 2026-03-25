'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MultiChartToolbarProps {
  chartCount: number;
  maxCharts: number;
  onAddChart: () => void;
  onClearAll: () => void;
}

export const MultiChartToolbar: React.FC<MultiChartToolbarProps> = ({
  chartCount,
  maxCharts,
  onAddChart,
  onClearAll,
}) => {
  const canAddMore = chartCount < maxCharts;

  return (
    <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-full px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Title and count */}
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-100">Multi Chart Viewer</h1>
            <div className="text-sm text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full">
              {chartCount} / {maxCharts}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <Button
              onClick={onAddChart}
              disabled={!canAddMore}
              className={`flex items-center gap-2 ${
                canAddMore
                  ? 'bg-purple-700 hover:bg-purple-900 text-white'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Add Chart</span>
            </Button>

            {chartCount > 0 && (
              <Button
                onClick={onClearAll}
                variant="outline"
                className="flex items-center gap-2 border-slate-600 text-slate-300 hover:bg-red-500/10 hover:border-red-600 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-medium">Clear All</span>
              </Button>
            )}
          </div>
        </div>

        {!canAddMore && (
          <div className="mt-3 text-s text-purple-500  border-purple-500/30 rounded px-3 py-2">
            Maximum {maxCharts} charts allowed
          </div>
        )}
      </div>
    </div>
  );
};
