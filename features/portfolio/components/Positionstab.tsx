import React from 'react';
import { ChevronDown, ChevronUp, Copy, Check, ExternalLink } from 'lucide-react';
import { useWallets } from '../hooks/portfolio.hooks';
import { usePortfolioUIStore } from '../stores/portfolioUIStore';
import { useState } from 'react';
import Link from 'next/link';

export const PositionsTab: React.FC = () => {
  const { data: walletsData, isLoading } = useWallets();
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
                    {wallet.positions.map((position) => (
                      <tr key={position.token.address} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors group">
                        <td className="py-3">
                          <Link
                            href={`/token/${position.token.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex gap-3 items-center hover:text-purple-400 transition-colors"
                          >
                            <img
                              src={position.token.logo_uri}
                              className="h-10 w-10 rounded-lg flex-shrink-0"
                              alt={position.token.symbol}
                            />
                            <div className="flex flex-col min-w-0 flex-1">
                              <div className="font-semibold text-base truncate flex items-center gap-1.5">
                                {position.token.symbol}
                                <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <div className="text-sm text-gray-400 truncate">{position.token.name}</div>
                            </div>
                          </Link>
                        </td>
                        <td className="py-3">
                          <div className="text-base">
                            {formatBalance(position.balance, position.token.symbol)}
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="flex flex-col gap-0.5">
                            <div className="text-base">${formatPrice(position.current_price)}</div>
                            {position.price_change_24h > 0 ? (
                              <div className="text-green-500 text-sm">
                                +{position.price_change_24h.toFixed(2)}%
                              </div>
                            ) : (
                              <div className="text-red-500 text-sm">
                                {position.price_change_24h.toFixed(2)}%
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="text-base">
                            ${position.value_usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div
                            className={`text-sm ${
                              position.total_pnl >= 0 ? 'text-green-500' : 'text-red-500'
                            }`}
                          >
                            PNL: {position.total_pnl >= 0 ? '+' : ''}$
                            {position.total_pnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
