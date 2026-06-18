"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiClient } from "@/lib/api-client";
import { formatCurrency, percentFormatter } from "@/lib/formatters";

interface CategoryDetail {
    id: string;
    name: string;
    market_cap: number;
    market_cap_change_24h: number;
    content: string;
    top_3_coins_id: string[];
    top_3_coins: string[];
    volume_24h: number;
    updated_at: string;
}

interface CategoryDetailModalProps {
    categorySlug: string | null;
    onClose: () => void;
}

export function CategoryDetailModal({ categorySlug, onClose }: CategoryDetailModalProps) {
    const [category, setCategory] = useState<CategoryDetail | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!categorySlug) {
            setCategory(null);
            return;
        }

        const fetchCategoryDetail = async () => {
            setIsLoading(true);
            setError(null);
            setCategory(null);
            try {
                const data = await apiClient.get<CategoryDetail>(`/discovery/categories/${categorySlug}`);
                setCategory(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load category details");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategoryDetail();
    }, [categorySlug]);

    const formatCoinName = (id: string) => {
        return id
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    if (!categorySlug) return null;

    return (
        <Dialog open={!!category} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{category ? category.name : "Category Details"}</DialogTitle>
                </DialogHeader>

                {isLoading && (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                    </div>
                )}

                {error && <div className="text-red-500 text-center py-4">{error}</div>}

                {category && (
                    <div className="space-y-6">
                        <div>
                            <p className="text-gray-300">{category.content}</p>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-gray-400">Market Cap</p>
                                <p className="text-lg font-semibold text-white">{formatCurrency(category.market_cap)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Market Cap Change (24h)</p>
                                <p className={`text-lg font-semibold ${category.market_cap_change_24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                                    {percentFormatter.format(category.market_cap_change_24h)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Volume (24h)</p>
                                <p className="text-lg font-semibold text-white">{formatCurrency(category.volume_24h)}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-white mb-4">Top 3 Coins</h3>
                            <div className="space-y-3">
                                {category.top_3_coins_id.map((coinId, index) => (
                                    <div key={coinId} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={category.top_3_coins[index]} alt={coinId} />
                                            <AvatarFallback>{coinId.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-white">{formatCoinName(coinId)}</p>
                                            <p className="text-sm text-gray-400">#{index + 1}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="text-sm text-gray-400">Last updated: {new Date(category.updated_at).toLocaleString()}</div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
