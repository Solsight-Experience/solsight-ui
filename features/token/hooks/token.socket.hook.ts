import { SocketManager } from '@/lib/socket-client';
import { useEffect, useState } from 'react';
import type { Trade, TopTrader, Holder, ChartDataPoint } from '../types/token.types';
import type { ChartInterval, TradeTab } from '@/lib/constants';

const socketManager = SocketManager.getInstance();

export function useTradeStream(
  address: string,
  params?: {
    type?: 'all' | 'buy' | 'sell';
  }
) {
  const [trade, setTrade] = useState<Trade>();
  useEffect(() => {
    socketManager.onTokenEvent(address, 'trades', setTrade);
    return () => {
      socketManager.offTokenEvents(address);
    };
  }, []);
  return trade;
}

export function useTopTradersStream(
  address: string,
  timeFrame: '24h' | '7d' | '30d' | 'all' = '24h'
) {
  const [topTraders, setTopTraders] = useState<TopTrader>();
  useEffect(() => {
    socketManager.onTokenEvent(address, 'top_traders', setTopTraders);
    return () => {
      socketManager.offTokenEvents(address);
    };
  }, []);
  return topTraders;
}

export function useHoldersStream(address: string) {
  const [holders, setHolders] = useState<Holder>();
  useEffect(() => {
    socketManager.onTokenEvent(address, 'holders', setHolders);
    return () => {
      socketManager.offTokenEvents(address);
    };
  }, []);
  return holders;
}

export function useChartDataStream(address: string, interval: ChartInterval) {
  const [chart, setChart] = useState<ChartDataPoint>();
  useEffect(() => {
    const handlePrice = ({ price, timestamp }: any) => {
      setChart((prev) => ({ volume: prev?.volume || 0, price, timestamp }));
    };
    const handleVolume = ({ volume, timestamp }: any) => {
      setChart((prev) => ({ price: prev?.price || 0, volume, timestamp }));
    };

    socketManager.onTokenEvent(address, 'price', handlePrice);
    socketManager.onTokenEvent(address, 'volume', handleVolume);
    return () => {
      socketManager.offTokenEvents(address);
    };
  }, []);
  return chart;
}
