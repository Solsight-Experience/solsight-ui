import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useHolders } from '../hooks/token.hooks';
import { formatNumber, formatTokenAmount } from '../utils/token.utils';
import type { Holder } from '../types/token.types';

interface HoldersTableProps {
  tokenAddress: string;
}

const PriceChangeIndicator: React.FC<{ value: number }> = ({ value }) => {
  const isPositive = value >= 0;
  return (
    <span className={`flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {isPositive ? '+' : ''}
      {value.toFixed(2)}%
    </span>
  );
};

const HolderRow: React.FC<Holder & { rank: number }> = ({
  rank,
  address,
  name,
  balance,
  balance_percent,
  total_pnl,
  roi_percent,
}) => (
  <tr className="border-b border-gray-700 hover:bg-gray-800/50">
    <td className="py-3 px-4 text-sm font-semibold text-gray-400">#{rank}</td>
    <td className="py-3 px-4">
      <div className="flex flex-col gap-1">
        {name && <span className="text-sm font-semibold">{name}</span>}
        <code className="text-xs text-gray-400">{address}</code>
      </div>
    </td>
    <td className="py-3 px-4 text-sm">{formatTokenAmount(balance, 0)}</td>
    <td className="py-3 px-4 text-sm text-purple-400">{balance_percent.toFixed(2)}%</td>
    <td className="py-3 px-4">
      <span
        className={`text-sm font-semibold ${total_pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}
      >
        {total_pnl >= 0 ? '+' : ''}
        {formatNumber(total_pnl)}
      </span>
    </td>
    <td className="py-3 px-4">
      <PriceChangeIndicator value={roi_percent} />
    </td>
  </tr>
);

export const HoldersTable: React.FC<HoldersTableProps> = ({ tokenAddress }) => {
  const { data: holdersData, isLoading } = useHolders(tokenAddress, { limit: 100 });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-gray-800 rounded mb-2"></div>
        ))}
      </div>
    );
  }

  if (!holdersData?.holders || holdersData.holders.length === 0) {
    return <div className="text-center py-8 text-gray-400">No holder data available</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="text-base text-gray-500 border-b border-gray-600">
          <tr>
            <th className="pb-2 text-start px-4">Rank</th>
            <th className="pb-2 text-start px-4">Holder</th>
            <th className="pb-2 text-start px-4">Balance</th>
            <th className="pb-2 text-start px-4">%</th>
            <th className="pb-2 text-start px-4">Total PNL</th>
            <th className="pb-2 text-start px-4">ROI</th>
          </tr>
        </thead>
        <tbody>
          {holdersData.holders.map((holder, index) => (
            <HolderRow key={holder.address} rank={index + 1} {...holder} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
