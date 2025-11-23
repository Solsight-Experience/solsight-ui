import React, { useMemo } from 'react';
import { Maximize2 } from 'lucide-react';
import { useTokenUIStore } from '../stores/token.stores';
import { useChartData } from '../hooks/token.hooks';
import { formatTime, generateChartData } from '../utils/token.utils';
import { CHART_INTERVALS } from '@/lib/constants';

interface TokenChartProps {
  tokenAddress: string;
}

export const TokenChart: React.FC<TokenChartProps> = ({ tokenAddress }) => {
  const { chartInterval, setChartInterval } = useTokenUIStore();
  const { data: chartData, isLoading } = useChartData(tokenAddress, chartInterval);

  // Fallback to mock data if API data not available
  const displayData = useMemo(() => {
    return chartData?.points || generateChartData(60);
  }, [chartData]);

  if (isLoading) {
    return (
      <div className="border border-gray-700 rounded-lg p-4 animate-pulse">
        <div className="h-96 bg-gray-800 rounded"></div>
      </div>
    );
  }

  return (
    <div className="border border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {CHART_INTERVALS.map((interval) => (
            <button
              key={interval}
              onClick={() => setChartInterval(interval)}
              className={`px-3 py-1 rounded text-sm font-medium ${
                chartInterval === interval
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {interval}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-green-500 flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            LIVE • Updating
          </span>
          <button className="p-2 hover:bg-gray-800 rounded">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Simple Chart Visualization */}
      <div className="h-96 relative">
        <svg viewBox="0 0 800 400" className="w-full h-full">
          {/* Grid Lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={`grid-${i}`}
              x1="0"
              y1={i * 100}
              x2="800"
              y2={i * 100}
              stroke="#374151"
              strokeWidth="1"
              opacity="0.3"
            />
          ))}

          {/* Price Line */}
          <polyline
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="2"
            points={displayData
              .map((d, i) => {
                const x = (i / displayData.length) * 800;
                const minPrice = Math.min(...displayData.map((p) => p.price));
                const maxPrice = Math.max(...displayData.map((p) => p.price));
                const normalizedPrice = ((d.price - minPrice) / (maxPrice - minPrice)) * 400;
                const y = 400 - normalizedPrice;
                return `${x},${y}`;
              })
              .join(' ')}
          />

          {/* Gradient for line */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          {/* Area under curve */}
          <path
            d={`M 0,400 ${displayData
              .map((d, i) => {
                const x = (i / displayData.length) * 800;
                const minPrice = Math.min(...displayData.map((p) => p.price));
                const maxPrice = Math.max(...displayData.map((p) => p.price));
                const normalizedPrice = ((d.price - minPrice) / (maxPrice - minPrice)) * 400;
                const y = 400 - normalizedPrice;
                return `L ${x},${y}`;
              })
              .join(' ')} L 800,400 Z`}
            fill="url(#areaGradient)"
            opacity="0.1"
          />

          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#000000" />
            </linearGradient>
          </defs>
        </svg>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-gray-500 px-4">
          {displayData
            .filter((_, i) => i % 10 === 0)
            .map((d, i) => (
              <span key={i}>{formatTime(d.timestamp)}</span>
            ))}
        </div>
      </div>
    </div>
  );
};
