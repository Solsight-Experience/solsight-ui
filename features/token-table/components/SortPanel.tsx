import { memo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export type SortOption = "volumes" | "txns";
export type SortDirection = "asc" | "desc" | "none";

export interface SortState {
    option: SortOption;
    direction: SortDirection;
}

interface SortPanelProps {
    sortState: SortState;
    onSortChange: (option: SortOption) => void;
}

/**
 * SortPanel Component
 * Displays sorting options for the Top tab (Volumes and TXNS)
 */
export const SortPanel = memo<SortPanelProps>(function SortPanel({ sortState, onSortChange }) {
    const renderSortButton = (option: SortOption, label: string) => {
        const isActive = sortState.option === option;
        const direction = isActive ? sortState.direction : "none";

        return (
            <Button
                variant="ghost"
                onClick={() => onSortChange(option)}
                className={cn("flex items-center gap-1 px-3 py-2 font-medium", isActive && direction !== "none" && "text-brand-200")}
            >
                <span>{label}</span>
                <div className="relative w-4 h-6">
                    <ChevronUp size={16} className={cn("absolute top-0 left-0", isActive && direction === "asc" ? "text-brand-200" : "text-neutral-500")} />
                    <ChevronDown
                        size={16}
                        className={cn("absolute bottom-0 left-0", isActive && direction === "desc" ? "text-brand-200" : "text-neutral-500")}
                    />
                </div>
            </Button>
        );
    };

    return (
        <div className="flex items-center gap-2">
            {renderSortButton("volumes", "Volumes")}
            {renderSortButton("txns", "TXNS")}
        </div>
    );
});
