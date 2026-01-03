import React, { useEffect, useRef, useMemo, useState } from 'react';
import {
  createChart,
  ColorType,
  LineSeries,
  AreaSeries,
  BarSeries,
  CandlestickSeries,
  BaselineSeries,
  HistogramSeries,
} from 'lightweight-charts';
import {
  toLineData,
  toAreaData,
  toBarData,
  toHistogramData,
  toBaselineData,
} from '../../../lib/chart-config';
import { Maximize2 } from 'lucide-react';
import { useTokenUIStore } from '../stores/token.stores';
import { useChartData } from '../hooks/token.hooks';
import { generateChartData, generateCandleData } from '../utils/token.utils';
import { CHART_INTERVALS } from '@/lib/constants';
interface TokenChartProps {
  tokenAddress: string;
}
const SOURCE_DATA = generateCandleData(80);
export const TokenChart = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const [type, setType] = useState<'candles' | 'line' | 'area' | 'bars' | 'baseline' | 'histogram'>('candles');
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      height: 420,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: '#1f2933' },
        horzLines: { color: '#1f2933' },
      },
      timeScale: { timeVisible: true },
    });

    chartRef.current = chart;
    chart.timeScale().fitContent();

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;

    // remove old series
    if (seriesRef.current) {
      chartRef.current.removeSeries(seriesRef.current);
      seriesRef.current = null;
    }

    const chart = chartRef.current;
    let series;

    switch (type) {
      case 'candles':
        series = chart.addSeries(CandlestickSeries, {
          upColor: '#22c55e',
          downColor: '#ef4444',
          borderVisible: false,
          wickUpColor: '#22c55e',
          wickDownColor: '#ef4444',
        });
        series.setData(SOURCE_DATA);
        break;

      case 'line':
        series = chart.addSeries(LineSeries, { color: '#3b82f6' });
        series.setData(toLineData(SOURCE_DATA));
        break;

      case 'area':
        series = chart.addSeries(AreaSeries, {
          lineColor: '#3b82f6',
          topColor: 'rgba(59,130,246,0.4)',
          bottomColor: 'rgba(59,130,246,0.05)',
        });
        series.setData(toAreaData(SOURCE_DATA));
        break;

      case 'bars':
        series = chart.addSeries(BarSeries, {
          upColor: '#22c55e',
          downColor: '#ef4444',
        });
        series.setData(toBarData(SOURCE_DATA));
        break;

      case 'baseline':
        series = chart.addSeries(BaselineSeries, {
          baseValue: { type: 'price', price: 50 },
          topLineColor: '#22c55e',
          bottomLineColor: '#ef4444',
          topFillColor1: 'rgba(34,197,94,0.4)',
          topFillColor2: 'rgba(34,197,94,0.1)',
          bottomFillColor1: 'rgba(239,68,68,0.1)',
          bottomFillColor2: 'rgba(239,68,68,0.4)',
        });
        series.setData(toBaselineData(SOURCE_DATA));
        break;

      case 'histogram':
        series = chart.addSeries(HistogramSeries, { priceFormat: { type: 'volume' } });
        series.setData(toHistogramData(SOURCE_DATA));
        break;
    }

    seriesRef.current = series;
    chart.timeScale().fitContent();
  }, [type]);

  return (
    <>
      <div className="flex gap-2 mb-2">
        {['candles', 'line', 'bars', 'area', 'baseline', 'histogram'].map(t => (
          <button
            key={t}
            onClick={() => setType(t as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 capitalize ${t === type
                ? 'bg-gray-800 text-white shadow-md hover:bg-gray-900 active'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-sm'
              }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div ref={containerRef} className="w-full h-[420px]" />
    </>
  );
};