'use client';

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAddWatchedWallet } from '../hooks/useWatchlist';
import { useWatchlistStore } from '../store/watchlistStore';

export const AddWalletForm: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [label, setLabel] = useState('');

  const { mutate: addWallet, isPending } = useAddWatchedWallet();
  const setSelectedWalletAddress = useWatchlistStore((s) => s.setSelectedWalletAddress);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedAddress = address.trim();
    if (!trimmedAddress) return;

    addWallet(
      { walletAddress: trimmedAddress, label: label.trim() || undefined },
      {
        onSuccess: (wallet) => {
          toast.success('Wallet added to watchlist');
          setSelectedWalletAddress(wallet.walletAddress);
          setAddress('');
          setLabel('');
          setIsOpen(false);
        },
        onError: (err: any) => {
          const message =
            err?.response?.data?.message || err?.message || 'Failed to add wallet';
          if (err?.response?.status === 409) {
            toast.error('This wallet is already in your watchlist');
          } else {
            toast.error(message);
          }
        },
      }
    );
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-dashed border-gray-600
                   text-gray-400 hover:text-white hover:border-purple-500 transition-colors text-sm"
      >
        <Plus className="size-4" />
        Add Wallet
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-3 rounded-lg border border-purple-600/50 bg-purple-950/20">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-300">Track a wallet</span>
        <button
          type="button"
          onClick={() => { setIsOpen(false); setAddress(''); setLabel(''); }}
          className="text-gray-500 hover:text-white transition-colors"
        >
          <X className="size-3.5" />
        </button>
      </div>

      <input
        type="text"
        placeholder="Wallet address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-1.5 text-xs text-white
                   placeholder-gray-500 focus:outline-none focus:border-purple-500"
        autoFocus
      />
      <input
        type="text"
        placeholder="Label (optional)"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-1.5 text-xs text-white
                   placeholder-gray-500 focus:outline-none focus:border-purple-500"
      />

      <button
        type="submit"
        disabled={isPending || !address.trim()}
        className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-md text-xs font-medium
                   bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors"
      >
        {isPending ? 'Adding...' : 'Add Wallet'}
      </button>
    </form>
  );
};
