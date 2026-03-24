// Wallet Types
export interface Wallet {
    address: string;
    name: string;
    icon: string;
    is_default: boolean;
    is_connected: boolean;
    added_at: string;
    balance_sol: number;
    balance_usd: number;
    positions: Position[];
    summary: WalletSummary;
}

export interface Position {
    token: TokenInfo;
    balance: number;
    avg_buy_price: number;
    current_price: number;
    value_usd: number;
    price_change_24h: number;
    total_bought: number;
    total_sold: number;
    realized_pnl: number;
    unrealized_pnl: number;
    total_pnl: number;
    roi_percent: number;
    percent_of_portfolio: number;
}

export interface TokenInfo {
    address: string;
    symbol: string;
    name: string;
    logo_uri: string;
}

export interface WalletSummary {
    total_value_usd: number;
    total_tokens: number;
    total_pnl: number;
}

// Portfolio Overview Types
export interface PortfolioOverview {
    total_balance_usd: number;
    total_balance_sol: number;
    balance_change_24h: number;
    pnl: PnlData;
    transactions: TransactionStats;
    top_tokens: TopToken[];
    allocation: AllocationItem[];
}

export interface PnlData {
    total: number;
    realized: number;
    unrealized: number;
    change_24h: number;
    roi_percent: number;
}

export interface TransactionStats {
    total: number;
    buys: number;
    sells: number;
    transfers: number;
    last_24h: number;
}

export interface TopToken {
    address: string;
    symbol: string;
    name: string;
    logo_uri: string;
    balance: number;
    value_usd: number;
    percent_of_portfolio: number;
    pnl: number;
    price_change_24h: number;
}

export interface AllocationItem {
    symbol: string;
    value_usd: number;
    percent: number;
}

// Activity Types
export type ActivityType = "SWAP" | "TRANSFER_IN" | "TRANSFER_OUT" | "STAKE" | "UNSTAKE";
export type ActivityStatus = "success" | "failed" | "pending";

export interface Activity {
    tx_hash: string;
    type: ActivityType;
    timestamp: number;
    status: ActivityStatus;
    app: AppInfo;
    token_in?: TokenAmount;
    token_out?: TokenAmount;
    token?: TokenAmount;
    from?: string;
    to?: string;
    wallet: string;
    wallet_icon?: string;
    tags: string[];
    fee_sol: number;
    fee_usd: number;
    tx_url: string;
}

export interface AppInfo {
    name: string;
    type: string;
    icon: string;
}

export interface TokenAmount {
    address: string;
    symbol: string;
    amount: number;
    value_usd: number;
}

export interface ActivitiesResponse {
    activities: Activity[];
    total: number;
    summary: {
        total_volume_usd: number;
        total_fees_usd: number;
    };
}

// API Response Types
export interface WalletsResponse {
    wallets: Wallet[];
    total_wallets: number;
    total_balance_sol: number;
    total_balance_usd: number;
}

export interface PositionsResponse {
    positions: Position[];
    summary: {
        total_value_usd: number;
        total_tokens: number;
        total_pnl: number;
    };
}

// Chart Data Types
export interface ChartDataPoint {
    timestamp: number;
    value: number;
}
