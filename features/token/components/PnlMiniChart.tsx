'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { createChart, ColorType, AreaSeries, UTCTimestamp } from 'lightweight-charts';

interface PnlDataPoint {
  time: UTCTimestamp;
  value: number;
}

interface PnlMiniChartProps {
  data: PnlDataPoint[];
  height?: number;
  isLoading?: boolean;
}

export const PnlMiniChart: React.FC<PnlMiniChartProps> = ({
  data,
  height = 120,
  isLoading = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const seriesRef = useRef<ReturnType<ReturnType<typeof createChart>['addSeries']> | null>(null);

  // Determine if PnL is positive overall (for color theming)
  const isProfitable = useMemo(() => {
    if (data.length < 2) return true;
    return data[data.length - 1].value >= data[0].value;
  }, [data]);

  // Chart colors based on profitability
  const chartColors = useMemo(() => ({
    lineColor: isProfitable ? '#22c55e' : '#ef4444',
    topColor: isProfitable ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
    bottomColor: isProfitable ? 'rgba(34, 197, 94, 0.0)' : 'rgba(239, 68, 68, 0.0)',
  }), [isProfitable]);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;

    // Create chart only once
    if (!chartRef.current) {
      chartRef.current = createChart(containerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: '#6b7280',
          fontSize: 10,
        },
        grid: {
          vertLines: { visible: false },
          horzLines: { color: 'rgba(255, 255, 255, 0.05)', style: 1 },
        },
        width: containerRef.current.clientWidth,
        height,
        rightPriceScale: {
          visible: true,
          borderVisible: false,
          scaleMargins: { top: 0.1, bottom: 0.1 },
        },
        timeScale: {
          visible: true,
          borderVisible: false,
          timeVisible: false,
          secondsVisible: false,
        },
        crosshair: {
          vertLine: {
            color: 'rgba(255, 255, 255, 0.2)',
            width: 1,
            style: 2,
            labelVisible: false,
          },
          horzLine: {
            color: 'rgba(255, 255, 255, 0.2)',
            width: 1,
            style: 2,
            labelVisible: true,
          },
        },
        handleScroll: false,
        handleScale: false,
      });

      // Add area series
      seriesRef.current = chartRef.current.addSeries(AreaSeries, {
        lineColor: chartColors.lineColor,
        topColor: chartColors.topColor,
        bottomColor: chartColors.bottomColor,
        lineWidth: 2,
        priceFormat: {
          type: 'custom',
          formatter: (price: number) => {
            const sign = price >= 0 ? '+' : '';
            if (Math.abs(price) >= 1000) {
              return `${sign}$${(price / 1000).toFixed(1)}K`;
            }
            return `${sign}$${price.toFixed(2)}`;
          },
        },
      });
    }

    // Update series data
    if (seriesRef.current) {
      seriesRef.current.setData(data);

      // Update colors
      seriesRef.current.applyOptions({
        lineColor: chartColors.lineColor,
        topColor: chartColors.topColor,
        bottomColor: chartColors.bottomColor,
      });

      // Fit content
      chartRef.current?.timeScale().fitContent();
    }

    // Handle resize
    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [data, chartColors, height]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        seriesRef.current = null;
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center bg-[#1a1a2e] rounded-lg animate-pulse"
        style={{ height }}
      >
        <div className="text-xs text-gray-500">Loading chart...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-[#1a1a2e] rounded-lg"
        style={{ height }}
      >
        <div className="text-center">
          <svg className="w-6 h-6 mx-auto text-gray-600 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          <p className="text-xs text-gray-500">No PnL data</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full bg-[#1a1a2e] rounded-lg overflow-hidden"
      style={{ height }}
    />
  );
};

// Helper to generate mock PnL data for testing
export const generateMockPnlData = (days: number = 30): PnlDataPoint[] => {
  const data: PnlDataPoint[] = [];
  const now = Math.floor(Date.now() / 1000);
  const daySeconds = 86400;

  let cumulativePnl = 0;

  for (let i = days; i >= 0; i--) {
    const time = (now - i * daySeconds) as UTCTimestamp;
    // Random daily PnL between -50 and +100
    const dailyPnl = (Math.random() - 0.4) * 150;
    cumulativePnl += dailyPnl;

    data.push({
      time,
      value: cumulativePnl,
    });
  }

  return data;
};
