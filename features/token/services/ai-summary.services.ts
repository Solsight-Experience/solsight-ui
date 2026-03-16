import { apiClient } from '@/lib/api-client';
import { TOKEN_ENDPOINTS } from '@/lib/constants';
import type { AISummaryOptions } from '@/lib/mock/aiSummary';

export interface TokenData {
  name: string;
  symbol: string;
  price: number;
  priceChange24h: number;
}

export interface AISummaryResponse {
  address: string;
  summary: string;
  generatedAt: string;
  model: string;
  cached: boolean;
  tokenData: TokenData;
}

export const aiSummaryApi = {
  /**
   * Generate AI summary for a token with optional analysis options
   * @param address - Token address
   * @param options - Analysis options (all default to false if not specified)
   * @returns AI summary response with generated content
   */
  generateSummary: async (
    address: string,
    options?: Partial<AISummaryOptions>
  ): Promise<AISummaryResponse> => {
    const requestBody: { address: string; forceRefresh?: boolean } = {
      address,
    };
    
    if (options?.forceRefresh !== undefined) {
      requestBody.forceRefresh = options.forceRefresh;
    }

    const response = await apiClient.post<AISummaryResponse>(
      TOKEN_ENDPOINTS.AI_SUMMARY,
      requestBody
    );
    return response;
  },

  /**
   * Generate AI summary with all default options
   * @param address - Token address
   * @returns AI summary response with generated content
   */
  generateSummaryWithDefaults: async (address: string): Promise<AISummaryResponse> => {
    const requestBody = {
      address,
      forceRefresh: false,
    };

    const response = await apiClient.post<AISummaryResponse>(
      TOKEN_ENDPOINTS.AI_SUMMARY,
      requestBody
    );
    return response;
  },
};
