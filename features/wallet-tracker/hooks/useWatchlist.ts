import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { watchlistApi } from '../services/watchlist.service';
import type { AddWatchedWalletDto, UpdateWatchedWalletDto } from '../types/watchlist.types';

export const watchlistKeys = {
  all: ['watchlist'] as const,
  list: () => [...watchlistKeys.all, 'list'] as const,
};

export function useWatchlist() {
  return useQuery({
    queryKey: watchlistKeys.list(),
    queryFn: watchlistApi.getWatchlist,
    staleTime: 30000,
  });
}

export function useAddWatchedWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddWatchedWalletDto) => watchlistApi.addWallet(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: watchlistKeys.all });
    },
  });
}

export function useUpdateWatchedWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ address, data }: { address: string; data: UpdateWatchedWalletDto }) =>
      watchlistApi.updateWallet(address, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: watchlistKeys.all });
    },
  });
}

export function useRemoveWatchedWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (address: string) => watchlistApi.removeWallet(address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: watchlistKeys.all });
    },
  });
}
