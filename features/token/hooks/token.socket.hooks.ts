import { TokenSocketManager } from '../services/token.socket.services';
import { useEffect, useState } from 'react';
import type { Trade, TopTrader, Holder, ChartDataPoint } from '../types/token.types';
import type { ChartInterval, TradeTab } from '@/lib/constants';

const tokenSocketManager = TokenSocketManager.getInstance();

export function useTradeStream(
  address: string,
  params?: {
    type?: 'all' | 'buy' | 'sell';
  }
) {
  const [trade, setTrade] = useState<Trade>();
  useEffect(() => {
    tokenSocketManager.onTokenEvent(address, 'trades', setTrade);
    return () => {
      tokenSocketManager.offTokenEvents(address);
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
    tokenSocketManager.onTokenEvent(address, 'top_traders', setTopTraders);
    return () => {
      tokenSocketManager.offTokenEvents(address);
    };
  }, []);
  return topTraders;
}

export function useHoldersStream(address: string) {
  const [holders, setHolders] = useState<Holder>();
  useEffect(() => {
    tokenSocketManager.onTokenEvent(address, 'holders', setHolders);
    return () => {
      tokenSocketManager.offTokenEvents(address);
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

    tokenSocketManager.onTokenEvent(address, 'price', handlePrice);
    tokenSocketManager.onTokenEvent(address, 'volume', handleVolume);
    return () => {
      tokenSocketManager.offTokenEvents(address);
    };
  }, []);
  return chart;
}
