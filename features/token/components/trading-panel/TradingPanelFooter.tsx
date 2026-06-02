"use client";

export function TradingPanelFooter() {
    return (
        <div className="flex items-center justify-between mt-4 text-xs text-[var(--text-muted)] border-t border-[var(--border-subtle)] pt-3">
            <span>Powered by Jupiter API</span>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span>Connected: Solana Mainnet</span>
            </div>
        </div>
    );
}
