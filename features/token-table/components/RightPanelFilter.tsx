import { memo, ReactElement, ReactNode } from 'react';
import { TimeFilters, TimeFilterValue } from './TimeFilters';
import { QuickBuyInput } from './QuickBuyInput';

/**
 * Allowed component types for the right panel filter
 * This restriction ensures UI consistency across different tabs
 */
type AllowedFilterComponent =
    | ReactElement<typeof TimeFilters>
    | ReactElement<typeof QuickBuyInput>
    | ReactElement<any>; // For custom filter components like SortPanel, CategorySearch, etc.

interface RightPanelFilterProps {
    /**
     * Filter components to render
     * Must be one of the allowed filter component types
     */
    children: AllowedFilterComponent | AllowedFilterComponent[];
}

/**
 * RightPanelFilter Component
 * Abstract container for filter components in the token table
 * Ensures consistent styling and layout across different tab filters
 */
export const RightPanelFilter = memo<RightPanelFilterProps>(function RightPanelFilter({
    children,
}) {
    return (
        <div className="flex items-center gap-[18px]">
            {children}
        </div>
    );
});
