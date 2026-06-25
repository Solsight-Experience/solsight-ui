import React, { useState, useMemo } from "react";
import { Shield, Star, Copy, Check, TrendingUp, TrendingDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useToggleFavorite, useFavoriteTokens } from "../hooks/token.hooks";
import { copyToClipboard, formatNumber } from "../utils/token.utils";
import type { TokenDetail } from "../types/token.types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface TokenHeaderProps {
    token: TokenDetail;
    aiSummaryButton?: React.ReactNode;
}

const PriceChangeIndicator: React.FC<{ value: number }> = ({ value }) => {
    const isPositive = value >= 0;
    const numValue = Number(value);
    return (
        <span
            className={`flex items-center gap-0.5 text-xs font-medium ${isPositive ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}
        >
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isPositive ? "+" : ""}
            {numValue.toFixed(2)}%
        </span>
    );
};

export const TokenHeader: React.FC<TokenHeaderProps> = ({ token, aiSummaryButton }) => {
    const { user } = useAuth();
    const isLoggedIn = !!user;
    const { data: favoritesData } = useFavoriteTokens();
    const toggleFavoriteMutation = useToggleFavorite();

    const isTokenFavorite = useMemo(() => {
        if (!favoritesData || !Array.isArray(favoritesData)) return false;
        return favoritesData.some((fav) => fav.token_address === token.address);
    }, [favoritesData, token.address]);

    const [copied, setCopied] = useState(false);

    const handleFavoriteClick = () => {
        if (!isLoggedIn) {
            toast.info("Sign in to save favourite tokens.");
            return;
        }
        toggleFavoriteMutation.mutate({
            address: token.address,
            isFavorite: isTokenFavorite
        });
    };

    const handleCopyAddress = async () => {
        const success = await copyToClipboard(token.address);
        if (success) {
            setCopied(true);
            toast.success("Address copied to clipboard!");
            setTimeout(() => setCopied(false), 1500);
        }
    };

    return (
        <div className="border-b border-[var(--border-faint)] bg-[var(--surface-card)] px-4 py-2 flex-shrink-0 flex items-center justify-between">
            {/* Left: Identity */}
            <div className="flex items-center gap-3">
                <Avatar>
                    <AvatarImage src={token.logo_uri} alt={token.symbol} />
                    <AvatarFallback>{token.symbol.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                        <h1 className="text-sm font-bold text-[var(--text-primary)]">{token.symbol}</h1>
                        <span className="text-xs text-[var(--text-muted)]">{token.name}</span>
                        {token.audit.is_verified && <Shield className="w-3.5 h-3.5 text-blue-500" />}
                        <button onClick={handleFavoriteClick} className="hover:scale-110 transition-transform ml-1">
                            <Star className={`w-3.5 h-3.5 ${isTokenFavorite ? "fill-yellow-500 text-yellow-500" : "text-[var(--text-muted)]"}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Middle: Stats Row */}
            <div className="flex items-center gap-6 text-sm flex-1 ml-8">
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-[var(--text-primary)]">${Number(token.price).toFixed(4)}</span>
                    {token.price_change?.["24h"] !== undefined && <PriceChangeIndicator value={token.price_change["24h"]} />}
                </div>

                <div className="flex items-center gap-1.5">
                    <span className="text-xs text-[var(--text-muted)]">MCap</span>
                    <span className="font-semibold text-[var(--text-primary)]">{formatNumber(token.market_cap)}</span>
                </div>

                <div className="flex items-center gap-1.5">
                    <span className="text-xs text-[var(--text-muted)]">Liq</span>
                    <span className="font-semibold text-[var(--text-primary)]">{formatNumber(token.liquidity)}</span>
                </div>

                <div className="flex items-center gap-1.5">
                    <span className="text-xs text-[var(--text-muted)]">24h Vol</span>
                    <span className="font-semibold text-[var(--text-primary)]">{formatNumber(token.volume?.["24h"])}</span>
                </div>

                <div className="flex items-center gap-1.5">
                    <span className="text-xs text-[var(--text-muted)]">FDV</span>
                    <span className="font-semibold text-[var(--text-primary)]">{formatNumber(token.fdv)}</span>
                </div>

                <div className="flex items-center gap-1.5">
                    <span className="text-xs text-[var(--text-muted)]">Holders</span>
                    <span className="font-semibold text-[var(--text-primary)]">{token.holders?.count ? token.holders.count.toLocaleString() : "-"}</span>
                </div>

                <div className="flex items-center gap-1.5">
                    <span className="text-xs text-[var(--text-muted)]">24h Tx</span>
                    <span className="font-semibold text-[var(--text-primary)]">
                        {token.txns?.["24h"]?.total ? `${(Number(token.txns["24h"].total) / 1000).toFixed(2)}K` : "-"}
                    </span>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                {aiSummaryButton}
                <Button
                    variant="secondary"
                    onClick={handleCopyAddress}
                    className="h-7 px-2.5 text-xs font-normal text-[var(--text-muted)] hover:text-[var(--text-primary)] gap-1.5 rounded border border-[var(--border-subtle)]"
                >
                    {copied ? <Check className="w-3 h-3 size-3 text-emerald-400" /> : <Copy className="w-3 h-3 size-3" />}
                    {token.address.slice(0, 6)}...{token.address.slice(-4)}
                </Button>
            </div>
        </div>
    );
};
