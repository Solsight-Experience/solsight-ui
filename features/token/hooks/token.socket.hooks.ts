import { TokenSocketManager } from '../services/token.socket.services';
import { useEffect, useState } from 'react';
import type { Trade, TopTrader, Holder, ChartDataPoint, TokenDetail } from '../types/token.types';
import type { ChartInterval } from '@/lib/constants';
import { da } from 'date-fns/locale';

const socket = TokenSocketManager.getInstance();

export function useTokenDetailStream(address: string) {
  const [detail, setDetail] = useState<TokenDetail>();
  useEffect(() => {
    const dto = {
      domain: 'stats',
      resource: address,
      interval: '5s',
    };

    socket.onDomainEvent(dto, (data: TokenDetail) => {
      console.log('data', data);
      setDetail(data);
    });

    return () => {
      socket.unsubscribe(dto);
    };
  }, [address]);
  return detail;
}

export function useTradeStream(
  address: string,
  params?: {
    type?: 'all' | 'buy' | 'sell';
  }
) {
  const [trade, setTrade] = useState<Trade>();
  useEffect(() => {
    const dto = {
      domain: 'trades',
      resource: address,
      interval: '5s',
    };

    socket.onDomainEvent(dto, setTrade);

    return () => {
      socket.unsubscribe(dto);
    };
  }, [address]);

  return trade;
}

export function useTopTradersStream(
  address: string,
  timeFrame: '24h' | '7d' | '30d' | 'all' = '24h'
) {
  const [topTraders, setTopTraders] = useState<TopTrader>();
  useEffect(() => {
    const dto = {
      domain: 'top_traders',
      resource: address,
      interval: '5s',
    };

    socket.onDomainEvent(dto, (data: any) => {
      setTopTraders(data.data);
    });

    return () => {
      socket.unsubscribe(dto);
    };
  }, [address]);
  return topTraders;
}

export function useHoldersStream(address: string) {
  const [holders, setHolders] = useState<Holder>();
  useEffect(() => {
    const dto = {
      domain: 'holders',
      resource: address,
      interval: '5s',
    };

    socket.onDomainEvent(dto, (data: any) => {
      setHolders(data.data);
    });

    return () => {
      socket.unsubscribe(dto);
    };
  }, [address]);
  return holders;
}

export function useChartDataStream(address: string, interval: ChartInterval) {
  const [chart, setChart] = useState<ChartDataPoint>();

  useEffect(() => {
    const priceDto = {
      domain: 'price',
      resource: address,
      interval: '5s',
    };

    const volumeDto = {
      domain: 'volume',
      resource: address,
      interval: '5s',
    };

    socket.onDomainEvent(priceDto, ({ price, timestamp }) => {
      setChart((prev) => ({
        volume: prev?.volume || 0,
        price,
        timestamp,
      }));
    });

    socket.onDomainEvent(volumeDto, ({ volume, timestamp }) => {
      setChart((prev) => ({
        price: prev?.price || 0,
        volume,
        timestamp,
      }));
    });

    return () => {
      socket.unsubscribe(priceDto);
      socket.unsubscribe(volumeDto);
    };
  }, [address, interval]);

  return chart;
}
