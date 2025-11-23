import { LoadingSpinner } from '@/components/loading';
import { memo } from 'react';

interface EmptyStateProps {
    message?: string;
    emptyStateForLoading?: boolean;
}

/**
 * EmptyState Component
 * Displays when no data is available (e.g., empty favourites list, filtered results)
 */
export const EmptyState = memo<EmptyStateProps>(function EmptyState({
    message = "Oops, it's empty!",
    emptyStateForLoading = false,
}) {
    return (
        <div className="flex flex-col items-center justify-center py-24 px-4">
            <div className="text-center space-y-4 flex flex-col items-center">
                {/* TODO: Replace with actual 404 image when provided */}
                {emptyStateForLoading ? (
                    <LoadingSpinner size="lg" />
                ) : (
                    <div className="text-6xl font-bold text-brand-200/20">404</div>
                )}
                <h3 className="text-2xl font-semibold text-muted-foreground">
                    {message}
                </h3>
                <p className="text-sm text-muted-foreground/60">
                    There's nothing to show right now
                </p>
            </div>
        </div>
    );
});
