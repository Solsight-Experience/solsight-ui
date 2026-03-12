import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';

interface TokenBriefCardProps {
  data: {
    address: string;
    symbol: string;
    name: string;
    price?: number;
    priceChange24h?: number;
    marketCap?: number;
    logoUri?: string;
  };
}

const formatPrice = (price: number) => {
  if (price >= 1) return `$${price.toFixed(2)}`;
  return `$${price.toFixed(6)}`;
};

const formatChange = (change: number) => {
  const formatted = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
  const colorClass = change >= 0 ? 'text-green-500' : 'text-red-500';
  return { formatted, colorClass };
};

const formatMarketCap = (cap: number) => {
  if (cap >= 1_000_000_000) return `$${(cap / 1_000_000_000).toFixed(1)}B`;
  if (cap >= 1_000_000) return `$${(cap / 1_000_000).toFixed(1)}M`;
  if (cap >= 1_000) return `$${(cap / 1_000).toFixed(1)}K`;
  return `$${cap.toFixed(0)}`;
};

export const TokenBriefCard: React.FC<TokenBriefCardProps> = ({ data }) => {
  const { symbol, name, logoUri, price, priceChange24h, marketCap } = data;

  const change = typeof priceChange24h === 'number' ? priceChange24h : undefined;
  const cap = typeof marketCap === 'number' ? marketCap : undefined;

  return (
    <Card data-testid="token-brief-card" className="max-w-md">
      <CardHeader>
        <div className="flex items-center gap-4">
          {logoUri ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUri} alt={symbol} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-sm font-semibold text-gray-300">
              {symbol?.[0] ?? '?'}
            </div>
          )}

          <div className="flex flex-col">
            <CardTitle className="text-lg">{symbol}</CardTitle>
            <span className="text-sm text-gray-400">{name}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">Price</span>
            <span className="text-base font-medium">{typeof price === 'number' ? formatPrice(price) : '—'}</span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-400">24h</span>
            {typeof change === 'number' ? (
              <span className={`${formatChange(change).colorClass} font-medium`}>{formatChange(change).formatted}</span>
            ) : (
              <span className="text-sm text-gray-400">—</span>
            )}
          </div>
        </div>

        <div className="mt-4">
          <div className="text-xs text-gray-400">Market Cap</div>
          <div className="text-sm font-medium">{typeof cap === 'number' ? formatMarketCap(cap) : '—'}</div>
        </div>
      </CardContent>
    </Card>
  );
};
