import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { MetricsTab } from './tabs/MetricsTab';
import { RotateCw } from 'lucide-react';
import { useState } from 'react';
import { useFilterStore } from '@/stores/filter.stores';
import { AuditsTab } from './tabs/AuditsTab';
import { CategoriesTab } from './tabs/CategoriesTab';

type FilterDialogProps = {
  isOpen: boolean;
  onClose: (arg: boolean) => void;
};

export const FilterDialog = ({ isOpen, onClose }: FilterDialogProps) => {
  const { resetFilters, applyFilters } = useFilterStore();
  const [activeTab, setActiveTab] = useState<string>('metrics');

  const handleApply = () => {
    applyFilters();
    onClose(false);
  };

  const handleReset = () => {
    resetFilters();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <div className="text-brand-300 border-b border-default-darker pb-2">Filter</div>
          </DialogTitle>
          <Tabs defaultValue="metrics" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="audits">Audits</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>
          </Tabs>
          <DialogDescription className="sr-only">
            Filter dialog: refine token results by metrics, audits, and categories.
          </DialogDescription>
        </DialogHeader>
        <div className="px-8 py-4">
          {activeTab == 'metrics' && <MetricsTab />}
          {activeTab == 'audits' && <AuditsTab />}
          {activeTab == 'categories' && <CategoriesTab />}
        </div>
        <DialogFooter>
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={handleReset}>
              <RotateCw />
              Reset
            </Button>
            <Button onClick={handleApply}>Apply</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
