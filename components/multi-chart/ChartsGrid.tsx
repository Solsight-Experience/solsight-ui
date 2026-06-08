"use client";

import React, { useState } from "react";
import { ChartCard } from "./ChartCard";
import type { TokenChartItem } from "@/features/multi-chart/types";

interface ChartsGridProps {
    charts: TokenChartItem[];
    onRemoveChart: (id: string) => void;
    onReorderCharts?: (charts: TokenChartItem[]) => void;
}

export const ChartsGrid: React.FC<ChartsGridProps> = ({ charts, onRemoveChart, onReorderCharts }) => {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (index: number, e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDrop = (targetIndex: number, e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOverIndex(null);

        if (draggedIndex === null || draggedIndex === targetIndex) {
            setDraggedIndex(null);
            return;
        }

        const newCharts = [...charts];
        const draggedChart = newCharts[draggedIndex];

        // Remove dragged chart
        newCharts.splice(draggedIndex, 1);
        // Insert at target position
        newCharts.splice(targetIndex, 0, draggedChart);

        setDraggedIndex(null);
        onReorderCharts?.(newCharts);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
            {charts.map((chart, index) => (
                <ChartCard
                    key={chart.id}
                    id={chart.id}
                    tokenAddress={chart.address}
                    symbol={chart.symbol}
                    onRemove={() => onRemoveChart(chart.id)}
                    isDragging={draggedIndex === index}
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(index, e)}
                    onDrop={(e) => handleDrop(index, e)}
                    onDragEnd={handleDragEnd}
                />
            ))}
        </div>
    );
};
