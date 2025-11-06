import { memo } from 'react';
import { Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogTitle,
    DialogTrigger,
    DialogContent,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import FilterDialog from './FilterDialog';

interface FilterButtonProps {
    onReset?: () => void;
    onApply?: () => void;
}

export const FilterButton = memo<FilterButtonProps>(function FilterButton({
    onReset,
    onApply,
}) {
    const handleReset = () => {
        onReset?.();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onApply?.();
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex items-center px-4"
                    aria-label="Open filters"
                >
                    <Filter fill="var(--color-brand-200)" stroke="none" size="1rem" />
                    <span>Filter</span>
                </Button>
            </DialogTrigger>
            <DialogContent aria-describedby="filter-description">
                <DialogTitle className="text-brand-200">Filter</DialogTitle>
                <p id="filter-description" className="sr-only">
                    Apply filters to token data
                </p>
                <form onSubmit={handleSubmit}>
                    <FilterDialog />
                    <DialogFooter>
                        <div className="flex justify-between flex-1">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleReset}
                                aria-label="Reset filters"
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Reset
                            </Button>
                            <DialogClose asChild>
                                <Button type="submit">Apply</Button>
                            </DialogClose>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
});
