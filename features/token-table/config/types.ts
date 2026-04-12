// Defines the possible categories a token can belong to
export type TokenCategory = "MEME" | "GameFi" | "Infrastructure" | "AI" | "DeFi";

export type TokenTableData = {
    id: string;
    token: {
        iconUrl: string;
        /** The ticker symbol (e.g. "MORON") */
        ticker: string;
        name: string;
        priceHistory: number[];
        category: TokenCategory;
        age: string;
    };
    marketCap: {
        value: number;
        currencyCode: string;
        currencySymbol: string;
        changePercent24h: number;
    };
    liquidity: number;
    volume24h: number;
    transactions: {
        buyCount: number;
        sellCount: number;
        buyVolumn: number;
        sellVolumn: number;
    };
    audit: Array<{
        label: string;
        value: string;
        trend: "up" | "down" | "neutral";
    }>;
};

/**
 * CategoryOverview type for Categories tab
 * Represents aggregated data for a token category
 */
export interface CategoryOverview {
    id: string;
    name: string;
    slug: string;
    market_cap: number;
    market_cap_change_24h: number;
    content: string;
    top_3_coins_id: string[];
    top_3_coins: string[];
    volume_24h: number;
    updated_at: string;
}
