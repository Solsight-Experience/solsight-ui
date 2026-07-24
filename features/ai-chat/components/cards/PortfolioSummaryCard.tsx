import * as React from "react";
import { Wallet, TrendingUp } from "lucide-react";
import { currencyFormatter } from "@/lib/formatters";
import { PORTFOLIO_ASSET_COLORS } from "@/lib/constants";

interface PortfolioSummaryCardProps {
    data: {
        total_balance_usd: number;
        total_balance_sol: number;
        top_tokens: Array<{
            name: string;
            symbol: string;
            value_usd: number;
        }>;
    };
}

export const PortfolioSummaryCard: React.FC<PortfolioSummaryCardProps> = ({ data }) => {
    const { total_balance_usd, total_balance_sol, top_tokens } = data;

    // Calculate percentage for donut chart and sort descending
    const sortedAllocation = [...top_tokens]
        .sort((a, b) => b.value_usd - a.value_usd)
        .map((token) => ({
            ...token,
            percent: total_balance_usd > 0 ? (token.value_usd / total_balance_usd) * 100 : 0
        }));

    const topThree = sortedAllocation.slice(0, 3);
    const topTotal = topThree.reduce((s, t) => s + t.value_usd, 0);
    const mainAsset = sortedAllocation.length > 0 ? sortedAllocation[0] : null;
    const circumference = 2 * Math.PI * 45; // radius = 45
    const assetColors = PORTFOLIO_ASSET_COLORS;

    return (
        <div
            data-testid="portfolio-summary-card"
            className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--text-primary)] overflow-hidden shadow-sm"
        >
            <div className="bg-gradient-to-br from-violet-500/10 via-transparent to-indigo-500/5 px-4 py-3 border-b border-[var(--border-faint)] flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-1">
                        <Wallet className="w-3 h-3 text-[var(--text-muted)]" />
                        Portfolio Overview
                    </div>
                    <div className="text-2xl font-bold tracking-tight truncate">{currencyFormatter.format(total_balance_usd)}</div>
                    <div className="text-sm font-semibold text-violet-600 dark:text-violet-400 mt-0.5 truncate">{total_balance_sol.toFixed(4)} SOL</div>
                </div>

                {mainAsset && (
                    <div className="relative w-16 h-16 shrink-0 transform hover:scale-105 transition-transform duration-300">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            {/* Track background */}
                            <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border-subtle)" strokeWidth="10" />
                            {sortedAllocation.slice(0, 3).map((item, index) => {
                                const startPercentage = sortedAllocation.slice(0, index).reduce((sum, a) => sum + a.percent, 0);
                                const offset = (circumference * startPercentage) / 100;
                                const dashArray = `${(circumference * item.percent) / 100} ${circumference}`;

                                return (
                                    <circle
                                        key={`${item.symbol}-${index}`}
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="none"
                                        stroke={assetColors[index % assetColors.length]}
                                        strokeWidth="10"
                                        strokeDasharray={dashArray}
                                        strokeDashoffset={-offset}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-out"
                                    />
                                );
                            })}
                        </svg>

                        {/* Center Value */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="text-xs font-extrabold text-[var(--text-primary)] leading-none">{mainAsset.percent.toFixed(0)}%</div>
                            <div className="text-[7px] font-bold text-violet-500 dark:text-violet-300/70 tracking-wider uppercase mt-0.5 leading-none">
                                {mainAsset.symbol}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {topThree.length > 0 && (
                <div className="p-3">
                    <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)] uppercase tracking-wide mb-2">
                        <TrendingUp className="w-3 h-3 text-[var(--text-muted)]" />
                        Top Holdings
                    </div>

                    <div className="space-y-2">
                        {topThree.map((token, idx) => {
                            const pct = topTotal > 0 ? (token.value_usd / topTotal) * 100 : 0;
                            const currentColor = assetColors[idx % assetColors.length];
                            return (
                                <div key={idx}>
                                    <div className="flex items-center justify-between gap-2 mb-1 min-w-0">
                                        <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: currentColor }} />
                                            <span className="text-xs font-medium shrink-0">{token.symbol}</span>
                                            <span className="text-[10px] text-[var(--text-muted)] truncate">{token.name}</span>
                                        </div>
                                        <span className="text-xs font-mono font-medium shrink-0">{currencyFormatter.format(token.value_usd)}</span>
                                    </div>
                                    <div className="h-1 rounded-full bg-[var(--surface-btn)] overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${pct}%`,
                                                backgroundColor: currentColor
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PortfolioSummaryCard;
