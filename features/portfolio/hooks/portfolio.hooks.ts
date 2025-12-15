import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { portfolioApi } from '../service/portfolio.service';

// Query Keys
export const portfolioKeys = {
  all: ['portfolio'] as const,
  wallets: () => [...portfolioKeys.all, 'wallets'] as const,
  overview: (params?: any) => [...portfolioKeys.all, 'overview', params] as const,
  pnlChart: (params: any) => [...portfolioKeys.all, 'pnl-chart', params] as const,
  positions: (walletAddress: string, params?: any) =>
    [...portfolioKeys.all, 'positions', walletAddress, params] as const,
  activities: (params: any) => [...portfolioKeys.all, 'activities', params] as const,
};

// Hooks
export function useWallets() {
  return useQuery({
    queryKey: portfolioKeys.wallets(),
    queryFn: portfolioApi.getWallets,
    staleTime: 30000, // 30 seconds
  });
}

export function useSetDefaultWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (address: string) => portfolioApi.setDefaultWallet(address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: portfolioKeys.all });
    },
  });
}

export function useDeleteWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (address: string) => portfolioApi.deleteWallet(address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: portfolioKeys.all });
    },
  });
}

export function useAddWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { address: string; name?: string; icon: string }) =>
      portfolioApi.addWallet(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: portfolioKeys.all });
    },
  });
}

export function usePortfolioOverview(params?: {
  wallet_addresses?: string[];
  time_frame?: '24h' | '7d' | '30d' | '90d' | '1y';
}) {
  return useQuery({
    queryKey: portfolioKeys.overview(params),
    queryFn: () => portfolioApi.getOverview(params),
    staleTime: 10000, // 10 seconds
  });
}

export function usePnlChart(params: {
  wallet_addresses?: string[];
  time_frame?: '7d' | '30d' | '90d' | '1y' | 'all';
  interval?: '1h' | '1d' | '1w';
}) {
  return useQuery({
    queryKey: portfolioKeys.pnlChart(params),
    queryFn: () => portfolioApi.getPnlChart(params),
    staleTime: 60000, // 1 minute
  });
}

export function usePositions(
  walletAddress: string,
  params?: {
    sort_by?: 'value' | 'pnl' | 'change_24h';
    show_zero_balance?: boolean;
  }
) {
  return useQuery({
    queryKey: portfolioKeys.positions(walletAddress, params),
    queryFn: () => portfolioApi.getPositions({ wallet_address: walletAddress, ...params }),
    enabled: !!walletAddress,
    staleTime: 10000, // 10 seconds
  });
}

export function useActivities(params: {
  wallet_address?: string;
  type?: 'all' | 'swap' | 'transfer' | 'stake' | 'unstake';
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: portfolioKeys.activities(params),
    queryFn: () => portfolioApi.getActivities(params),
    staleTime: 10000, // 10 seconds
  });
}
