import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { DialogFooter, DialogHeader } from '../ui/dialog';
import { Button } from '../ui/button';
import { Filter, RotateCw, Search } from 'lucide-react';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '../ui/input-group';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { SortButton } from '../sort/sort-button/SortButton';
import { FilterDialog } from '../filter/FilterDialog';
import { DialogClose } from '@radix-ui/react-dialog';

type SearchDialogProps = {
  isOpen: boolean;
  onClose: (arg: boolean) => void;
};

type SortItem = {
  id: string;
  label: string;
};

const sorts: Record<string, SortItem[]> = {
  token: [
    { id: 'mcap', label: 'MCAP' },
    { id: 'txn_24', label: 'TXN (24h)' },
    { id: 'holders', label: 'Holders' },
  ],
  pool: [
    { id: 'fee', label: 'Fee' },
    { id: 'mcap', label: 'MCAP' },
    { id: 'vol_24', label: 'VOL (24h)' },
    { id: 'liquidity', label: 'Liquidity' },
  ],
};

export const SearchDialog = ({ isOpen, onClose }: SearchDialogProps) => {
  const [activeTab, setActiveTab] = useState<string>('token');
  const [sortId, setSortId] = useState<string>('');
  const [sortType, setSortType] = useState<'asc' | 'desc'>('asc');

  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  const handleSortClick = (id: string) => {
    if (sortId === id) {
      setSortType((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortId(id);
      setSortType('asc');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="min-w-250">
        <DialogTitle className="sr-only">Search Dialog</DialogTitle>
        <DialogDescription className="sr-only">
          Search dialog: find token and pool.
        </DialogDescription>
        <div className="flex gap-4">
          <InputGroup>
            <InputGroupInput></InputGroupInput>
            <InputGroupAddon align={'inline-end'}>
              <Search />
            </InputGroupAddon>
          </InputGroup>
          <DialogClose>
            <Button variant={'outline'}>Cancel</Button>
          </DialogClose>
        </div>
        <div className="grid grid-cols-[1fr_2fr] items-center gap-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList className="w-full">
              <TabsTrigger value="token">Token</TabsTrigger>
              <TabsTrigger value="pool">Pool</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center justify-end">
            <div className="px-8 py-4 flex gap-4 justify-end">
              {sorts[activeTab].map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    handleSortClick(item.id);
                  }}
                >
                  <SortButton label={item.label} type={sortId === item.id ? sortType : 'none'} />
                </div>
              ))}
            </div>
            <Button variant="ghost" onClick={() => setFilterDialogOpen(true)}>
              <div className="flex text-neutral-100 items-center gap-2">
                <Filter />
                <div>Filter</div>
              </div>
            </Button>
          </div>
          <FilterDialog isOpen={filterDialogOpen} onClose={setFilterDialogOpen} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
