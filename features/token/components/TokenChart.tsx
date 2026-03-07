import React, { useEffect, useRef, useState } from 'react';
import {
  createChart,
  ColorType,
  CandlestickData,
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
import { useTokenUIStore } from '../stores/token.stores';
import { useChartData } from '../hooks/token.hooks';

interface TokenChartProps {
  tokenAddress: string;
}

export const TokenChart: React.FC<TokenChartProps> = ({ tokenAddress }) => {
  const { chartInterval } = useTokenUIStore();
  const { initPoints, newPoint } = useChartData(tokenAddress, chartInterval);

  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const isInitRef = useRef(false);
  const dataRef = useRef<CandlestickData[]>([]);

  const [type, setType] = useState<'candles' | 'line' | 'area' | 'bars' | 'baseline' | 'histogram'>(
    'candles'
  );

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

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      isInitRef.current = false;
      dataRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;

    if (seriesRef.current) {
      chartRef.current.removeSeries(seriesRef.current);
      seriesRef.current = null;
      isInitRef.current = false;
    }

    const chart = chartRef.current;

    switch (type) {
      case 'candles':
        seriesRef.current = chart.addSeries(CandlestickSeries, {
          upColor: '#22c55e',
          downColor: '#ef4444',
          borderVisible: false,
          wickUpColor: '#22c55e',
          wickDownColor: '#ef4444',
        });
        break;
      case 'line':
        seriesRef.current = chart.addSeries(LineSeries, { color: '#3b82f6' });
        break;
      case 'area':
        seriesRef.current = chart.addSeries(AreaSeries, {
          lineColor: '#3b82f6',
          topColor: 'rgba(59,130,246,0.4)',
          bottomColor: 'rgba(59,130,246,0.05)',
        });
        break;
      case 'bars':
        seriesRef.current = chart.addSeries(BarSeries, {
          upColor: '#22c55e',
          downColor: '#ef4444',
        });
        break;
      case 'baseline':
        seriesRef.current = chart.addSeries(BaselineSeries, {
          baseValue: { type: 'price', price: 50 },
          topLineColor: '#22c55e',
          bottomLineColor: '#ef4444',
          topFillColor1: 'rgba(34,197,94,0.4)',
          topFillColor2: 'rgba(34,197,94,0.1)',
          bottomFillColor1: 'rgba(239,68,68,0.1)',
          bottomFillColor2: 'rgba(239,68,68,0.4)',
        });
        break;
      case 'histogram':
        seriesRef.current = chart.addSeries(HistogramSeries, {
          priceFormat: { type: 'volume' },
        });
        break;
    }

    if (dataRef.current.length) {
      switch (type) {
        case 'candles':
          seriesRef.current.setData(dataRef.current);
          break;
        case 'line':
          seriesRef.current.setData(toLineData(dataRef.current));
          break;
        case 'area':
          seriesRef.current.setData(toAreaData(dataRef.current));
          break;
        case 'bars':
          seriesRef.current.setData(toBarData(dataRef.current));
          break;
        case 'baseline':
          seriesRef.current.setData(toBaselineData(dataRef.current));
          break;
        case 'histogram':
          seriesRef.current.setData(toHistogramData(dataRef.current));
          break;
      }
      isInitRef.current = true;
    }
  }, [type]);

  useEffect(() => {
    if (!seriesRef.current) return;
    if (!initPoints?.length) return;
    if (dataRef.current.length) return;

    dataRef.current = [...initPoints];

    switch (type) {
      case 'candles':
        seriesRef.current.setData(dataRef.current);
        break;
      case 'line':
        seriesRef.current.setData(toLineData(dataRef.current));
        break;
      case 'area':
        seriesRef.current.setData(toAreaData(dataRef.current));
        break;
      case 'bars':
        seriesRef.current.setData(toBarData(dataRef.current));
        break;
      case 'baseline':
        seriesRef.current.setData(toBaselineData(dataRef.current));
        break;
      case 'histogram':
        seriesRef.current.setData(toHistogramData(dataRef.current));
        break;
    }

    isInitRef.current = true;
    chartRef.current?.timeScale().fitContent();
  }, [initPoints, type]);

  useEffect(() => {
    if (!seriesRef.current) return;
    if (!newPoint) return;
    if (!isInitRef.current) return;

    const last = dataRef.current[dataRef.current.length - 1];

    if (last && last.time === newPoint.time) {
      dataRef.current[dataRef.current.length - 1] = newPoint;
    } else {
      dataRef.current.push(newPoint);
    }

    switch (type) {
      case 'candles':
        seriesRef.current.update(newPoint);
        break;
      case 'line':
        seriesRef.current.update(toLineData([newPoint])[0]);
        break;
      case 'area':
        seriesRef.current.update(toAreaData([newPoint])[0]);
        break;
      case 'bars':
        seriesRef.current.update(toBarData([newPoint])[0]);
        break;
      case 'baseline':
        seriesRef.current.update(toBaselineData([newPoint])[0]);
        break;
      case 'histogram':
        seriesRef.current.update(toHistogramData([newPoint])[0]);
        break;
    }
  }, [newPoint, type]);

  return (
    <>
      <div className="flex gap-2 mb-2">
        {['candles', 'line', 'bars', 'area', 'baseline', 'histogram'].map((t) => (
          <button
            key={t}
            onClick={() => setType(t as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 capitalize ${
              t === type
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
