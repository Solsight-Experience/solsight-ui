import React from 'react';
import { ChevronDown, ChevronUp, Copy, Check, ExternalLink, AlertTriangle } from 'lucide-react';
import { useWallets, usePositions } from '../hooks/portfolio.hooks';
import { usePortfolioUIStore } from '../stores/portfolioUIStore';
import { useState } from 'react';
import Link from 'next/link';

// Wallet Positions Component
const WalletPositions: React.FC<{ walletAddress: string; walletName: string }> = ({ walletAddress, walletName }) => {
  const { data: positionsData, isLoading, error } = usePositions(walletAddress, { sort_by: 'value' });

  const formatPrice = (price: number): string => {
    if (price >= 1) {
      return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    if (price >= 0.01) {
      return price.toFixed(4);
    }
    return price.toFixed(6);
  };

  const formatBalance = (balance: number, symbol: string): string => {
    if (balance >= 1000) {
      return `${balance.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${symbol}`;
    }
    if (balance >= 1) {
      return `${balance.toFixed(4)} ${symbol}`;
    }
    return `${balance.toLocaleString('en-US', { maximumFractionDigits: 6 })} ${symbol}`;
  };

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="animate-pulse text-gray-400">Loading positions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center text-red-400">
        <div className="text-sm">Failed to load positions</div>
      </div>
    );
  }

  if (!positionsData?.positions || positionsData.positions.length === 0) {
    return (
      <div className="py-8 text-center text-gray-400">
        <div className="text-base">No positions in this wallet</div>
      </div>
    );
  }

  return (
    <table className="w-full table-fixed">
      <colgroup>
        <col className="w-[35%]" />
        <col className="w-[20%]" />
        <col className="w-[25%]" />
        <col className="w-[20%]" />
      </colgroup>
      <thead className="text-base text-gray-400 border-b border-gray-600">
        <tr>
          <th className="pb-3 text-start font-medium">Asset</th>
          <th className="pb-3 text-start font-medium">Balance</th>
          <th className="pb-3 text-start font-medium">Price/24h Change</th>
          <th className="pb-3 text-start font-medium">Value (USD)</th>
        </tr>
      </thead>
      <tbody>
        {positionsData.positions.map((position) => (
          <tr key={position.token.address} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors group">
            <td className="py-3">
              <Link
                href={`/token/${position.token.address}`}
                target="_blank"
                className="flex items-center gap-2 hover:text-purple-400 transition-colors"
              >
                <img
                  src={position.token.logo_uri}
                  alt={position.token.symbol}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <div className="font-medium">{position.token.symbol}</div>
                  <div className="text-xs text-gray-400">{position.token.name}</div>
                </div>
                <ExternalLink className="size-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </td>
            <td className="py-3 font-mono">
              {formatBalance(position.balance, position.token.symbol)}
            </td>
            <td className="py-3">
              <div className="font-mono">${formatPrice(position.current_price)}</div>
              <div className={`text-xs ${position.price_change_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {position.price_change_24h >= 0 ? '+' : ''}{position.price_change_24h.toFixed(2)}%
              </div>
            </td>
            <td className="py-3 font-mono">${position.value_usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export const PositionsTab: React.FC = () => {
  const { data: walletsData, isLoading, error } = useWallets();
  const { collapsedWallets, toggleWalletCollapse } = usePortfolioUIStore();
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const formatPrice = (price: number): string => {
    if (price >= 1) {
      return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    if (price >= 0.01) {
      return price.toFixed(4);
    }
    return price.toFixed(6);
  };

  const formatBalance = (balance: number, symbol: string): string => {
    if (balance >= 1000) {
      return `${balance.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${symbol}`;
    }
    if (balance >= 1) {
      return `${balance.toFixed(4)} ${symbol}`;
    }
    return `${balance.toLocaleString('en-US', { maximumFractionDigits: 6 })} ${symbol}`;
  };

  // Error state
  if (error) {
    return (
      <div className="border border-purple-600 bg-purple-950/20 p-8 rounded-lg">
        <div className="flex flex-col items-center justify-center text-center gap-3">
          <AlertTriangle className="size-8 text-purple-500" />
          <div className="text-purple-500 text-lg font-medium">Error Loading Positions</div>
          <div className="text-gray-400 text-sm">
            {error instanceof Error ? error.message : 'Network error. Please try again.'}
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-gray-600 p-4 rounded-lg animate-pulse">
            <div className="h-10 bg-gray-700 rounded mb-4"></div>
            <div className="h-32 bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!walletsData?.wallets) return null;

  // Empty state - no wallets
  if (walletsData.wallets.length === 0) {
    return (
      <div className="border border-gray-600 p-12 rounded-lg">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="text-gray-400 mb-4">
            <div className="text-xl mb-2">No wallets connected</div>
            <div className="text-sm">Add a wallet to start tracking your positions</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {walletsData.wallets.map((wallet) => {
        const isCollapsed = collapsedWallets[wallet.address] || false;

        return (
          <div
            key={wallet.address}
            className="border border-gray-600 p-4 rounded-lg flex flex-col gap-4"
          >
            <div className="flex justify-between items-center">
              <div className="flex gap-3 items-center flex-1">
                <img
                  src={wallet.icon}
                  alt={wallet.name}
                  className="h-8 w-8 rounded-lg object-contain"
                />
                <div className="font-bold text-base">{wallet.name}</div>
                <div
                  className="text-gray-300 text-sm flex items-center gap-1.5 cursor-pointer hover:text-purple-400 transition-colors font-mono"
                  onClick={() => handleCopyAddress(wallet.address)}
                  title="Click to copy address"
                >
                  <span>{wallet.address}</span>
                  {copiedAddress === wallet.address ? (
                    <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 flex-shrink-0" />
                  )}
                </div>
              </div>
              <div className="flex gap-4 items-center">
                <div className="text-base">
                  {wallet.balance_sol.toFixed(4)} SOL
                  <span className="text-gray-400 ml-2">(${wallet.balance_usd.toFixed(2)})</span>
                </div>
                <button
                  onClick={() => toggleWalletCollapse(wallet.address)}
                  className="hover:bg-gray-700 p-1 rounded transition-colors"
                >
                  {isCollapsed ? (
                    <ChevronDown className="size-5" />
                  ) : (
                    <ChevronUp className="size-5" />
                  )}
                </button>
              </div>
            </div>

            {!isCollapsed && (
              <div className="overflow-x-auto">
                <WalletPositions walletAddress={wallet.address} walletName={wallet.name} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
