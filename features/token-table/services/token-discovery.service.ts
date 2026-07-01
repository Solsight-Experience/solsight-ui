import { apiClient } from "@/lib/network-requests/api-client";
import { TokenOverview } from "@/types/filter";
import { CategoryOverview } from "../config/types";

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

export type SortBy = "volume_24h" | "txns_24h" | "price_change_24h" | "market_cap" | "holders_change";
export type TimeFrame = "5m" | "1h" | "6h" | "24h" | "7d";
export type GainerLoserType = "gainers" | "losers" | "both";

export type CategorySortBy = "market_cap" | "volume_24h" | "name";
export type CategorySortOrder = "asc" | "desc";

export interface CategoryListParams {
    limit?: number;
    offset?: number;
    name?: string;
    market_cap_min?: number;
    market_cap_max?: number;
    volume_min?: number;
    volume_max?: number;
    sort_by?: CategorySortBy;
    sort_order?: CategorySortOrder;
}

export interface CategoryListResponse {
    data: CategoryOverview[];
    total: number;
    limit: number;
    offset: number;
}

/**
 * Token Discovery Service
 * Handles all API calls for Discovery & Trending section
 */
export class TokenDiscoveryService {
    /**
     * GET /discovery/trending
     * Get trending tokens
     */
    static async getTrending(params?: { sort_by?: SortBy; time_frame?: TimeFrame; limit?: number; offset?: number }): Promise<TrendingResponse> {
        return apiClient.get<TrendingResponse>("/discovery/trending", {
            params: {
                sort_by: params?.sort_by || "volume_24h",
                time_frame: params?.time_frame || "24h",
                limit: params?.limit || 50,
                offset: params?.offset || 0
            }
        });
    }

    /**
     * GET /discovery/new-listings
     * Get newly listed tokens
     */
    static async getNewListings(params?: { time_frame?: "24h" | "7d"; min_liquidity?: number; limit?: number; offset?: number }): Promise<NewListingsResponse> {
        return apiClient.get<NewListingsResponse>("/discovery/new-listings", {
            params: {
                time_frame: params?.time_frame || "24h",
                min_liquidity: params?.min_liquidity,
                limit: params?.limit || 50,
                offset: params?.offset || 0
            }
        });
    }

    /**
     * GET /discovery/categories
     * Get all categories, with category-level filtering & sorting
     */
    static async getCategories(params?: CategoryListParams): Promise<CategoryListResponse> {
        return apiClient.get<CategoryListResponse>("/discovery/categories", {
            params: {
                limit: params?.limit || 50,
                offset: params?.offset || 0,
                ...(params?.name ? { name: params.name } : {}),
                ...(params?.market_cap_min != null ? { market_cap_min: params.market_cap_min } : {}),
                ...(params?.market_cap_max != null ? { market_cap_max: params.market_cap_max } : {}),
                ...(params?.volume_min != null ? { volume_min: params.volume_min } : {}),
                ...(params?.volume_max != null ? { volume_max: params.volume_max } : {}),
                ...(params?.sort_by ? { sort_by: params.sort_by } : {}),
                ...(params?.sort_order ? { sort_order: params.sort_order } : {})
            }
        });
    }

    /**
     * GET /discovery/categories/{category_slug}
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
        return apiClient.get<CategoryDetailResponse>(`/discovery/categories/${categorySlug}`, {
            params: {
                sort_by: params?.sort_by,
                limit: params?.limit || 50,
                offset: params?.offset || 0
            }
        });
    }

    /**
     * GET /discovery/gainers-losers
     * Get top gainers and losers
     */
    static async getGainersLosers(params?: { time_frame?: TimeFrame; type?: GainerLoserType; limit?: number }): Promise<GainersLosersResponse> {
        return apiClient.get<GainersLosersResponse>("/discovery/gainers-losers", {
            params: {
                time_frame: params?.time_frame || "24h",
                type: params?.type || "both",
                limit: params?.limit || 10
            }
        });
    }
}
