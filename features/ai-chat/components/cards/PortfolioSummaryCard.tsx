import * as React from "react";
import { Wallet, TrendingUp } from "lucide-react";
import { currencyFormatter } from "@/lib/formatters";

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
    const topThree = top_tokens.slice(0, 3);
    const topTotal = topThree.reduce((s, t) => s + t.value_usd, 0);

    return (
        <div data-testid="portfolio-summary-card" className="rounded-xl border border-border/60 bg-background/60 backdrop-blur-sm overflow-hidden">
            <div className="bg-gradient-to-br from-violet-500/10 via-transparent to-indigo-500/5 px-4 py-3 border-b border-border/40">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Wallet className="w-3 h-3" />
                    Portfolio Overview
                </div>
                <div className="text-2xl font-bold tracking-tight">{currencyFormatter.format(total_balance_usd)}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{total_balance_sol.toFixed(4)} SOL</div>
            </div>

            {topThree.length > 0 && (
                <div className="p-3">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wide mb-2">
                        <TrendingUp className="w-3 h-3" />
                        Top Holdings
                    </div>

                    <div className="space-y-2">
                        {topThree.map((token, idx) => {
                            const pct = topTotal > 0 ? (token.value_usd / topTotal) * 100 : 0;
                            const colors = ["bg-violet-500", "bg-indigo-400", "bg-purple-400"];
                            return (
                                <div key={idx}>
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-2 h-2 rounded-full ${colors[idx]}`} />
                                            <span className="text-xs font-medium">{token.symbol}</span>
                                            <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">{token.name}</span>
                                        </div>
                                        <span className="text-xs font-mono font-medium">{currencyFormatter.format(token.value_usd)}</span>
                                    </div>
                                    <div className="h-1 rounded-full bg-muted/40 overflow-hidden">
                                        <div className={`h-full rounded-full ${colors[idx]} transition-all duration-500`} style={{ width: `${pct}%` }} />
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
