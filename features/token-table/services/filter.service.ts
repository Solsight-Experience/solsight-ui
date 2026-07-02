import { apiClient } from "@/lib/network-requests/api-client";
import { USER_ENDPOINTS } from "@/lib/constants";
import { TokenFilterRequest, TokenFilterResponse, SortBy, SortOrder } from "@/types/filter";

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
    time_frame?: string;
}

function buildFilterQueryParams(params?: TokenFilterParams): string {
    const queryParams = new URLSearchParams();

    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());
    if (params?.time_frame) queryParams.append("time_frame", params.time_frame);

    return queryParams.toString();
}

class FilterService {
    /**
     * Filter tokens with advanced criteria
     */
    async filterTokens(body: TokenFilterRequest, params?: TokenFilterParams): Promise<TokenFilterResponse> {
        const queryString = buildFilterQueryParams(params);
        const url = `/tokens/filter${queryString ? `?${queryString}` : ""}`;

        return apiClient.post<TokenFilterResponse>(url, body);
    }

    /**
     * Filter within the user's favorited tokens only
     */
    async filterFavorites(body: TokenFilterRequest, params?: TokenFilterParams): Promise<TokenFilterResponse> {
        const queryString = buildFilterQueryParams(params);
        const url = `${USER_ENDPOINTS.FAVORITES_FILTER}${queryString ? `?${queryString}` : ""}`;

        return apiClient.post<TokenFilterResponse>(url, body);
    }

    /**
     * Get all available categories
     */
    async getCategories(): Promise<CategoriesResponse> {
        return apiClient.get<CategoriesResponse>("/discovery/categories");
    }
}

// Export singleton instance
export const filterService = new FilterService();
export default filterService;
