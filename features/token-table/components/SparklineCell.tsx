"use client";

import { memo, useEffect, useRef, useState } from "react";
import Sparkline from "./Sparkline";
import { useSparklineData } from "../hooks/useSparklineData";

interface SparklineCellProps {
    tokenAddress: string;
}

// Same footprint as the Sparkline svg (h-20 w-28) so rows don't shift while loading.
const SparklinePlaceholder = () => <div aria-hidden="true" className="h-20 w-28" />;

// Mounting this subscribes to the priceOHLC socket room; unmounting unsubscribes.
const LiveSparkline = ({ tokenAddress }: SparklineCellProps) => {
    const { points, isLoading } = useSparklineData(tokenAddress);

    if (isLoading || !points.length) {
        return <SparklinePlaceholder />;
    }

    return <Sparkline points={points} />;
};

/**
 * Sparkline table cell that only fetches chart data and streams live candles
 * while the row is visible in the viewport, keeping requests and socket rooms
 * bounded regardless of how far the infinite table has scrolled.
 */
const SparklineCell = memo<SparklineCellProps>(function SparklineCell({ tokenAddress }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const element = containerRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.1 });
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    return <div ref={containerRef}>{inView ? <LiveSparkline key={tokenAddress} tokenAddress={tokenAddress} /> : <SparklinePlaceholder />}</div>;
});

export default SparklineCell;
