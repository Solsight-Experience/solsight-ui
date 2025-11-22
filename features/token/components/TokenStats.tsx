import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatNumber } from '../utils/token.utils';
import type { TokenDetail } from '../types/token.types';

interface TokenStatsProps {
  token: TokenDetail;
}

const PriceChangeIndicator: React.FC<{ value: number }> = ({ value }) => {
  const isPositive = value >= 0;
  return (
    <span
      className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}
    >
      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {isPositive ? '+' : ''}
      {value.toFixed(2)}%
    </span>
  );
};

export const TokenStats: React.FC<TokenStatsProps> = ({ token }) => {
  const stats = [
    {
      label: 'Price',
      value: `$${token.price.toFixed(4)}`,
      change: token.price_change['24h'],
    },
    {
      label: 'Market Cap',
      value: formatNumber(token.market_cap),
      change: token.market_cap_change_24h,
    },
    {
      label: 'FDV',
      value: formatNumber(token.fdv),
    },
    {
      label: 'Liquidity',
      value: formatNumber(token.liquidity),
      change: token.liquidity_change_24h,
    },
    {
      label: '24h Volume',
      value: formatNumber(token.volume['24h']),
      change: token.volume_change_24h,
    },
    {
      label: 'Holders',
      value: token.holders.count.toLocaleString(),
      change: token.holders.change_24h,
    },
    {
      label: '24h Tx',
      value: `${(token.txns['24h'].total / 1000).toFixed(2)}K`,
      change: token.txns_change_24h,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-7 gap-4 p-4">
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col border border-gray-600 rounded-lg p-2">
          <span className="text-xs text-gray-400 mb-1">{stat.label}</span>
          <span className="text-lg font-bold">{stat.value}</span>
          {stat.change !== undefined && <PriceChangeIndicator value={stat.change} />}
        </div>
      ))}
    </div>
  );
};
