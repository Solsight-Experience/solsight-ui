import { apiClient } from '@/lib/api-client';
import { TokenOverview } from '@/types/filter';
import { CategoryOverview } from '../config/types';
import { CategoriesResponse } from './filter.service';

/**
 * Types for Discovery & Trending API
 */

export interface TrendingResponse {
  tokens: TokenOverview[];
  total: number;
  updated_at: string;
}

export interface NewListingsResponse {
  tokens: TokenOverview[];
  total: number;
}

export interface CategoryDetailResponse {
  category: CategoryOverview;
  tokens: TokenOverview[];
  total: number;
}

export interface GainersLosersResponse {
  gainers: TokenOverview[];
  losers: TokenOverview[];
  updated_at: string;
}

export type SortBy = 'volume_24h' | 'txns_24h' | 'price_change_24h' | 'market_cap' | 'holders_change';
export type TimeFrame = '1h' | '24h' | '7d';
export type GainerLoserType = 'gainers' | 'losers' | 'both';

/**
 * Token Discovery Service
 * Handles all API calls for Discovery & Trending section
 */
export class TokenDiscoveryService {
  /**
   * GET /api/discovery/trending
   * Get trending tokens
   */
  static async getTrending(params?: {
    sort_by?: SortBy;
    time_frame?: TimeFrame;
    limit?: number;
    offset?: number;
  }): Promise<TrendingResponse> {
    return apiClient.get<TrendingResponse>('/api/discovery/trending', {
      params: {
        sort_by: params?.sort_by || 'volume_24h',
        time_frame: params?.time_frame || '24h',
        limit: params?.limit || 50,
        offset: params?.offset || 0,
      },
    });
  }

  /**
   * GET /api/discovery/new-listings
   * Get newly listed tokens
   */
  static async getNewListings(params?: {
    time_frame?: '24h' | '7d';
    min_liquidity?: number;
    limit?: number;
    offset?: number;
  }): Promise<NewListingsResponse> {
    return apiClient.get<NewListingsResponse>('/api/discovery/new-listings', {
      params: {
        time_frame: params?.time_frame || '24h',
        min_liquidity: params?.min_liquidity,
        limit: params?.limit || 50,
        offset: params?.offset || 0,
      },
    });
  }

  /**
   * GET /api/discovery/categories
   * Get all categories
   */
  static async getCategories(): Promise<CategoriesResponse> {
    return apiClient.get<CategoriesResponse>('/api/discovery/categories');
  }

  /**
   * GET /api/discovery/categories/{category_slug}
   * Get tokens in a specific category
   */
  static async getCategoryDetail(
    categorySlug: string,
    params?: {
      sort_by?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<CategoryDetailResponse> {
    return apiClient.get<CategoryDetailResponse>(`/api/discovery/categories/${categorySlug}`, {
      params: {
        sort_by: params?.sort_by,
        limit: params?.limit || 50,
        offset: params?.offset || 0,
      },
    });
  }

  /**
   * GET /api/discovery/gainers-losers
   * Get top gainers and losers
   */
  static async getGainersLosers(params?: {
    time_frame?: TimeFrame;
    type?: GainerLoserType;
    limit?: number;
  }): Promise<GainersLosersResponse> {
    return apiClient.get<GainersLosersResponse>('/api/discovery/gainers-losers', {
      params: {
        time_frame: params?.time_frame || '24h',
        type: params?.type || 'both',
        limit: params?.limit || 10,
      },
    });
  }
}
