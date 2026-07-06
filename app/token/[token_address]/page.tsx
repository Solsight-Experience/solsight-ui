"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTokenDetail } from "@/features/token/hooks/token.hooks";
import { TokenHeader, TokenChart, TradingPanel, TokenTabs, AISummaryButton, AISummaryPanel } from "@/features/token/components";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useTokenUIStore } from "@/features/token/stores/token.stores";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function TokenDetailPage() {
    const params = useParams();
    const router = useRouter();
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
            <div className="min-h-[calc(100vh-65px)] bg-[var(--surface-page)] text-[var(--text-primary)] flex items-center justify-center px-4 relative overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-violet-600/5 blur-[120px] animate-float-orb pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-fuchsia-600/5 blur-[120px] animate-float-orb-2 pointer-events-none" />
                <div className="relative max-w-md w-full bg-transparent rounded-2xl p-8 sm:p-10 flex flex-col items-center text-center animate-fade-in">
                    <div className="relative w-36 h-36 mx-auto mb-6 flex items-center justify-center">
                        <div className="absolute inset-0 bg-violet-500/10 rounded-full blur-xl animate-neon-pulse" />
                        <div
                            className="absolute w-32 h-32 rounded-full border border-violet-500/15 animate-ping opacity-25"
                            style={{ animationDuration: "3s" }}
                        />
                        <div className="absolute w-24 h-24 rounded-full border border-violet-500/10" />
                        <div className="absolute">
                            <Search className="w-14 h-14 text-violet-400 drop-shadow-[0_0_8px_rgba(167,139,250,0.5)]" strokeWidth={1.5} />
                        </div>
                    </div>

                    <h1 className="text-xl font-bold text-white/90 mb-2">Token Not Found</h1>
                    <p className="text-xs text-white/50 leading-relaxed mb-6">
                        The requested token contract doesn&apos;t exist, isn&apos;t indexed, or could not be loaded from the network.
                    </p>

                    <Button
                        onClick={() => router.push("/")}
                        className="bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)] cursor-pointer"
                    >
                        Back to Home
                    </Button>
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
