import React from "react";
import Image from "next/image";
import Link from "next/link";
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { currencyFormatter, percentFormatter } from "@/lib/formatters";

interface TokenBriefCardProps {
    data: {
        address: string;
        symbol: string;
        name: string;
        price?: number;
        priceChange24h?: number;
        marketCap?: number;
        logoUri?: string;
    };
}

export const TokenBriefCard: React.FC<TokenBriefCardProps> = ({ data }) => {
    const { symbol, name, logoUri, price, priceChange24h, marketCap, address } = data;
    const change = typeof priceChange24h === "number" ? priceChange24h : undefined;
    const isPositive = typeof change === "number" && change >= 0;

    return (
        <div data-testid="token-brief-card" className="rounded-xl border border-border/60 bg-background/60 backdrop-blur-sm overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-border/40 bg-muted/20">
                <div className="flex items-center gap-2.5">
                    {logoUri ? (
                        <Image src={logoUri} alt={symbol} width={36} height={36} className="rounded-full object-cover ring-1 ring-border/40" />
                    ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center text-sm font-bold text-violet-400">
                            {symbol?.[0] ?? "?"}
                        </div>
                    )}
                    <div>
                        <div className="font-semibold text-sm leading-none">{symbol}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[120px]">{name}</div>
                    </div>
                </div>

                <Link href={`/token/${address}`} className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors">
                    View
                    <ExternalLink className="w-3 h-3" />
                </Link>
            </div>

            <div className="grid grid-cols-3 divide-x divide-border/40">
                <div className="p-3 flex flex-col gap-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Price</span>
                    <span className="text-sm font-semibold font-mono">{typeof price === "number" ? currencyFormatter.format(price) : "—"}</span>
                </div>

                <div className="p-3 flex flex-col gap-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">24h</span>
                    {typeof change === "number" ? (
                        <div className={cn("flex items-center gap-0.5 text-sm font-semibold", isPositive ? "text-emerald-400" : "text-red-400")}>
                            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                            {percentFormatter.format(change)}
                        </div>
                    ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                    )}
                </div>

                <div className="p-3 flex flex-col gap-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">MCap</span>
                    <span className="text-sm font-semibold font-mono">
                        {typeof marketCap === "number" && marketCap > 0 ? currencyFormatter.format(marketCap) : "—"}
                    </span>
                </div>
            </div>
        </div>
    );
};
