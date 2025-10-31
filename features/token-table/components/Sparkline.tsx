"use client";

import { useId } from 'react';
import { TokenTableData } from '../config/types';

interface SparklineProps {
    points: TokenTableData['token']['priceHistory'];
}

const WIDTH = 96;
const HEIGHT = 40;
const PADDING = 4;

const Sparkline = ({ points }: SparklineProps) => {
    const gradientBaseId = useId();

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
                ? WIDTH / 2
                : (index / (points.length - 1)) * (WIDTH - PADDING * 2) + PADDING;
        const y = HEIGHT - PADDING - ((value - min) / range) * (HEIGHT - PADDING * 2);
        return [x, y];
    });

    const path = coordinates
        .map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`)
        .join(' ');

    const gradientId = `${gradientBaseId}-${trendIsPositive ? 'positive' : 'negative'}`;
    const strokeColor = trendIsPositive ? 'rgba(74, 222, 128, 0.95)' : 'rgba(248, 113, 113, 0.95)';
    const fillColor = trendIsPositive ? 'rgba(74, 222, 128, 0.12)' : 'rgba(248, 113, 113, 0.12)';

    const lastPoint = coordinates[coordinates.length - 1];
    const firstPoint = coordinates[0];

    return (
        <svg
            role="img"
            aria-hidden="true"
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="h-20 w-28 text-muted-foreground"
        >
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={fillColor} />
                    <stop offset="100%" stopColor="transparent" />
                </linearGradient>
            </defs>
            <path
                d={`${path} L${lastPoint[0].toFixed(2)},${HEIGHT - PADDING} L${firstPoint[0].toFixed(2)},${HEIGHT - PADDING} Z`}
                fill={`url(#${gradientId})`}
                stroke="none"
            />
            <path d={path} fill="none" stroke={strokeColor} strokeWidth={2} />
        </svg>
    );
};

export default Sparkline;
