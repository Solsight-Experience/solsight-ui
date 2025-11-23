import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useWallets } from '../hooks/portfolio.hooks';
import { usePortfolioUIStore } from '../stores/portfolioUIStore';

export const PositionsTab: React.FC = () => {
  const { data: walletsData, isLoading } = useWallets();
  const { collapsedWallets, toggleWalletCollapse } = usePortfolioUIStore();

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
            <div
              className="flex justify-between items-center hover:cursor-pointer"
              onClick={() => toggleWalletCollapse(wallet.address)}
            >
              <div className="flex gap-2 items-center">
                <img
                  src={wallet.icon}
                  alt={wallet.name}
                  className="h-8 w-8 rounded-lg object-contain"
                />
                <div className="font-bold">{wallet.name}</div>
                <div className="text-gray-500 text-sm">
                  {wallet.address.slice(0, 4)}...{wallet.address.slice(-4)}
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <div className="text-sm">
                  {wallet.balance_sol.toFixed(4)} SOL
                  <span className="text-gray-400 ml-2">(${wallet.balance_usd.toFixed(2)})</span>
                </div>
                {isCollapsed ? (
                  <ChevronDown className="size-6" />
                ) : (
                  <ChevronUp className="size-6" />
                )}
              </div>
            </div>

            {!isCollapsed && (
              <div className="flex justify-center">
                <table className="w-full">
                  <thead className="text-base text-gray-500 border-b border-gray-600 mb-2">
                    <tr>
                      <th className="pb-2 text-start w-1/4">Asset</th>
                      <th className="pb-2 text-start w-1/4">Balance</th>
                      <th className="pb-2 text-start w-1/4">Price/24h Change</th>
                      <th className="pb-2 text-start w-1/4">Value (USD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wallet.positions.map((position) => (
                      <tr key={position.token.address} className="border-b border-gray-400">
                        <td>
                          <div className="flex p-2 gap-2">
                            <img
                              src={position.token.logo_uri}
                              className="h-10 w-10 rounded-lg"
                              alt={position.token.symbol}
                            />
                            <div className="flex flex-col">
                              <div className="font-bold">{position.token.symbol}</div>
                              <div className="text-sm text-gray-400">{position.token.name}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="text-sm">
                            {position.balance > 1000
                              ? position.balance.toLocaleString()
                              : position.balance.toFixed(4)}
                          </div>
                        </td>
                        <td>
                          <div className="flex flex-col">
                            <div className="text-sm">${position.current_price.toFixed(6)}</div>
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
                        <td className="text-sm">
                          ${position.value_usd.toFixed(2)}
                          <div
                            className={`text-xs ${
                              position.total_pnl >= 0 ? 'text-green-500' : 'text-red-500'
                            }`}
                          >
                            PNL: {position.total_pnl >= 0 ? '+' : ''}$
                            {position.total_pnl.toFixed(2)}
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
