"use client";

import { memo, useCallback, useId, useMemo, useState } from "react";
import { TokenTableData } from "../config/types";
import { currencyFormatter } from "@/lib/formatters";

interface SparklineProps {
    points: TokenTableData["token"]["priceHistory"];
    width?: number;
    height?: number;
}

const DEFAULT_WIDTH = 96;
const DEFAULT_HEIGHT = 40;
const PADDING = 4;

/**
 * Sparkline Component
 * Displays a mini chart showing price trend over time.
 * Hovering shows the price at the nearest point.
 */
const Sparkline = memo<SparklineProps>(function Sparkline({ points, width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT }) {
    const gradientBaseId = useId();
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);

    const chartData = useMemo(() => {
        if (!points.length) {
            return null;
        }

        const max = Math.max(...points);
        const min = Math.min(...points);
        const range = max - min || 1;
        const trendIsPositive = points[points.length - 1] >= points[0];

        const coordinates = points.map((value, index) => {
            const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * (width - PADDING * 2) + PADDING;
            const y = height - PADDING - ((value - min) / range) * (height - PADDING * 2);
            return [x, y] as [number, number];
        });

        const path = coordinates.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");

        const strokeColor = trendIsPositive ? "rgba(74, 222, 128, 0.95)" : "rgba(248, 113, 113, 0.95)";
        const fillColor = trendIsPositive ? "rgba(74, 222, 128, 0.12)" : "rgba(248, 113, 113, 0.12)";

        const lastPoint = coordinates[coordinates.length - 1];
        const firstPoint = coordinates[0];

        return {
            path,
            trendIsPositive,
            strokeColor,
            fillColor,
            lastPoint,
            firstPoint,
            coordinates
        };
    }, [points, width, height]);

    const handleMouseMove = useCallback(
        (event: React.MouseEvent<SVGSVGElement>) => {
            if (points.length < 2) {
                setHoverIndex(points.length === 1 ? 0 : null);
                return;
            }
            // Convert mouse position from rendered pixels to viewBox units, then to the nearest point index.
            const rect = event.currentTarget.getBoundingClientRect();
            const viewX = ((event.clientX - rect.left) / rect.width) * width;
            const ratio = (viewX - PADDING) / (width - PADDING * 2);
            const index = Math.round(ratio * (points.length - 1));
            setHoverIndex(Math.min(Math.max(index, 0), points.length - 1));
        },
        [points.length, width]
    );

    const handleMouseLeave = useCallback(() => setHoverIndex(null), []);

    if (!chartData) {
        return null;
    }

    const { path, trendIsPositive, strokeColor, fillColor, lastPoint, firstPoint, coordinates } = chartData;
    const gradientId = `${gradientBaseId}-${trendIsPositive ? "positive" : "negative"}`;

    const hoverPoint = hoverIndex !== null ? coordinates[hoverIndex] : null;
    const hoverValue = hoverIndex !== null ? points[hoverIndex] : null;

    return (
        <div className="relative inline-flex">
            <svg
                role="img"
                aria-label={`Price trend ${trendIsPositive ? "up" : "down"}`}
                viewBox={`0 0 ${width} ${height}`}
                className="h-20 w-28 cursor-crosshair text-muted-foreground"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={fillColor} />
                        <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                </defs>
                <path
                    d={`${path} L${lastPoint[0].toFixed(2)},${height - PADDING} L${firstPoint[0].toFixed(2)},${height - PADDING} Z`}
                    fill={`url(#${gradientId})`}
                    stroke="none"
                />
                <path d={path} fill="none" stroke={strokeColor} strokeWidth={2} />
                {hoverPoint ? (
                    <g pointerEvents="none">
                        <line
                            x1={hoverPoint[0]}
                            y1={PADDING}
                            x2={hoverPoint[0]}
                            y2={height - PADDING}
                            stroke="rgba(255,255,255,0.25)"
                            strokeWidth={1}
                            strokeDasharray="2 2"
                        />
                        <circle cx={hoverPoint[0]} cy={hoverPoint[1]} r={2.5} fill={strokeColor} stroke="rgba(0,0,0,0.5)" strokeWidth={1} />
                    </g>
                ) : null}
            </svg>
            {hoverPoint && hoverValue !== null ? (
                <div
                    className="pointer-events-none absolute -top-1 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border border-border bg-popover px-1.5 py-0.5 text-[10px] font-medium text-popover-foreground shadow-md"
                    style={{ left: `${(hoverPoint[0] / width) * 100}%` }}
                >
                    {currencyFormatter.format(hoverValue)}
                </div>
            ) : null}
        </div>
    );
});

export default Sparkline;
