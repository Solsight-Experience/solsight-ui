import { apiClient } from '@/lib/api-client';
import { PORTFOLIO_ENDPOINTS } from '@/lib/constants';
import type {
  WalletsResponse,
  PortfolioOverview,
  PositionsResponse,
  ActivitiesResponse,
  Wallet,
} from '../types/portfolio.types';

export const portfolioApi = {
  // Wallet Management
  getWallets: async (): Promise<WalletsResponse> => {
    const response = await apiClient.get<WalletsResponse>(PORTFOLIO_ENDPOINTS.WALLETS);
    return response;
  },

  // Portfolio Overview
  getOverview: async (params?: {
    wallet_addresses?: string[];
    time_frame?: '24h' | '7d' | '30d' | '90d' | '1y';
  }): Promise<PortfolioOverview> => {
    const response = await apiClient.get<PortfolioOverview>(PORTFOLIO_ENDPOINTS.OVERVIEW, {
      params,
    });
    return response;
  },

  getPnlChart: async (params: {
    wallet_addresses?: string[];
    time_frame?: '7d' | '30d' | '90d' | '1y' | 'all';
    interval?: '1h' | '1d' | '1w';
  }): Promise<{
    chart_data: Array<{
      timestamp: number;
      pnl: number;
      balance_usd: number;
    }>;
  }> => {
    const response = await apiClient.get<{
      chart_data: Array<{
        timestamp: number;
        pnl: number;
        balance_usd: number;
      }>;
    }>(PORTFOLIO_ENDPOINTS.PNL_CHART, { params });
    return response;
  },

  // Positions
  getPositions: async (params: {
    wallet_address: string;
    sort_by?: 'value' | 'pnl' | 'change_24h';
    show_zero_balance?: boolean;
  }): Promise<PositionsResponse> => {
    const response = await apiClient.get<PositionsResponse>(PORTFOLIO_ENDPOINTS.POSITIONS, {
      params,
    });
    return response;
  },

  // Activities
  getActivities: async (params: {
    wallet_address?: string;
    type?: 'all' | 'swap' | 'transfer' | 'stake' | 'unstake';
    limit?: number;
    offset?: number;
    from?: number;
    to?: number;
  }): Promise<ActivitiesResponse> => {
    const response = await apiClient.get<ActivitiesResponse>(PORTFOLIO_ENDPOINTS.ACTIVITIES, {
      params,
    });
    return response;
  },
};
