import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

    return (
        <Card data-testid="portfolio-summary-card">
            <CardHeader>
                <CardTitle>Portfolio Overview</CardTitle>
            </CardHeader>

            <CardContent>
                <div className="flex flex-col gap-1">
                    <div className="text-3xl font-bold">${total_balance_usd.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">{total_balance_sol.toFixed(4)} SOL</div>
                </div>

                <div className="mt-4">
                    <div className="text-sm font-medium text-muted-foreground">Top tokens</div>
                    <div className="mt-2 space-y-2">
                        {top_tokens.slice(0, 3).map((token, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-sm font-semibold">{token.name}</span>
                                    <span className="text-xs text-muted-foreground">{token.symbol}</span>
                                </div>
                                <div className="text-sm font-medium">${token.value_usd.toFixed(2)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default PortfolioSummaryCard;
