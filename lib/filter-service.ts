import apiClient from '@/lib/api-client';
import type {
  TokenFilterRequest,
  PoolFilterRequest,
  TokenFilterResponse,
  PoolFilterResponse,
  SortBy,
  PoolSortBy,
  SortOrder,
} from '@/types/filter';

export interface FilterTokensParams {
  sort_by?: SortBy;
  sort_order?: SortOrder;
  limit?: number;
  offset?: number;
  filters: TokenFilterRequest;
}

export interface FilterPoolsParams {
  sort_by?: PoolSortBy;
  sort_order?: SortOrder;
  limit?: number;
  offset?: number;
  filters: PoolFilterRequest;
}

export const filterService = {
  /**
   * Filter tokens using POST /api/tokens/filter
   */
  async filterTokens(params: FilterTokensParams): Promise<TokenFilterResponse> {
    const { filters, ...queryParams } = params;
    
    // Remove undefined values from query params
    const cleanQueryParams = Object.fromEntries(
      Object.entries(queryParams).filter(([, value]) => value !== undefined)
    );

    return apiClient.post<TokenFilterResponse>('/api/tokens/filter', filters, {
      params: cleanQueryParams,
    });
  },

  /**
   * Filter pools using POST /api/pools/filter
   */
  async filterPools(params: FilterPoolsParams): Promise<PoolFilterResponse> {
    const { filters, ...queryParams } = params;
    
    // Remove undefined values from query params
    const cleanQueryParams = Object.fromEntries(
      Object.entries(queryParams).filter(([, value]) => value !== undefined)
    );

    return apiClient.post<PoolFilterResponse>('/api/pools/filter', filters, {
      params: cleanQueryParams,
    });
  },
};

export default filterService;