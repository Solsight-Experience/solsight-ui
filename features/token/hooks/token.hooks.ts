import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tokenApi } from '../services/token.services';
import type {
  ChartData,
  ChartCandlePointDto,
  Holder,
  SwapPreviewRequest,
  TokenDetail,
  TopTrader,
  Trade,
} from '../types/token.types';
import {
  useChartDataStream,
  useHoldersStream,
  useTokenDetailStream,
  useTopTradersStream,
  useTradeStream,
} from './token.socket.hooks';
import { useEffect, useMemo, useState } from 'react';
import { ChartInterval } from '@/lib/constants';
import { generateCandleData } from '../utils/token.utils';
import type { CandlestickData, UTCTimestamp } from 'lightweight-charts';

// Query Keys
export const tokenKeys = {
  all: ['token'] as const,
  detail: (address: string) => [...tokenKeys.all, 'detail', address] as const,
  chart: (address: string, interval: string) =>
    [...tokenKeys.all, 'chart', address, interval] as const,
  trades: (address: string, params?: any) => [...tokenKeys.all, 'trades', address, params] as const,
  topTraders: (address: string, timeFrame: string) =>
    [...tokenKeys.all, 'top-traders', address, timeFrame] as const,
  holders: (address: string, params?: any) =>
    [...tokenKeys.all, 'holders', address, params] as const,
};

const normalizeCandlePoint = (
  point: ChartCandlePointDto,
): CandlestickData | null => {
  const rawTimestamp = Number(point.timestamp);
  const open = Number(point.open);
  const high = Number(point.high);
  const low = Number(point.low);
  const close = Number(point.close);

  if (
    !Number.isFinite(rawTimestamp) ||
    !Number.isFinite(open) ||
    !Number.isFinite(high) ||
    !Number.isFinite(low) ||
    !Number.isFinite(close)
  ) {
    return null;
  }

  const seconds =
    rawTimestamp > 10_000_000_000
      ? Math.floor(rawTimestamp / 1000)
      : Math.floor(rawTimestamp);

  if (seconds <= 0) {
    return null;
  }

  return {
    time: seconds as UTCTimestamp,
    open,
    high,
    low,
    close,
  };
};

const normalizeChartPoints = (
  points: ChartCandlePointDto[] | undefined,
): CandlestickData[] => {
  if (!points?.length) {
    return [];
  }

  const normalized = points
    .map(normalizeCandlePoint)
    .filter((point): point is CandlestickData => point !== null)
    .sort((a, b) => Number(a.time) - Number(b.time));

  return normalized;
};

// Hooks
export function useTokenDetail(address: string) {
  const initial = useQuery({
    queryKey: tokenKeys.detail(address),
    queryFn: () => tokenApi.getTokenDetail(address),
    enabled: !!address,
    staleTime: 10000, // 10 seconds
  });
  const newDetail = useTokenDetailStream(address);
  const [data, setData] = useState<TokenDetail>();

  useEffect(() => {
    if (initial.data) setData(initial.data);
  }, [initial.data]);

  useEffect(() => {
    if (!newDetail) return;
    if (!initial.data) return;
    setData((prev) => ({ ...prev, ...newDetail }));
  }, [newDetail]);

  return { ...initial, data };
}

export function useChartData(address: string, interval: string) {
  const initial = useQuery({
    queryKey: tokenKeys.chart(address, interval),
    queryFn: () =>
      tokenApi.getChartData(address, {
        interval,
        limit: 500,
      }),
    enabled: !!address && !!interval,
    staleTime: interval === '1m' ? 5000 : 30000,
  });

  const newPoint = useChartDataStream(address, interval as ChartInterval);

  // init data (batch / mock)
  const initPoints = useMemo(() => {
    if (initial.isError) {
      return generateCandleData(80);
    }
    return normalizeChartPoints(initial.data?.points);
  }, [initial.data, initial.isError]);

  return {
    ...initial,
    initPoints, // Candle[]
    newPoint, // Candle | undefined
  };
}

