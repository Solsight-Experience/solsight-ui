import { memo } from 'react';
import { Button } from '@/components/ui/button';

export enum TimeFilterVariant {
    '1m' = 60,
    '5m' = 300, // 60 * 5
    '30m' = 1800,
    '1h' = 3600,
}

export type TimeFilterValue = keyof typeof TimeFilterVariant;

interface TimeFiltersProps {
    activeFilter: TimeFilterValue;
    onFilterChange: (filter: TimeFilterValue) => void;
}

export const TimeFilters = memo<TimeFiltersProps>(function TimeFilters({
    activeFilter,
    onFilterChange,
}) {
    const variantList = Object.keys(TimeFilterVariant).filter((key) =>
        isNaN(Number(key))
    ) as TimeFilterValue[];

    return (
        <div className="flex gap-5 font-medium" role="tablist" aria-label="Time filters">
            {variantList.map((variant) => (
                <TimeFilterItem
                    key={variant}
                    value={variant}
                    isActive={variant === activeFilter}
                    onClick={() => onFilterChange(variant)}
                />
            ))}
        </div>
    );
});

interface TimeFilterItemProps {
    value: string;
    isActive: boolean;
    onClick: () => void;
}

const TimeFilterItem = memo<TimeFilterItemProps>(function TimeFilterItem({
    value,
    isActive,
    onClick,
}) {
    return (
        <Button
            variant="link"
            onClick={onClick}
            className={`text-neutral-500 ${isActive ? 'text-brand-200' : ''}`}
            role="tab"
            aria-selected={isActive}
            aria-label={`Filter by ${value}`}
        >
            {value}
        </Button>
    );
});
