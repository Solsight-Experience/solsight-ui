'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { WalletService } from '../services/wallet.service';
import { phantomWallet } from '@/lib/wallet';
import { WalletResponseDto } from '@/types/dto';
import { toast } from 'sonner';

export function useWallet() {
  // Use React state so connected/publicKey are reactive
  const [connected, setConnected] = useState(phantomWallet.connected);
  const [publicKey, setPublicKey] = useState(phantomWallet.publicKey);
  const [isConnecting, setIsConnecting] = useState(false);
  const queryClient = useQueryClient();

  // On mount: if Phantom has already authorized this site (e.g. from a previous
  // session), silently re-connect so the rest of the app sees the right state
  // without requiring the user to click "Connect Wallet" again.
  useEffect(() => {
    const solana = (window as any).solana;
    if (solana?.isConnected && !phantomWallet.connected) {
      phantomWallet.connect()
        .then(() => {
          setConnected(phantomWallet.connected);
          setPublicKey(phantomWallet.publicKey);
        })
        .catch(() => {});
    }
  }, []);

  // Connect to Phantom wallet and register with backend
  const connectWallet = useMutation({
    mutationFn: async () => {
      setIsConnecting(true);

      // Connect to Phantom wallet to get public key
      await phantomWallet.connect();

      if (!phantomWallet.publicKey) {
        throw new Error('Failed to get public key from wallet');
      }

      // Register wallet with backend
      const walletData = await WalletService.connectWallet(phantomWallet.publicKey, 'phantom');

      return walletData;
    },
    onSuccess: () => {
      setConnected(phantomWallet.connected);
      setPublicKey(phantomWallet.publicKey);
      toast.success('Wallet connected successfully!');
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
    },
    onError: (error: unknown) => {
      if (error && typeof error === 'object' && 'message' in error) {
        toast.error((error as any).message || 'Failed to connect wallet');
        return;
      }
    },
    onSettled: () => {
      setIsConnecting(false);
    },
  });

  // Disconnect wallet
  const disconnectWallet = useMutation({
    mutationFn: async () => {
      if (phantomWallet.publicKey) {
        await WalletService.disconnectWallet(phantomWallet.publicKey);
      }
      await phantomWallet.disconnect();
    },
    onSuccess: () => {
      setConnected(false);
      setPublicKey(null);
      toast.success('Wallet disconnected');
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
    },
    onError: (error: unknown) => {
      if (error && typeof error === 'object' && 'message' in error) {
        toast.error((error as any).message || 'Failed to disconnect wallet');
        return;
      }
    },
  });

  return {
    connectWallet: connectWallet.mutate,
    disconnectWallet: disconnectWallet.mutate,
    isConnecting: isConnecting || connectWallet.isPending,
    isDisconnecting: disconnectWallet.isPending,
    connected,
    publicKey,
  };
}

export function useWalletBalance(address?: string) {
  return useQuery({
    queryKey: ['wallet-balance', address],
    queryFn: () => WalletService.getWalletBalance(address!),
    enabled: !!address,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useUserWallets() {
  return useQuery({
    queryKey: ['wallets'],
    queryFn: WalletService.getUserWallets,
  });
}
