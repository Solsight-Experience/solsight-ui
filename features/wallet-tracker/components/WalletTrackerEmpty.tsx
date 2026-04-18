import React from "react";
import { Search } from "lucide-react";

export const WalletTrackerEmpty: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-[var(--text-muted)]">
            <Search className="size-12 opacity-30" />
            <div className="text-center">
                <p className="text-base font-medium text-[var(--text-secondary)]">No wallet selected</p>
                <p className="text-sm mt-1">Add a wallet address to your watchlist and select it to view details.</p>
            </div>
        </div>
    );
};
