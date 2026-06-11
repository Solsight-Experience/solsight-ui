"use client";

import React from "react";
import { Coins, ArrowRightLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PortfolioSidebar } from "@/features/portfolio/components/Portfoliosidebar";
import { PortfolioDashboard } from "@/features/portfolio/components/Portfoliodashboard";
import { PositionsTab } from "@/features/portfolio/components/Positionstab";
import { ActivityTab } from "@/features/portfolio/components/Activitytab";
import { usePortfolioUIStore } from "@/features/portfolio/stores/portfolioUIStore";

import "@/lib/chart-config";

export default function PortfolioPage() {
    const { currentTab, setCurrentTab } = usePortfolioUIStore();

    return (
        <div className="relative min-h-[calc(100vh-82px)] bg-[var(--surface-page)] text-[var(--text-primary)] font-sans overflow-hidden">
            {/* Subtle background glow — decorative, works in both themes */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-500/[0.07] blur-[100px] rounded-full" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] min-h-[calc(100vh-82px)] max-w-[1800px] mx-auto z-10 relative">
                {/* ── Sidebar ── */}
                <aside className="hidden lg:block border-r border-[var(--border-faint)] bg-[var(--surface-glass)] backdrop-blur-xl">
                    <PortfolioSidebar />
                </aside>

                {/* ── Main content ── */}
                <div className="flex flex-col gap-6 p-6 lg:p-8 overflow-x-hidden">
                    {/* Page header */}
                    <div className="flex items-center justify-between border-b border-[var(--border-faint)] pb-5">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="h-[13px] w-[3px] rounded-full bg-violet-500" />
                                <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-violet-400 dark:text-violet-400">Overview</span>
                            </div>
                            <h1 className="text-[22px] font-bold tracking-tight leading-tight">Portfolio</h1>
                            <p className="text-[12.5px] text-[var(--text-muted)] mt-0.5">Track balances, positions, and activity across your wallets</p>
                        </div>
                    </div>

                    {/* Dashboard summary cards */}
                    <PortfolioDashboard />

                    {/* Tabs */}
                    <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as "position" | "activity")}>
                        <TabsList
                            className="inline-flex h-auto p-1 gap-1
                                            bg-[var(--surface-btn)] border border-[var(--border-subtle)] rounded-xl"
                        >
                            <TabsTrigger
                                value="position"
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg
                                           text-[11.5px] font-semibold tracking-[0.03em]
                                           text-[var(--text-muted)]
                                           data-[state=active]:bg-violet-500/15
                                           data-[state=active]:text-violet-600 dark:data-[state=active]:text-violet-300
                                           data-[state=active]:border data-[state=active]:border-violet-500/30
                                           transition-all duration-150"
                            >
                                <Coins size={13} />
                                Positions
                            </TabsTrigger>
                            <TabsTrigger
                                value="activity"
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg
                                           text-[11.5px] font-semibold tracking-[0.03em]
                                           text-[var(--text-muted)]
                                           data-[state=active]:bg-blue-500/10
                                           data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-300
                                           data-[state=active]:border data-[state=active]:border-blue-500/25
                                           transition-all duration-150"
                            >
                                <ArrowRightLeft size={13} />
                                Activity
                            </TabsTrigger>
                        </TabsList>

                        <div className="mt-4">
                            <TabsContent value="position" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <PositionsTab />
                            </TabsContent>
                            <TabsContent value="activity" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <ActivityTab />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
