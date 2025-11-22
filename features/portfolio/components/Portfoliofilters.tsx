import React from 'react';
import { Download } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { TimePicker } from '@/components/ui/TimePicker';
import Toggle from '@/components/ui/Toggle';
import { usePortfolioUIStore } from '../stores/portfolioUIStore';

export const PortfolioFilters: React.FC = () => {
  const { currentTab, filters, setFilters } = usePortfolioUIStore();

  if (currentTab === 'position') {
    return (
      <div className="flex flex-col gap-2">
        <Label className="text-base">Filters</Label>

        <Label className="text-base mt-2">Time range</Label>
        <div className="flex flex-col gap-2">
          <TimePicker
            label="From"
            value={filters.timeFrom}
            onChange={(value) => setFilters({ timeFrom: value })}
          />
          <TimePicker
            label="To"
            value={filters.timeTo}
            onChange={(value) => setFilters({ timeTo: value })}
          />
        </div>

        <Label className="text-base mt-2">Date range</Label>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <Label className="text-sm w-10">From</Label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ dateFrom: e.target.value })}
              className="flex-1 h-8 bg-transparent border-2 border-gray-600 rounded-lg px-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Label className="text-sm w-10">To</Label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ dateTo: e.target.value })}
              className="flex-1 h-8 bg-transparent border-2 border-gray-600 rounded-lg px-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>
    );
  }

  if (currentTab === 'activity') {
    return (
      <div className="flex flex-col gap-2">
        <Label className="text-base">Filters</Label>

        <div className="flex justify-between items-center mt-2">
          <div>Hide failed</div>
          <Toggle size="sm" onChange={(checked) => setFilters({ hideFailedTxns: checked })} />
        </div>

        <div className="flex justify-between items-center">
          <div>Hide spam</div>
          <Toggle size="sm" onChange={(checked) => setFilters({ hideSpam: checked })} />
        </div>

        <Button className="w-fit mt-2">
          <div>Export</div>
          <Download className="size-4 ml-2" />
        </Button>
      </div>
    );
  }

  return null;
};
