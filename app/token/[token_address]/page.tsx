"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useTokenDetail } from "@/features/token/hooks/token.hooks";
import { TokenHeader, TokenChart, TradingPanel, TokenTabs, AISummaryButton, AISummaryPanel } from "@/features/token/components";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useTokenUIStore } from "@/features/token/stores/token.stores";

export default function TokenDetailPage() {
    const params = useParams();
    const tokenAddress = params?.token_address as string;
    const [isAISummaryOpen, setIsAISummaryOpen] = useState(false);
    const [enablePriceRuler, setEnablePriceRuler] = useState(false);

    const { data: token, isLoading, error } = useTokenDetail(tokenAddress);
    const { setLimitPrice, orderType } = useTokenUIStore();

    // Enable price ruler when limit order is selected
    useEffect(() => {
        setEnablePriceRuler(orderType === "limit");
    }, [orderType]);

    // Handle ruler price change from chart
    const handleRulerPriceChange = useCallback(
        (price: number) => {
            setLimitPrice(price.toString());
        },
        [setLimitPrice]
    );

    if (isLoading) {
        return (
            <div className="min-h-screen text-white">
                <div className="border-b border-gray-700 p-4 animate-pulse">
                    <div className="max-w-7xl mx-auto flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gray-700"></div>
                        <div className="flex flex-col gap-2">
                            <div className="h-6 w-32 bg-gray-700 rounded"></div>
                            <div className="h-4 w-48 bg-gray-700 rounded"></div>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto p-4">
                    <div className="h-96 bg-gray-800 rounded-lg"></div>
                </div>
            </div>
        );
    }

    if (error || !token) {
        return (
            <div className="min-h-screen text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Token Not Found</h1>
                    <p className="text-gray-400">The token you&apos;re looking for doesn&apos;t exist or couldn&apos;t be loaded.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-65px)] overflow-hidden">
            {/* Header (Now includes stats) */}
            <TokenHeader token={token} aiSummaryButton={<AISummaryButton onClick={() => setIsAISummaryOpen(true)} />} />
            {isAISummaryOpen && token && (
                <AISummaryPanel
                    isOpen={isAISummaryOpen}
                    onToggle={() => setIsAISummaryOpen(false)}
                    tokenAddress={tokenAddress}
                    tokenName={token.name}
                    tokenSymbol={token.symbol}
                />
            )}

            {/* Main Content - Two Column Full Height Layout */}
            <div className="flex flex-row flex-1 overflow-hidden bg-black">
                {/* Left Column - Chart & Tabs */}
                <div className="flex-1 overflow-hidden border-r border-gray-800">
                    <ResizablePanelGroup orientation="vertical" className="flex-col">
                        {/* Chart */}
                        <ResizablePanel defaultSize={60} minSize={20} className="flex flex-col bg-black scrollbar-thin">
                            <div className="flex-1 min-h-0">
                                <TokenChart
                                    tokenAddress={tokenAddress}
                                    isMulti={false}
                                    enablePriceRuler={enablePriceRuler}
                                    onRulerPriceChange={handleRulerPriceChange}
                                />
                            </div>
                        </ResizablePanel>

                        <ResizableHandle withHandle className="bg-gray-800 hover:bg-purple-500 transition-colors" />

                        {/* Tabs */}
                        <ResizablePanel defaultSize={40} minSize={20} className="flex flex-col bg-black min-h-0">
                            <div className="flex-1 flex flex-col overflow-hidden">
                                <TokenTabs tokenAddress={tokenAddress} />
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </div>

                {/* Right Column - Trading Panel (Fixed Width) */}
                <div className="w-[340px] flex-shrink-0 bg-black overflow-y-auto scrollbar-thin">
                    <TradingPanel token={token} />
                </div>
            </div>
        </div>
    );
}
