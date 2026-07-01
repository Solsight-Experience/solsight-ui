"use client";

import React, { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { MultiChartToolbar } from "./MultiChartToolbar";
import { AddTokenChartModal } from "./AddTokenChartModal";
import { ChartsGrid } from "./ChartsGrid";
import type { TokenChartItem } from "@/features/multi-chart/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const MAX_CHARTS = 6;
const CHARTS_STORAGE_KEY = "solsight_charts";

function ChartsGridSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-72 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] animate-pulse" />
            ))}
        </div>
    );
}

export const MultiChartPage: React.FC = () => {
    const [charts, setCharts] = useState<TokenChartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // Load charts from localStorage on mount
    useEffect(() => {
        try {
            const savedCharts = localStorage.getItem(CHARTS_STORAGE_KEY);
            if (savedCharts) {
                setCharts(JSON.parse(savedCharts));
            }
        } catch (error) {
            console.error("Failed to load charts from localStorage:", error);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    // Save charts to localStorage whenever they change (after initial load)
    useEffect(() => {
        if (!isLoaded) return;

        try {
            localStorage.setItem(CHARTS_STORAGE_KEY, JSON.stringify(charts));
        } catch (error) {
            console.error("Failed to save charts to localStorage:", error);
        }
    }, [charts, isLoaded]);

    const handleAddChart = useCallback(
        (tokenAddress: string, symbol?: string) => {
            // Check for duplicate before updating state so we can show feedback
            if (charts.some((chart) => chart.address === tokenAddress)) {
                toast.warning(`${symbol || "This token"} is already on your dashboard.`);
                return; // Keep modal open
            }

            if (charts.length >= MAX_CHARTS) {
                toast.warning(`Maximum ${MAX_CHARTS} charts reached.`);
                return; // Keep modal open
            }

            const newChart: TokenChartItem = {
                id: `${tokenAddress}-${Date.now()}`,
                address: tokenAddress,
                symbol: symbol || "Unknown"
            };

            setCharts((prev) => [...prev, newChart]);
            setIsAddModalOpen(false);
        },
        [charts]
    );

    const handleRemoveChart = useCallback((id: string) => {
        setCharts((prev) => prev.filter((chart) => chart.id !== id));
    }, []);

    const handleConfirmClearAll = useCallback(() => {
        setDeleteDialogOpen(true);
    }, [setDeleteDialogOpen]);
    const handleClearAll = useCallback(() => {
        setCharts([]);
        setDeleteDialogOpen(false);
    }, [setDeleteDialogOpen, setCharts]);

    const handleReorderCharts = useCallback((reorderedCharts: TokenChartItem[]) => {
        setCharts(reorderedCharts);
    }, []);

    return (
        <div className="min-h-screen">
            {/* Toolbar */}
            <div className="px-4 sm:px-6 lg:px-8 py-4">
                <MultiChartToolbar chartCount={charts.length} maxCharts={MAX_CHARTS} onAddChart={() => setIsAddModalOpen(true)} onClearAll={handleConfirmClearAll} />
            </div>

            {/* Content Area */}
            <div className="px-4 sm:px-6 lg:px-8">
                {!isLoaded ? (
                    <ChartsGridSkeleton />
                ) : charts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-96">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-[var(--surface-btn)] border border-[var(--border-subtle)] flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-[var(--text-disabled)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">No charts yet</h2>
                            <p className="text-[var(--text-muted)] mb-4">Add a token chart to get started monitoring its price and volume</p>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="inline-flex items-center px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 font-medium transition-colors"
                                style={{ color: "white" }}
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Your First Chart
                            </button>
                        </div>
                    </div>
                ) : (
                    <ChartsGrid charts={charts} onRemoveChart={handleRemoveChart} onReorderCharts={handleReorderCharts} />
                )}
            </div>

            {/* Add Token Modal */}
            <AddTokenChartModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAddChart={handleAddChart}
                maxCharts={MAX_CHARTS}
                currentCharts={charts.length}
            />
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="border-[var(--border-subtle)] bg-[var(--surface-card)]">
                    <DialogHeader>
                        <DialogTitle className="text-[var(--text-primary)] text-lg">Delete Wallet</DialogTitle>
                        <DialogDescription className="text-[var(--text-muted)] text-sm">
                            Are you sure you want to delete this wallet? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleClearAll}
                            className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-600/80 dark:hover:bg-red-600"
                        >
                            Clear All
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
