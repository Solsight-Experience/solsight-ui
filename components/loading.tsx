import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
    className?: string;
    size?: "sm" | "md" | "lg";
}

const sizeMap = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
};

/**
 * Loading Spinner Component
 * Displays an animated loading indicator
 */
export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
    return <Loader2 className={cn("animate-spin text-primary", sizeMap[size], className)} aria-label="Loading" />;
}

interface LoadingProps {
    message?: string;
    fullScreen?: boolean;
}

/**
 * Loading Component
 * Displays a centered loading state with optional message
 */
export function Loading({ message = "Loading...", fullScreen = false }: LoadingProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center gap-4", fullScreen ? "min-h-screen" : "min-h-[400px]")} role="status" aria-live="polite">
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground">{message}</p>
        </div>
    );
}