export function useTrades(
  address: string,
  params?: {
    limit?: number;
    offset?: number;
    type?: 'all' | 'buy' | 'sell';
  }
) {
  const initial = useQuery({
    queryKey: tokenKeys.trades(address, params),
    queryFn: () => tokenApi.getTrades(address, params),
    enabled: !!address,
    staleTime: 5000,
    // refetchInterval: 5000,
  });
  const newTrades = useTradeStream(address, params);
  const [data, setData] = useState<{ trades: Trade[] }>({ trades: [] });

  useEffect(() => {
    if (initial.data) setData(initial.data);
  }, [initial.data]);

  useEffect(() => {
    if (!newTrades || newTrades.length === 0) return;

    setData((prev) => {
      const existingHashes = new Set(prev.trades.map((t) => t.tx_hash));
      const uniqueNew = newTrades.filter((t) => !existingHashes.has(t.tx_hash));
      if (uniqueNew.length === 0) return prev;
      const sortedNew = uniqueNew.sort((a, b) => b.timestamp - a.timestamp);
      return { trades: [...sortedNew, ...prev.trades] };
    });
  }, [newTrades]);

  return { ...initial, data };
}

export function useTopTraders(address: string, timeFrame: '24h' | '7d' | '30d' | 'all' = '24h') {
  const initial = useQuery({
    queryKey: tokenKeys.topTraders(address, timeFrame),
    queryFn: () => tokenApi.getTopTraders(address, { time_frame: timeFrame, limit: 10 }),
    enabled: !!address,
    staleTime: 30000, // 30 seconds
  });
  const newTrader = useTopTradersStream(address, timeFrame);
  const [data, setData] = useState<{ traders: TopTrader[] }>({ traders: [] });

  useEffect(() => {
    if (initial.data) setData(initial.data);
  }, [initial.data, timeFrame]);

  useEffect(() => {
    if (!newTrader) return;

    setData((prev) => {
      return { traders: [newTrader, ...prev.traders].slice(0, 10) };
    });
  }, [newTrader, timeFrame]);
  console.log('data', data);
  return { ...initial, data };
}

export function useHolders(
  address: string,
  params?: {
    sort_by?: 'balance' | 'pnl' | 'bought' | 'sold';
    limit?: number;
    offset?: number;
  }
) {
  const initial = useQuery({
    queryKey: tokenKeys.holders(address, params),
    queryFn: () => tokenApi.getHolders(address, params),
    enabled: !!address,
    staleTime: 30000, // 30 seconds
  });
  const holderUpdate = useHoldersStream(address);
  const [data, setData] = useState<{ holders: Holder[] }>({ holders: [] });

  useEffect(() => {
    if (initial.data) setData(initial.data);
  }, [initial.data]);

  useEffect(() => {
    if (!holderUpdate) return;

    setData((prev) => {
      const existingMap = new Map(prev.holders.map((h) => [h.address, h]));

      // Remove holders that are no longer in top list
      for (const addr of holderUpdate.removed) {
        existingMap.delete(addr);
      }

      // Update or add changed holders
      for (const holder of holderUpdate.changed) {
        existingMap.set(holder.address, holder);
      }

      // Sort by balance descending and limit to configured amount
      const limit = params?.limit ?? 100;
      const sortedHolders = Array.from(existingMap.values())
        .sort((a, b) => b.balance - a.balance)
        .slice(0, limit);

      return { holders: sortedHolders };
    });
  }, [holderUpdate, params?.limit]);

  return { ...initial, data };
}

// Mutations
export function useSwapPreview(address: string) {
  return useMutation({
    mutationFn: (data: SwapPreviewRequest) => tokenApi.getSwapPreview(address, data),
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ address, isFavorite }: { address: string; isFavorite: boolean }) => {
      if (isFavorite) {
        return tokenApi.removeFavorite(address);
      } else {
        return tokenApi.addFavorite(address);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}
