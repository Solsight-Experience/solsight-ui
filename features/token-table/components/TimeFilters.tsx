import { memo } from "react";
import { Button } from "@/components/ui/button";

export enum TimeFilterVariant {
    "5m" = 300,
    "1h" = 3600,
    "6h" = 21600,
    "24h" = 86400
}

export type TimeFilterValue = keyof typeof TimeFilterVariant;

interface TimeFiltersProps {
    activeFilter: TimeFilterValue;
    onFilterChange: (filter: TimeFilterValue) => void;
}

export const TimeFilters = memo<TimeFiltersProps>(function TimeFilters({ activeFilter, onFilterChange }) {
    const variantList = Object.keys(TimeFilterVariant).filter((key) => isNaN(Number(key))) as TimeFilterValue[];

    return (
        <div className="flex flex-wrap gap-1.5 font-medium sm:gap-2" role="tablist" aria-label="Time filters">
            {variantList.map((variant) => (
                <TimeFilterItem key={variant} value={variant} isActive={variant === activeFilter} onClick={() => onFilterChange(variant)} />
            ))}
        </div>
    );
});

interface TimeFilterItemProps {
    value: string;
    isActive: boolean;
    onClick: () => void;
}

const TimeFilterItem = memo<TimeFilterItemProps>(function TimeFilterItem({ value, isActive, onClick }) {
    return (
        <Button
            variant="link"
            onClick={onClick}
            className={`rounded-none text-neutral-500 ${isActive ? "underline text-brand-200" : ""}`}
            role="tab"
            aria-selected={isActive}
            aria-label={`Filter by ${value}`}
        >
            {value}
        </Button>
    );
});
