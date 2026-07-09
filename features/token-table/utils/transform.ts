import { TokenOverview } from "@/types/filter";
import { TokenTableData } from "../config/types";

/**
 * Format age from seconds to human-readable string
 */
function formatAge(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years}y`;
    if (months > 0) {
        const remainingDays = days % 30;
        return remainingDays > 0 ? `${months}mo ${remainingDays}d` : `${months}mo`;
    }
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
}

/**
 * Transform TokenOverview from API to TokenTableData for the table
 */
export function transformTokenOverview(token: TokenOverview): TokenTableData {
    const buys24h = token.txns_24h?.buys ?? 0;
    const sells24h = token.txns_24h?.sells ?? 0;

    return {
        id: token.address,
        token: {
            iconUrl: token.logo_uri || "/icons/default-token.png",
            ticker: token.symbol,
            name: token.name,
            priceHistory: token.price_sparkline || [],
            category: token.category as unknown as import("../config/types").TokenCategory, // Category mapping may need adjustment
            age: formatAge(token.age_seconds)
        },
        marketCap: {
            value: token.market_cap,
            currencyCode: "USD",
            currencySymbol: "$",
            changePercent24h: token.market_cap_change_24h
        },
        liquidity: token.liquidity,
        volume24h: token.volume_24h,
        transactions: {
            buyCount: buys24h,
            sellCount: sells24h,
            buyVolumn: Math.floor(buys24h * 0.6), // Estimated buy volume
            sellVolumn: Math.floor(sells24h * 0.4) // Estimated sell volume
        }
    };
}

/**
 * Transform array of TokenOverview to TokenTableData
 */
export function transformTokenOverviews(tokens: TokenOverview[]): TokenTableData[] {
    return tokens.map(transformTokenOverview);
}
