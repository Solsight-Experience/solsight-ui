import { LoadingSpinner } from "@/components/loading";
import { memo } from "react";
import { Star, Search, AlertTriangle } from "lucide-react";

interface EmptyStateProps {
    title?: string;
    message?: string;
    type?: "favorites" | "filters" | "error" | "default";
    action?: React.ReactNode;
    emptyStateForLoading?: boolean;
}

/**
 * EmptyState Component
 * Displays when no data is available (e.g., empty favourites list, filtered results)
 */
export const EmptyState = memo<EmptyStateProps>(function EmptyState({
    title,
    message = "Oops, it's empty!",
    type = "default",
    action,
    emptyStateForLoading = false
}) {
    if (emptyStateForLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 px-4">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const renderIllustration = () => {
        switch (type) {
            case "favorites":
                return (
                    <div className="relative flex items-center justify-center w-28 h-28 mb-4">
                        {/* Background glowing circle */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 to-fuchsia-500/15 rounded-full blur-xl animate-neon-pulse" />

                        {/* Concentric dashed rings */}
                        <div className="absolute w-24 h-24 rounded-full border border-violet-500/10 border-dashed animate-spin-slow" />
                        <div className="absolute w-16 h-16 rounded-full border border-violet-500/20" />
                        <div className="absolute">
                            <Star className="w-12 h-12 text-violet-400 fill-violet-400/20 drop-shadow-[0_0_8px_rgba(167,139,250,0.5)]" strokeWidth={1.5} />
                        </div>
                    </div>
                );
            case "filters":
                return (
                    <div className="relative flex items-center justify-center w-28 h-28 mb-4">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-violet-500/15 rounded-full blur-xl animate-neon-pulse" />
                        <div
                            className="absolute w-24 h-24 rounded-full border border-blue-500/15 animate-ping opacity-25"
                            style={{ animationDuration: "3s" }}
                        />
                        <div className="absolute w-20 h-20 rounded-full border border-blue-500/10" />
                        <div className="absolute">
                            <Search className="w-12 h-12 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" strokeWidth={1.5} />
                        </div>
                    </div>
                );
            case "error":
                return (
                    <div className="relative flex items-center justify-center w-28 h-28 mb-4">
                        <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/10 to-amber-500/15 rounded-full blur-xl" />
                        <div className="absolute w-20 h-20 rounded-full border border-rose-500/20" />
                        <div className="absolute">
                            <AlertTriangle className="w-12 h-12 text-rose-400 fill-rose-400/10 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" strokeWidth={1.5} />
                        </div>
                    </div>
                );
            default:
                return <div className="text-6xl font-bold text-brand-200/20 mb-4 select-none animate-pulse">404</div>;
        }
    };

    return (
        <div className="flex flex-col items-center justify-center py-20 px-6 min-h-[380px] w-full text-center">
            <div className="flex flex-col items-center max-w-sm w-full animate-fade-in p-8">
                {renderIllustration()}
                {title && <h4 className="text-lg font-semibold text-white/90 mb-1">{title}</h4>}
                <p className="text-xs text-white/50 leading-relaxed max-w-[280px]">{message}</p>
                {action && <div className="mt-6 w-full flex justify-center">{action}</div>}
            </div>
        </div>
    );
});
