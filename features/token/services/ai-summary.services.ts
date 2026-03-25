import { apiClient } from '@/lib/api-client';
import { TOKEN_ENDPOINTS } from '@/lib/constants';

export interface TokenData {
    name: string;
    symbol: string;
    price: number;
    priceChange24h: number;
}

export interface AISummaryRequest {
  address: string;
  name: string;
  symbol: string;
}

export interface AISummaryResponse {
  address: string;
  summary: string;
  generatedAt: string;
  model: string;
  cached: boolean;
  tokenData?: TokenData;
}

export const aiSummaryApi = {
  /**
   * Generate AI summary for a token
   * @param address - Token address
   * @param name - Token name
   * @param symbol - Token symbol
   * @returns AI summary response with generated content
   */
  generateSummary: async (
    address: string,
    name: string,
    symbol: string
  ): Promise<AISummaryResponse> => {
    const requestBody: AISummaryRequest = {
      address,
      name,
      symbol,
    };

        const response = await apiClient.post<AISummaryResponse>(TOKEN_ENDPOINTS.AI_SUMMARY, requestBody);
        return response;
    }
};
