import React from "react";
import { Shield, Star, Copy } from "lucide-react";
import { useToggleFavorite } from "../hooks/token.hooks";
import { copyToClipboard } from "../utils/token.utils";
import type { TokenDetail } from "../types/token.types";

interface TokenHeaderProps {
    token: TokenDetail;
    aiSummaryButton?: React.ReactNode;
    isFavorite: boolean;
    onToggleFavorite: (address: string) => void;
}

export const TokenHeader: React.FC<TokenHeaderProps> = ({ token, aiSummaryButton, isFavorite, onToggleFavorite }) => {
    const toggleFavoriteMutation = useToggleFavorite();
    const isTokenFavorite = isFavorite;

    const handleFavoriteClick = () => {
        onToggleFavorite(token.address);
        toggleFavoriteMutation.mutate({
            address: token.address,
            isFavorite: isTokenFavorite
        });
    };

    const handleCopyAddress = async () => {
        const success = await copyToClipboard(token.address);
        if (success) {
            // You can add a toast notification here
            console.log("Address copied!");
        }
    };

    return (
        <div className="border-b border-gray-700 p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <img src={token.logo_uri} alt={token.symbol} className="w-12 h-12 rounded-full" />
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold">{token.symbol}</h1>
                            {token.audit.is_verified && <Shield className="w-5 h-5 text-blue-500" />}
                            <button onClick={handleFavoriteClick} className="hover:scale-110 transition-transform">
                                <Star className={`w-5 h-5 ${isTokenFavorite ? "fill-yellow-500 text-yellow-500" : "text-gray-400"}`} />
                            </button>
                            {aiSummaryButton && <div className="ml-2">{aiSummaryButton}</div>}
                        </div>
                        <span className="text-sm text-gray-400">{token.name}</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={handleCopyAddress} className="px-4 py-2 rounded-lg border border-gray-600 hover:border-gray-500 flex items-center gap-2">
                        <Copy className="w-4 h-4" />
                        {token.address.slice(0, 4)}...{token.address.slice(-4)}
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-500 text-sm font-semibold">LIVE</span>
                        <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-500 text-sm font-semibold">Solana Mainnet</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
