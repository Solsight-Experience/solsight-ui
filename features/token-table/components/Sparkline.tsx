'use client';

import { memo, useId, useMemo } from 'react';
import { TokenTableData } from '../config/types';

interface SparklineProps {
    points: TokenTableData['token']['priceHistory'];
    width?: number;
    height?: number;
}

const DEFAULT_WIDTH = 96;
const DEFAULT_HEIGHT = 40;
const PADDING = 4;

/**
 * Sparkline Component
 * Displays a mini chart showing price trend over time
 */
const Sparkline = memo<SparklineProps>(function Sparkline({ 
    points, 
    width = DEFAULT_WIDTH, 
    height = DEFAULT_HEIGHT 
}) {
    const gradientBaseId = useId();

    const chartData = useMemo(() => {
        if (!points.length) {
            return null;
        }

        const max = Math.max(...points);
        const min = Math.min(...points);
        const range = max - min || 1;
        const trendIsPositive = points[points.length - 1] >= points[0];

        const coordinates = points.map((value, index) => {
            const x =
                points.length === 1
                    ? width / 2
                    : (index / (points.length - 1)) * (width - PADDING * 2) + PADDING;
            const y = height - PADDING - ((value - min) / range) * (height - PADDING * 2);
            return [x, y] as [number, number];
        });

        const path = coordinates
            .map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`)
            .join(' ');

        const strokeColor = trendIsPositive 
            ? 'rgba(74, 222, 128, 0.95)' 
            : 'rgba(248, 113, 113, 0.95)';
        const fillColor = trendIsPositive 
            ? 'rgba(74, 222, 128, 0.12)' 
            : 'rgba(248, 113, 113, 0.12)';

        const lastPoint = coordinates[coordinates.length - 1];
        const firstPoint = coordinates[0];

        return {
            path,
            trendIsPositive,
            strokeColor,
            fillColor,
            lastPoint,
            firstPoint,
        };
    }, [points, width, height]);

    if (!chartData) {
        return null;
    }

    const { path, trendIsPositive, strokeColor, fillColor, lastPoint, firstPoint } = chartData;
    const gradientId = `${gradientBaseId}-${trendIsPositive ? 'positive' : 'negative'}`;

    return (
        <svg
            role="img"
            aria-label={`Price trend ${trendIsPositive ? 'up' : 'down'}`}
            viewBox={`0 0 ${width} ${height}`}
            className="h-20 w-28 text-muted-foreground"
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
        </svg>
    );
});

export default Sparkline;
