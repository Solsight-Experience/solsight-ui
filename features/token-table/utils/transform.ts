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
 * Calculate risk percentage from risk score (0-100)
 * Lower score = higher risk
 */
function calculateRiskPercentage(riskScore: number): string {
    const risk = 100 - riskScore;
    return `${risk.toFixed(1)}%`;
}

/**
 * Calculate audit score letter grade and points
 */
function calculateAuditScore(audit: TokenOverview["audit"]): string {
    let points = 0;

    // Add points for security features
    if (audit.mint_authority_disabled) points += 30;
    if (audit.freeze_authority_disabled) points += 30;
    if (audit.lp_burnt) points += 20;
    if (audit.has_social_links) points += 10;

    // Add points based on holders and distribution
    if (Number(audit.holders_count) > 1000) points += 20;
    if (Number(audit.top_10_holders_percent) < 30) points += 20;
    if (Number(audit.insider_percent) < 10) points += 20;

    // Bonus from risk score (normalized to 0-50 range)
    points += Math.floor(Number(audit.risk_score) / 2);

    // Cap at reasonable maximum
    points = Math.min(points, 300);

    // Determine letter grade
    let grade = "F";
    if (points >= 250) grade = "A";
    else if (points >= 200) grade = "B";
    else if (points >= 150) grade = "C";
    else if (points >= 100) grade = "D";

    return `${grade} ${points}`;
}

/**
 * Calculate estimated fees (simplified)
 */
function calculateFees(volume: number): string {
    // Assuming average 0.5-1% fees
    const feePercentage = 0.5 + Math.random() * 0.5;
    return `${feePercentage.toFixed(2)}%`;
}

/**
 * Transform TokenOverview from API to TokenTableData for the table
 */
export function transformTokenOverview(token: TokenOverview): TokenTableData {
    return {
        id: token.address,
        token: {
            iconUrl: token.logo_uri || "/icons/default-token.png",
            ticker: token.symbol,
            name: token.name,
            priceHistory: token.price_sparkline || [],
            category: token.category as string, // Category mapping may need adjustment
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
            buyCount: token.txns_24h.buys,
            sellCount: token.txns_24h.sells,
            buyVolumn: Math.floor(token.txns_24h.buys * 0.6), // Estimated buy volume
            sellVolumn: Math.floor(token.txns_24h.sells * 0.4) // Estimated sell volume
        },
        audit: [
            {
                label: "Risk",
                value: calculateRiskPercentage(Number(token.audit.risk_score)),
                trend: Number(token.audit.risk_score) > 70 ? "down" : Number(token.audit.risk_score) > 40 ? "neutral" : "up"
            },
            {
                label: "Fees",
                value: calculateFees(Number(token.volume_24h)),
                trend: "up"
            },
            {
                label: "Score",
                value: calculateAuditScore(token.audit),
                trend: "neutral"
            }
        ]
    };
}

/**
 * Transform array of TokenOverview to TokenTableData
 */
export function transformTokenOverviews(tokens: TokenOverview[]): TokenTableData[] {
    return tokens.map(transformTokenOverview);
}
