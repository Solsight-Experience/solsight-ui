import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatNumber } from "../utils/token.utils";
import type { TokenDetail } from "../types/token.types";

interface TokenStatsProps {
    token: TokenDetail | null | undefined;
}

const PriceChangeIndicator: React.FC<{ value: number }> = ({ value }) => {
    const isPositive = value >= 0;
    return (
        <div className="flex items-center gap-1 mt-2">
            <span className={`flex items-center gap-1  font-semibold transition-all duration-300 ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {isPositive ? "+" : ""}
                {value.toFixed(2)}%
            </span>
        </div>
    );
};

interface StatCardProps {
    label: string;
    value: string;
    change?: number;
    isUpdating?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, change, isUpdating }) => {
    return (
        <div
            className={`
        flex flex-col border rounded-xl p-4 transition-all duration-300
        ${isUpdating ? "border-purple-500 bg-black shadow-lg shadow-purple-500/20" : "border-purple-600 bg-black hover:border-purple-500"}
        hover:shadow-md hover:shadow-purple-500/10
      `}
        >
            <span className="text-xs font-medium text-purple-400 uppercase tracking-wide mb-2">{label}</span>
            <span className={`text-lg sm:text-xl font-bold text-purple-300 transition-all duration-300 ${isUpdating ? "scale-105" : "scale-100"}`}>
                {value}
            </span>
            {change !== undefined && <PriceChangeIndicator value={change} />}
        </div>
    );
};

export const TokenStats: React.FC<TokenStatsProps> = ({ token }) => {
    const [updatingLabels, setUpdatingLabels] = useState<Set<string>>(new Set());
    const [previousPrice, setPreviousPrice] = useState<number | null>(null);

    // Track updates for animation effect
    useEffect(() => {
        if (!token) return;

        if (previousPrice !== null && token.price !== previousPrice) {
            setUpdatingLabels((prev) => new Set(prev).add("Price"));
            const timer = setTimeout(() => {
                setUpdatingLabels((prev) => {
                    const next = new Set(prev);
                    next.delete("Price");
                    return next;
                });
            }, 600);
            return () => clearTimeout(timer);
        }

        setPreviousPrice(token.price);
    }, [token?.price, previousPrice]);

    // Show empty state
    if (!token) {
        return (
            <div className="max-w-7xl mx-auto p-4">
                <div className="flex items-center justify-center h-40 border border-purple-100 rounded-xl bg-black">
                    <div className="text-center">
                        <p className="text-purple-400 text-sm font-medium">No token data available</p>
                        <p className="text-purple-500 text-xs mt-1">Select a token to view statistics</p>
                    </div>
                </div>
            </div>
        );
    }

    const stats = [
        {
            label: "Price",
            value: `$${token.price.toFixed(4)}`,
            change: token.price_change?.["24h"]
        },
        {
            label: "Market Cap",
            value: formatNumber(token.market_cap),
            change: token.market_cap_change_24h
        },
        {
            label: "FDV",
            value: formatNumber(token.fdv)
        },
        {
            label: "Liquidity",
            value: formatNumber(token.liquidity),
            change: token.liquidity_change_24h
        },
        {
            label: "24h Volume",
            value: formatNumber(token.volume?.["24h"]),
            change: token.volume_change_24h
        },
        {
            label: "Holders",
            value: token.holders?.count ? token.holders.count.toLocaleString() : "-",
            change: token.holders?.change_24h
        },
        {
            label: "24h Tx",
            value: token.txns?.["24h"]?.total ? `${(token.txns["24h"].total / 1000).toFixed(2)}K` : "-",
            change: token.txns_change_24h
        }
    ];

    return (
        <div className="max-w-7xl mx-auto p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
                {stats.map((stat) => (
                    <StatCard key={stat.label} label={stat.label} value={stat.value} change={stat.change} isUpdating={updatingLabels.has(stat.label)} />
                ))}
            </div>
        </div>
    );
};
