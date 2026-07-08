import { useEffect } from "react";

/**
 * Binds the global ⌘K / Ctrl+K shortcut to `onTrigger`, preventing the
 * browser's default Ctrl+K (focus address bar) behavior.
 */
export function useSearchShortcut(onTrigger: () => void): void {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                onTrigger();
            }
        };

        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [onTrigger]);
}
