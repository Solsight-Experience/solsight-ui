"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Maximize2, Minimize2 } from "lucide-react";
import { TokenChart } from "@/features/token/components";
import { Button } from "@/components/ui/button";

interface ChartCardProps {
    id: string;
    tokenAddress: string;
    symbol?: string;
    onRemove: () => void;
    isDragging?: boolean;
    onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
    onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
}

export const ChartCard: React.FC<ChartCardProps> = ({ id, tokenAddress, symbol, onRemove, isDragging, onDragStart, onDragOver, onDrop }) => {
    const router = useRouter();
    const [isFullscreen, setIsFullscreen] = useState(false);

    const displaySymbol = symbol || tokenAddress.slice(0, 6).toUpperCase();
    const shortAddress = `${tokenAddress.slice(0, 6)}...${tokenAddress.slice(-4)}`;

    const handleTokenClick = () => {
        router.push(`/token/${tokenAddress}`);
    };

    if (isFullscreen) {
        return (
            <div className="fixed inset-0 bg-[var(--surface-page)] z-50 flex flex-col">
                {/* Fullscreen header */}
                <div className="border-b border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 flex items-center justify-between">
                    <div className="font-semibold text-[var(--text-primary)] text-lg">{displaySymbol}</div>
                    <button onClick={() => setIsFullscreen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                        <Minimize2 className="w-5 h-5" />
                    </button>
                </div>

                {/* Fullscreen chart */}
                <div className="flex-1 overflow-auto">
                    <div className="h-full p-4">
                        <TokenChart tokenAddress={tokenAddress} isMulti={false} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            draggable
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            className={`border border-violet-500/20 rounded-lg hover:border-violet-500/40 transition-all duration-200 hover:shadow-lg hover:shadow-black/5 overflow-hidden flex flex-col h-[280px] cursor-grab active:cursor-grabbing bg-[var(--surface-card)] ${
                isDragging ? "opacity-50" : ""
            }`}
        >
            {/* Header */}
            <div className="border-b border-[var(--border-subtle)] px-4 py-3 flex items-center justify-between bg-[var(--surface-panel)]">
                <button
                    onClick={handleTokenClick}
                    className="flex flex-col min-w-0 text-left hover:text-violet-600 dark:hover:text-violet-400 transition-colors cursor-pointer"
                >
                    <div className="font-semibold text-[var(--text-primary)] hover:text-violet-600 dark:hover:text-violet-400 truncate">{displaySymbol}</div>
                    <div className="text-xs text-[var(--text-muted)] font-mono">{shortAddress}</div>
                </button>

                <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                        onClick={() => setIsFullscreen(true)}
                        className="p-1.5 hover:bg-[var(--surface-btn-hover)] rounded transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        title="Fullscreen"
                    >
                        <Maximize2 className="w-4 h-4" />
                    </button>

                    <button
                        onClick={onRemove}
                        className="p-1.5 hover:bg-red-500/10 rounded transition-colors text-[var(--text-muted)] hover:text-red-500 dark:hover:text-red-400"
                        title="Remove chart"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Chart body */}
            <div className="flex-1 overflow-hidden p-2">
                <TokenChart tokenAddress={tokenAddress} isMulti={true} />
            </div>
        </div>
    );
};
