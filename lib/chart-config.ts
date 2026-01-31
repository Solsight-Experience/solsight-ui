import type {
  LineData,
  HistogramData,
  BarData,
  SingleValueData,
  CandlestickData
} from 'lightweight-charts';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
);

export default ChartJS;

export type ChartType =
  | 'candles'
  | 'line'
  | 'area'
  | 'bars'
  | 'baseline'
  | 'histogram';


export const toLineData = (data: CandlestickData[]): LineData[] =>
  data.map(d => ({ time: d.time, value: d.close }));

export const toAreaData = (data: CandlestickData[]): SingleValueData[] =>
  data.map(d => ({ time: d.time, value: d.close }));

export const toBaselineData = (data: CandlestickData[]): SingleValueData[] =>
  data.map(d => ({ time: d.time, value: d.close }));

export const toHistogramData = (data: CandlestickData[]): HistogramData[] =>
  data.map(d => ({
    time: d.time,
    value: Math.abs(d.close - d.open),
    color: d.close >= d.open ? '#22c55e' : '#ef4444',
  }));

export const toBarData = (data: CandlestickData[]): BarData[] =>
  data.map(d => ({
    time: d.time,
    open: d.open,
    high: d.high,
    low: d.low,
    close: d.close,
  }));