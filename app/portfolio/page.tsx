"use client";

import React from "react";
import { Coins, ArrowRightLeft, LayoutDashboard, Sparkles } from "lucide-react";
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
        <div className="relative min-h-[calc(100vh-4rem)] bg-[#05050a] text-neutral-100 font-sans selection:bg-purple-500/30 overflow-hidden">
            {/* Animated slow pulse backdrop */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,50,220,0.15),rgba(255,255,255,0))] animate-pulse duration-[10000ms]"></div>

            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none z-0 mix-blend-screen"></div>

            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay z-0 pointer-events-none"></div>

            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] min-h-[calc(100vh-4rem)] max-w-[1800px] mx-auto z-10 relative">
                {/* Left Sidebar (Wallet & Filters) */}
                <div className="hidden lg:block relative z-10 border-r border-white/5 bg-[#090910]/80 backdrop-blur-3xl shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                    <PortfolioSidebar />
                </div>

                {/* Right Content */}
                <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-2 relative z-10 max-w-full overflow-x-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-white/5 animate-slide-in-from-top-2">
                        <div className="flex items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm flex items-center gap-2">Portfolio Dashboard</h1>
                            </div>
                        </div>
                    </div>

                    {/* Portfolio Dashboard Summary Cards */}
                    <div className="animate-slide-in-from-bottom-4 transition-all duration-500">
                        <PortfolioDashboard />
                    </div>

                    {/* Tabs Section */}
                    <div className="flex flex-col gap-6 mt-2 animate-slide-in-from-bottom-4 delay-100">
                        <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as "position" | "activity")}>
                            {/* Glassmorphic Tab List */}
                            <TabsList className="bg-[#0f0f16]/60 backdrop-blur-md border border-white/10 p-1.5 rounded-2xl shadow-inner inline-flex h-auto w-full md:w-auto">
                                <TabsTrigger
                                    value="position"
                                    className="px-6 py-2.5 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600/30 data-[state=active]:to-purple-500/20 data-[state=active]:text-white data-[state=active]:border-purple-500/30 border border-transparent text-gray-400 font-medium transition-all duration-300 w-full md:w-auto flex justify-center items-center gap-2"
                                >
                                    <Coins className="size-4" />
                                    Positions
                                </TabsTrigger>
                                <TabsTrigger
                                    value="activity"
                                    className="px-6 py-2.5 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600/30 data-[state=active]:to-cyan-500/20 data-[state=active]:text-white data-[state=active]:border-blue-500/30 border border-transparent text-gray-400 font-medium transition-all duration-300 w-full md:w-auto flex justify-center items-center gap-2"
                                >
                                    <ArrowRightLeft className="size-4" />
                                    Activity
                                </TabsTrigger>
                            </TabsList>

                            <div className="mt-6">
                                <TabsContent value="position" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <PositionsTab />
                                </TabsContent>

                                <TabsContent value="activity" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <ActivityTab />
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
}
