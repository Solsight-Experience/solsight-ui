import { useQuery } from '@tanstack/react-query';
import { watchedPortfolioApi } from '../services/watchedPortfolio.service';

export const watchedPortfolioKeys = {
  all: ['watched-portfolio'] as const,
  overview: (address: string, params?: any) =>
    [...watchedPortfolioKeys.all, 'overview', address, params] as const,
  positions: (address: string, params?: any) =>
    [...watchedPortfolioKeys.all, 'positions', address, params] as const,
  activities: (address: string, params?: any) =>
    [...watchedPortfolioKeys.all, 'activities', address, params] as const,
  pnlChart: (address: string, params?: any) =>
    [...watchedPortfolioKeys.all, 'pnl-chart', address, params] as const,
};

export function useWatchedOverview(
  walletAddress: string,
  params?: { time_frame?: '24h' | '7d' | '30d' | '90d' | '1y' }
) {
  return useQuery({
    queryKey: watchedPortfolioKeys.overview(walletAddress, params),
    queryFn: () => watchedPortfolioApi.getOverview({ wallet_address: walletAddress, ...params }),
    enabled: !!walletAddress,
    staleTime: 10000,
  });
}

export function useWatchedPositions(
  walletAddress: string,
  params?: { sort_by?: 'value' | 'pnl' | 'change_24h'; show_zero_balance?: boolean }
) {
  return useQuery({
    queryKey: watchedPortfolioKeys.positions(walletAddress, params),
    queryFn: () => watchedPortfolioApi.getPositions({ wallet_address: walletAddress, ...params }),
    enabled: !!walletAddress,
    staleTime: 10000,
  });
}

export function useWatchedActivities(
  walletAddress: string,
  params?: {
    type?: 'all' | 'swap' | 'transfer' | 'stake' | 'unstake';
    limit?: number;
    offset?: number;
    from?: number;
    to?: number;
  }
) {
  return useQuery({
    queryKey: watchedPortfolioKeys.activities(walletAddress, params),
    queryFn: () => watchedPortfolioApi.getActivities({ wallet_address: walletAddress, ...params }),
    enabled: !!walletAddress,
    staleTime: 10000,
  });
}

export function useWatchedPnlChart(
  walletAddress: string,
  params?: { time_frame?: '7d' | '30d' | '90d' | '1y' | 'all'; interval?: '1h' | '1d' | '1w' }
) {
  return useQuery({
    queryKey: watchedPortfolioKeys.pnlChart(walletAddress, params),
    queryFn: () => watchedPortfolioApi.getPnlChart({ wallet_address: walletAddress, ...params }),
    enabled: !!walletAddress,
    staleTime: 60000,
  });
}
