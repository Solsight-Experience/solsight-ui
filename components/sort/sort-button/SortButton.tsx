import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';

type SortButtonProps = {
  label: string;
  type: 'none' | 'asc' | 'desc';
};

export const SortButton = ({ label, type }: SortButtonProps) => {
  return (
    <div className="text-neutral-100 select-none flex items-center gap-1 hover:cursor-pointer">
      <div className={cn(type != 'none' ? 'text-brand-200' : '')}>{label}</div>
      <div>
        <div className="relative w-5">
          <ChevronUp
            size={16}
            className={cn('absolute -top-3 left-0', type === 'asc' ? 'text-brand-200' : '')}
          />
          <ChevronDown
            size={16}
            className={cn('absolute -top-1 left-0', type === 'desc' ? 'text-brand-200' : '')}
          />
        </div>
      </div>
    </div>
  );
};
