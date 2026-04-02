import React from "react";
import { Shield, Star, Copy, TrendingUp, TrendingDown } from "lucide-react";
import { useTokenUIStore } from "../stores/token.stores";
import { useToggleFavorite } from "../hooks/token.hooks";
import { copyToClipboard, formatNumber } from "../utils/token.utils";
import type { TokenDetail } from "../types/token.types";

interface TokenHeaderProps {
    token: TokenDetail;
    aiSummaryButton?: React.ReactNode;
}

const PriceChangeIndicator: React.FC<{ value: number }> = ({ value }) => {
    const isPositive = value >= 0;
    const numValue = Number(value);
    return (
        <span className={`flex items-center gap-0.5 text-xs font-medium ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isPositive ? "+" : ""}
            {numValue.toFixed(2)}%
        </span>
    );
};

export const TokenHeader: React.FC<TokenHeaderProps> = ({ token, aiSummaryButton }) => {
    const { isFavorite, toggleFavorite } = useTokenUIStore();
    const toggleFavoriteMutation = useToggleFavorite();
    const isTokenFavorite = isFavorite(token.address);

    const handleFavoriteClick = () => {
        toggleFavorite(token.address);
        toggleFavoriteMutation.mutate({
            address: token.address,
            isFavorite: isTokenFavorite
        });
    };

    const handleCopyAddress = async () => {
        const success = await copyToClipboard(token.address);
        if (success) {
            console.log("Address copied!");
        }
    };

    return (
        <div className="border-b border-gray-800 bg-black px-4 py-2 flex-shrink-0 flex items-center justify-between">
            {/* Left Box: Identity */}
            <div className="flex items-center gap-3">
                <img src={token.logo_uri} alt={token.symbol} className="w-8 h-8 rounded-full" />
                <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                        <h1 className="text-sm font-bold text-gray-100">{token.symbol}</h1>
                        <span className="text-xs text-gray-400">{token.name}</span>
                        {token.audit.is_verified && <Shield className="w-3.5 h-3.5 text-blue-500" />}
                        <button onClick={handleFavoriteClick} className="hover:scale-110 transition-transform ml-1">
                            <Star className={`w-3.5 h-3.5 ${isTokenFavorite ? "fill-yellow-500 text-yellow-500" : "text-gray-500"}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Middle Box: Compact Stats Row */}
            <div className="flex items-center gap-6 text-sm flex-1 ml-8">
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-100">${Number(token.price).toFixed(4)}</span>
                    {token.price_change?.["24h"] !== undefined && <PriceChangeIndicator value={token.price_change["24h"]} />}
                </div>

                <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-500">MCap</span>
                    <span className="font-semibold text-gray-200">{formatNumber(token.market_cap)}</span>
                </div>

                <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-500">Liq</span>
                    <span className="font-semibold text-gray-200">{formatNumber(token.liquidity)}</span>
                </div>

                <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-500">24h Vol</span>
                    <span className="font-semibold text-gray-200">{formatNumber(token.volume?.["24h"])}</span>
                </div>

                <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-500">FDV</span>
                    <span className="font-semibold text-gray-200">{formatNumber(token.fdv)}</span>
                </div>

                <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-500">Holders</span>
                    <span className="font-semibold text-gray-200">{token.holders?.count ? token.holders.count.toLocaleString() : "-"}</span>
                </div>

                <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-500">24h Tx</span>
                    <span className="font-semibold text-gray-200">
                        {token.txns?.["24h"]?.total ? `${(Number(token.txns["24h"].total) / 1000).toFixed(2)}K` : "-"}
                    </span>
                </div>
            </div>

            {/* Right Box: Actions */}
            <div className="flex items-center gap-3">
                {aiSummaryButton}
                <button
                    onClick={handleCopyAddress}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors bg-gray-800/50 px-2 py-1 rounded"
                >
                    <Copy className="w-3 h-3" />
                    {token.address.slice(0, 4)}...{token.address.slice(-4)}
                </button>
            </div>
        </div>
    );
};
