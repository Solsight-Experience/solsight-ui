// ── Wallet Alerts ─────────────────────────────────────────────────────────

export enum WalletAlertType {
    ANY_SWAP = "any_swap",
    TOKEN_BALANCE_CHANGE = "token_balance_change",
    LARGE_TRANSFER = "large_transfer"
}

export interface WalletAlertCondition {
    tokenMint?: string;
    tokenSymbol?: string;
    threshold?: number;
    thresholdType?: "amount" | "percentage";
    direction?: "increase" | "decrease" | "any";
    minAmountSol?: number;
}

export interface WalletAlert {
    id: string;
    userId: string;
    walletAddress: string;
    alertType: WalletAlertType;
    condition?: WalletAlertCondition;
    isActive: boolean;
    lastCheckedSignature?: string;
    createdAt: string;
}

export interface CreateWalletAlertDto {
    alertType: WalletAlertType;
    condition?: WalletAlertCondition;
    network?: "mainnet" | "devnet";
}

export interface UpdateWalletAlertDto {
    isActive?: boolean;
    condition?: WalletAlertCondition;
}

// ── Telegram ──────────────────────────────────────────────────────────────

export interface TelegramSubscriptionStatus {
    isVerified: boolean;
    verificationToken?: string;
    tokenExpiresAt?: string;
    verifiedAt?: string;
}

export interface GenerateTelegramTokenResponse {
    verificationToken: string;
    tokenExpiresAt: string;
    instructions: string;
}

// ── Email ─────────────────────────────────────────────────────────────────

export interface EmailSubscriptionStatus {
    isVerified: boolean;
    email?: string;
    verifiedAt?: string;
}

// ── Watchlist ─────────────────────────────────────────────────────────────

export interface WatchedWallet {
    id: string;
    walletAddress: string;
    userId: string;
    label?: string;
    network: "mainnet" | "devnet";
    createdAt: string;
}

export interface WatchlistResponse {
    wallets: WatchedWallet[];
    total: number;
}

export interface AddWatchedWalletDto {
    walletAddress: string;
    label?: string;
    network?: "mainnet" | "devnet";
}

export interface UpdateWatchedWalletDto {
    label: string;
}
