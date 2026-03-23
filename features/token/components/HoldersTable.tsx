import React, { useState, useEffect } from 'react';
import { useHolders } from '../hooks/token.hooks';
import { formatNumber, formatTokenAmount, formatTimeAgo } from '../utils/token.utils';
import type { Holder } from '../types/token.types';
import { WalletHoverCard } from './WalletHoverCard';

const FUNDING_ICONS: Record<string, string> = {
  Binance: '🔶',
  Coinbase: '🔵',
  Kraken: '🟣',
  OKX: '⚫',
  Bybit: '🟡',
  KuCoin: '🟢',
  Huobi: '🔴',
  Gate: '⚪',
};

const ACCOUNT_TYPE_STYLES: Record<Holder['account_type'], string> = {
  WALLET: 'text-blue-400',
  LP: 'text-purple-400',
  DEV: 'text-yellow-400',
  BURN: 'text-red-500',
  CEX: 'text-orange-400',
};

const AccountTypeIcon: React.FC<{ type: Holder['account_type'] }> = ({ type }) => {
  const labels: Record<Holder['account_type'], string> = {
    WALLET: 'W',
    LP: 'LP',
    DEV: 'DEV',
    BURN: '🔥',
    CEX: 'CEX',
  };
  return (
    <span
      className={`text-xs font-bold px-1 rounded ${ACCOUNT_TYPE_STYLES[type]}`}
      title={type}
    >
      {labels[type]}
    </span>
  );
};

const LastActiveTimer: React.FC<{ timestamp: number }> = ({ timestamp }) => {
  const [display, setDisplay] = useState(() => formatTimeAgo(timestamp));

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplay(formatTimeAgo(timestamp));
    }, 1000);
    return () => clearInterval(interval);
  }, [timestamp]);

  return <span className="text-xs text-gray-400">{display}</span>;
};

const HolderRow: React.FC<{ holder: Holder; rank: number; tokenSymbol?: string }> = ({ holder, rank, tokenSymbol }) => {
  const {
    address,
    name,
    balance,
    balance_percent,
    last_active_ts,
    total_bought,
    avg_buy_price,
    total_sold,
    avg_sell_price,
    unrealized_pnl,
    remaining_usd,
    funding_label,
    account_type,
    tx_count,
    buy_tx_count,
    sell_tx_count,
  } = holder;

  const shortAddr = `${address.slice(0, 4)}...${address.slice(-4)}`;

  return (
    <tr className="border-b border-gray-700 hover:bg-gray-800/50 text-sm">
      <td className="py-3 px-3 font-semibold text-gray-400 whitespace-nowrap">#{rank}</td>
      <td className="py-3 px-3">
        <WalletHoverCard holder={holder} tokenSymbol={tokenSymbol}>
          <div className="flex items-center gap-1.5 cursor-pointer">
            <AccountTypeIcon type={account_type} />
            <div className="flex flex-col">
              {name && <span className="font-semibold text-white leading-none">{name}</span>}
              <code className="text-xs text-gray-400 hover:text-gray-200 transition-colors">{shortAddr}</code>
            </div>
          </div>
        </WalletHoverCard>
      </td>
      <td className="py-3 px-3 whitespace-nowrap">
        <div className="flex flex-col">
          <span>{formatTokenAmount(balance, 0)}</span>
          <span className="text-xs text-purple-400">{balance_percent.toFixed(2)}%</span>
        </div>
      </td>
      <td className="py-3 px-3 whitespace-nowrap">
        <LastActiveTimer timestamp={last_active_ts} />
        <div className="text-xs text-gray-500">{tx_count} txns</div>
      </td>
      <td className="py-3 px-3 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="text-green-400">{formatNumber(total_bought)}</span>
          <span className="text-xs text-gray-500">
            avg ${avg_buy_price > 0 ? avg_buy_price.toFixed(6) : '—'} · {buy_tx_count}×
          </span>
        </div>
      </td>
      <td className="py-3 px-3 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="text-red-400">{formatNumber(total_sold)}</span>
          <span className="text-xs text-gray-500">
            avg ${avg_sell_price > 0 ? avg_sell_price.toFixed(6) : '—'} · {sell_tx_count}×
          </span>
        </div>
      </td>
      <td className="py-3 px-3 whitespace-nowrap">
        <span
          className={`font-semibold ${unrealized_pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}
        >
          {unrealized_pnl >= 0 ? '+' : ''}
          {formatNumber(unrealized_pnl)}
        </span>
      </td>
      <td className="py-3 px-3 whitespace-nowrap text-gray-300">
        {formatNumber(remaining_usd)}
      </td>
      <td className="py-3 px-3 whitespace-nowrap">
        {funding_label ? (
          <span className="text-xs text-orange-400">
            {FUNDING_ICONS[funding_label] ?? '🏦'} {funding_label}
          </span>
        ) : (
          <span className="text-xs text-gray-600">—</span>
        )}
      </td>
    </tr>
  );
};

interface HoldersTableProps {
  tokenAddress: string;
  tokenSymbol?: string;
}

export const HoldersTable: React.FC<HoldersTableProps> = ({ tokenAddress, tokenSymbol }) => {
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
        <thead className="text-xs text-gray-500 border-b border-gray-600">
          <tr>
            <th className="pb-2 text-start px-3">#</th>
            <th className="pb-2 text-start px-3">Wallet</th>
            <th className="pb-2 text-start px-3">Balance</th>
            <th className="pb-2 text-start px-3">Last Active</th>
            <th className="pb-2 text-start px-3">Bought (Avg)</th>
            <th className="pb-2 text-start px-3">Sold (Avg)</th>
            <th className="pb-2 text-start px-3">U. PnL</th>
            <th className="pb-2 text-start px-3">Remaining</th>
            <th className="pb-2 text-start px-3">Funding</th>
          </tr>
        </thead>
        <tbody>
          {holdersData.holders.map((holder, index) => (
            <HolderRow key={holder.address} holder={holder} rank={index + 1} tokenSymbol={tokenSymbol} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
