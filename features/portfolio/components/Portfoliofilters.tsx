import React from 'react';
import { Download } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { TimePicker } from '@/components/ui/TimePicker';
import Toggle from '@/components/ui/Toggle';
import { usePortfolioUIStore } from '../stores/portfolioUIStore';
import { DateTimePicker24h } from './DateTimePicker';

export const PortfolioFilters: React.FC = () => {
  const { currentTab, filters, setFilters } = usePortfolioUIStore();

  if (currentTab === 'position') {
    return (
      <div className="flex flex-col gap-4">
        <Label className="text-base font-medium">Filters</Label>

        <div className="space-y-4">
          <Label className="text-base">Time range</Label>

          <div className="grid grid-cols-1 gap-4">
            {/* FROM */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm ">From</Label>
              <DateTimePicker24h
                date={filters.timeFrom ? new Date(filters.timeFrom) : undefined}
                maxDate={filters.timeTo ? new Date(filters.timeTo) : undefined}
                setDate={(date) => {
                  setFilters({
                    timeFrom: date ? date.toISOString() : '',
                  });
                }}
              />
            </div>

            {/* TO */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm ">To</Label>
              <DateTimePicker24h
                date={filters.timeTo ? new Date(filters.timeTo) : undefined}
                minDate={filters.timeFrom ? new Date(filters.timeFrom) : undefined}
                setDate={(date) => {
                  setFilters({
                    timeTo: date ? date.toISOString() : '',
                  });
                }}
              />
            </div>
          </div>
        </div>

        {/* Bạn có thể bỏ hẳn phần Date range riêng nữa vì DateTimePicker đã có ngày rồi */}
        {/* Nếu vẫn muốn giữ lại để hiển thị rõ thì để lại, còn không thì xóa đoạn dưới đây cũng được */}
      </div>
    );
  }

  if (currentTab === 'activity') {
    return (
      <div className="flex flex-col gap-4">
        <Label className="text-base font-medium">Filters</Label>

        <div className="space-y-4">
          <Label className="text-base">Time range</Label>

          <div className="grid grid-cols-1 gap-4">
            {/* FROM */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm">From</Label>
              <DateTimePicker24h
                date={filters.timeFrom ? new Date(filters.timeFrom) : undefined}
                maxDate={filters.timeTo ? new Date(filters.timeTo) : undefined}
                setDate={(date) => {
                  setFilters({
                    timeFrom: date ? date.toISOString() : '',
                  });
                }}
              />
            </div>

            {/* TO */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm">To</Label>
              <DateTimePicker24h
                date={filters.timeTo ? new Date(filters.timeTo) : undefined}
                minDate={filters.timeFrom ? new Date(filters.timeFrom) : undefined}
                setDate={(date) => {
                  setFilters({
                    timeTo: date ? date.toISOString() : '',
                  });
                }}
              />
            </div>
          </div>
        </div>

        {/* <div className="flex justify-between items-center mt-2">
          <div>Hide failed</div>
          <Toggle size="sm" onChange={(checked) => setFilters({ hideFailedTxns: checked })} />
        </div>

        <div className="flex justify-between items-center">
          <div>Hide spam</div>
          <Toggle size="sm" onChange={(checked) => setFilters({ hideSpam: checked })} />
        </div> */}

        <Button className="w-full mt-2">
          <Download className="size-4" />
          Export
        </Button>
      </div>
    );
  }

  return null;
};
