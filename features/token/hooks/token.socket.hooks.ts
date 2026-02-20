import { TokenSocketManager } from '../services/token.socket.services';
import { useEffect, useState } from 'react';
import type {
  Trade,
  TradeStreamResponse,
  TopTrader,
  Holder,
  ChartDataPoint,
  TokenDetail,
} from '../types/token.types';
import type { ChartInterval } from '@/lib/constants';
import { CandlestickData, UTCTimestamp } from 'lightweight-charts';

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
  const [trades, setTrades] = useState<Trade[]>();
  useEffect(() => {
    const dto = {
      domain: 'trades',
      resource: address,
      interval: '5s',
    };

    socket.onDomainEvent(dto, (data: TradeStreamResponse) => {
      setTrades(data.trades);
    });

    return () => {
      socket.unsubscribe(dto);
    };
  }, [address]);

  return trades;
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
  const [chart, setChart] = useState<CandlestickData>();

  useEffect(() => {
    const priceDto = {
      domain: 'priceOHLC',
      resource: address,
      interval: '10s',
    };

    socket.onDomainEvent(priceDto, ({ priceOHLC, time }) => {
      setChart((prev) => ({
        open: priceOHLC.open,
        high: priceOHLC.high,
        low: priceOHLC.low,
        close: priceOHLC.close,
        time: time as UTCTimestamp,
      }));
    });

    return () => {
      socket.unsubscribe(priceDto);
    };
  }, [address, interval]);

  return chart;
}
