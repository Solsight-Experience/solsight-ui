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

    useEffect(() => {
        setEnablePriceRuler(orderType === "limit");
    }, [orderType]);

    const handleRulerPriceChange = useCallback(
        (price: number) => {
            setLimitPrice(price.toString());
        },
        [setLimitPrice]
    );

    if (isLoading) {
        return (
            <div className="min-h-screen text-[var(--text-primary)]">
                <div className="border-b border-[var(--border-subtle)] p-4 animate-pulse">
                    <div className="max-w-7xl mx-auto flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[var(--surface-btn)]"></div>
                        <div className="flex flex-col gap-2">
                            <div className="h-6 w-32 bg-[var(--surface-btn)] rounded"></div>
                            <div className="h-4 w-48 bg-[var(--surface-btn)] rounded"></div>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto p-4">
                    <div className="h-96 bg-[var(--surface-btn)] rounded-lg"></div>
                </div>
            </div>
        );
    }

    if (error || !token) {
        return (
            <div className="min-h-screen text-[var(--text-primary)] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Token Not Found</h1>
                    <p className="text-[var(--text-muted)]">The token you&apos;re looking for doesn&apos;t exist or couldn&apos;t be loaded.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-65px)] overflow-hidden">
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

            <div className="flex flex-row flex-1 overflow-hidden bg-[var(--surface-page)] gap-2 p-2">
                {/* Left Column */}
                <div className="flex-1 overflow-hidden rounded-lg border border-[var(--border-faint)]">
                    <ResizablePanelGroup orientation="vertical" className="flex-col">
                        <ResizablePanel defaultSize={60} minSize={20} className="flex flex-col bg-[var(--surface-page)]">
                            <div className="flex-1 min-h-0">
                                <TokenChart
                                    tokenAddress={tokenAddress}
                                    isMulti={false}
                                    enablePriceRuler={enablePriceRuler}
                                    onRulerPriceChange={handleRulerPriceChange}
                                />
                            </div>
                        </ResizablePanel>

                        <ResizableHandle withHandle className="bg-[var(--surface-btn)] hover:bg-violet-500 transition-colors" />

                        <ResizablePanel defaultSize={40} minSize={20} className="flex flex-col bg-[var(--surface-page)] min-h-0">
                            <div className="flex-1 flex flex-col overflow-hidden">
                                <TokenTabs tokenAddress={tokenAddress} />
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </div>

                {/* Right Column */}
                <div className="w-[340px] flex-shrink-0 overflow-y-auto scrollbar-thin rounded-lg">
                    <TradingPanel token={token} />
                </div>
            </div>
        </div>
    );
}
