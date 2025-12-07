import React from 'react';
import { Label } from '@/components/ui/label';
import { useWallets } from '../hooks/portfolio.hooks';
import AddWalletButton from './AddWalletButton';
import WalletDropdownMenu from './WalletDropdownMenu';

export const WalletList: React.FC = () => {
  const { data: walletsData, isLoading } = useWallets();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <Label className="text-base">Wallets</Label>
          <AddWalletButton />
        </div>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border flex items-center gap-4 rounded-lg border-gray-600 p-2 animate-pulse"
          >
            <div className="h-8 w-8 bg-gray-700 rounded-lg"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-700 rounded mb-2 w-24"></div>
              <div className="h-3 bg-gray-700 rounded w-32"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!walletsData?.wallets) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <Label className="text-base">Wallets</Label>
        <AddWalletButton />
      </div>
      {walletsData.wallets.map((wallet) => (
        <div
          key={wallet.address}
          className="border flex items-center gap-4 rounded-lg border-gray-600 p-2  transition-colors"
        >
          <img src={wallet.icon} className="rounded-lg h-8 w-8 object-contain" alt={wallet.name} />
          <div className="flex flex-col flex-1">
            <div className="text-sm font-medium">
              {wallet.name}
              {wallet.is_default && (
                <span className="ml-2 text-sx text-purple-300 font-normal">(Default)</span>
              )}
            </div>
            <div className="flex gap-2 items-end">
              <div className="text-base font-semibold">{wallet.balance_sol.toFixed(4)} SOL</div>
              <div className="text-sm text-gray-400">
                ${wallet.balance_usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
          <WalletDropdownMenu walletAddress={wallet.address} isDefault={wallet.is_default} />
        </div>
      ))}
    </div>
  );
};
