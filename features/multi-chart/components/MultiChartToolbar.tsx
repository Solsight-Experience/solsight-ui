"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MultiChartToolbarProps {
    chartCount: number;
    maxCharts: number;
    onAddChart: () => void;
    onClearAll: () => void;
}

export const MultiChartToolbar: React.FC<MultiChartToolbarProps> = ({ chartCount, maxCharts, onAddChart, onClearAll }) => {
    const canAddMore = chartCount < maxCharts;

    return (
        <div className="border-b border-[var(--border-subtle)] bg-[var(--surface-card)] backdrop-blur-sm sticky top-0 z-40">
            <div className="max-w-full px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Left: Title and count */}
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Multi Chart Viewer</h1>
                        <div className="text-sm text-[var(--text-muted)] bg-[var(--surface-btn)] px-3 py-1 rounded-full border border-[var(--border-subtle)]">
                            {chartCount} / {maxCharts}
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={onAddChart}
                            disabled={!canAddMore}
                            style={canAddMore ? { color: "white" } : undefined}
                            className={`flex items-center gap-2 ${
                                canAddMore
                                    ? "bg-violet-600 hover:bg-violet-700 border-0"
                                    : "bg-[var(--surface-btn)] text-[var(--text-disabled)] cursor-not-allowed border border-[var(--border-subtle)]"
                            }`}
                        >
                            <Plus className="w-4 h-4" />
                            <span className="text-sm font-medium">Add Chart</span>
                        </Button>

                        {chartCount > 0 && (
                            <Button
                                onClick={onClearAll}
                                variant="outline"
                                className="flex items-center gap-2 border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-500 dark:hover:text-red-400"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span className="text-sm font-medium">Clear All</span>
                            </Button>
                        )}
                    </div>
                </div>

                {!canAddMore && (
                    <div className="mt-3 text-s text-violet-600 dark:text-violet-400 border-violet-500/30 rounded px-3 py-2">
                        Maximum {maxCharts} charts allowed
                    </div>
                )}
            </div>
        </div>
    );
};
