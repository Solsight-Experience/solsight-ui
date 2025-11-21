import { apiClient } from '@/lib/api-client';
import {
    TokenFilterRequest,
    TokenFilterResponse,
    PoolFilterRequest,
    PoolFilterResponse,
    SortBy,
    PoolSortBy,
    SortOrder,
} from '@/types/filter';

export interface CategoryOverview {
    name: string;
    slug: string;
    description: string;
    market_cap: number;
    change_1h: number;
    change_24h: number;
    change_7d: number;
    volume: number;
    num_tokens: number;
    top_tokens: string[];
}

export interface CategoriesResponse {
    categories: CategoryOverview[];
}

export interface TokenFilterParams {
    sort_by?: SortBy;
    sort_order?: SortOrder;
    limit?: number;
    offset?: number;
}

export interface PoolFilterParams {
    sort_by?: PoolSortBy;
    sort_order?: SortOrder;
    limit?: number;
    offset?: number;
}

class FilterService {
    /**
     * Filter tokens with advanced criteria
     */
    async filterTokens(
        body: TokenFilterRequest,
        params?: TokenFilterParams
    ): Promise<TokenFilterResponse> {
        const queryParams = new URLSearchParams();

        if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
        if (params?.sort_order) queryParams.append('sort_order', params.sort_order);
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.offset) queryParams.append('offset', params.offset.toString());

        const url = `/api/tokens/filter${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

        return apiClient.post<TokenFilterResponse>(url, body);
    }

    /**
     * Filter pools with advanced criteria
     */
    async filterPools(
        body: PoolFilterRequest,
        params?: PoolFilterParams
    ): Promise<PoolFilterResponse> {
        const queryParams = new URLSearchParams();

        if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
        if (params?.sort_order) queryParams.append('sort_order', params.sort_order);
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.offset) queryParams.append('offset', params.offset.toString());

        const url = `/api/pools/filter${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

        return apiClient.post<PoolFilterResponse>(url, body);
    }

    /**
     * Get all available categories
     */
    async getCategories(): Promise<CategoriesResponse> {
        return apiClient.get<CategoriesResponse>('/api/discovery/categories');
    }
}

// Export singleton instance
export const filterService = new FilterService();
export default filterService;
