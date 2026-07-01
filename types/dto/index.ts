// DTOs that mirror your NestJS backend entities

// User DTOs
export interface CreateUserDto {
    email: string;
    password: string;
    publicKey: string;
}

export interface UpdateUserDto {
    email?: string;
    publicKey?: string;
}

export interface UserResponseDto {
    id: string;
    email: string;
    publicKey: string;
    createdAt: string;
    updatedAt: string;
}

// Wallet DTOs
export interface CreateWalletDto {
    publicKey: string;
    walletType: string;
    userId: string;
}

export interface WalletResponseDto {
    id?: string;
    publicKey?: string;
    walletType?: string;
    balance?: number;
    userId?: string;
    createdAt?: string;
    updatedAt?: string;
    address: string;
    name: string;
    icon: string;
    is_default: boolean;
    is_connected: boolean;
    added_at: string;
    balance_sol: number;
    balance_usd: number;
}

export interface GetWalletsResponseDto {
    wallets: WalletResponseDto[];
    total_wallets: number;
    total_balance_sol: number;
    total_balance_usd: number;
}

// Transaction DTOs
export interface CreateTransactionDto {
    fromAddress: string;
    toAddress: string;
    amount: number;
    tokenMint?: string;
    memo?: string;
}

export interface TransactionResponseDto {
    id: string;
    signature?: string;
    fromAddress: string;
    toAddress: string;
    amount: number;
    tokenMint?: string;
    memo?: string;
    status: "pending" | "confirmed" | "failed" | "cancelled";
    blockTime?: number;
    slot?: number;
    fee?: number;
    createdAt: string;
    updatedAt: string;
}

// Auth DTOs
export interface LoginDto {
    email: string;
    password: string;
}

export interface RegisterDto {
    email: string;
    password: string;
    publicKey: string;
}

export interface AuthResponseDto {
    user: UserResponseDto;
    accessToken: string;
    refreshToken: string;
}

// Chat DTOs
export interface ChatMessageDto {
    role: "user" | "assistant" | "tool";
    content: string;
    type?: "text" | "token_brief" | "portfolio_summary" | "portfolio_activities" | "portfolio_performance" | "navigation" | "trade_intent" | "slippage_action";
    data?: Record<string, unknown>;
    timestamp: number;
    toolCallId?: string;
    toolName?: string;
}

export interface ChatPageContext {
    pathname: string;
    tokenAddress?: string;
    tokenSymbol?: string;
    tokenName?: string;
}

export interface SendChatMessageDto {
    cluster: "mainnet" | "devnet";
    message: string;
    sessionId: string;
    userId?: string;
    walletAddress?: string;
    pageContext?: ChatPageContext;
}

export interface ChatResponseDto {
    sessionId: string;
    type: "text" | "token_brief" | "portfolio_summary" | "portfolio_activities" | "portfolio_performance" | "navigation" | "trade_intent" | "slippage_action";
    content?: string;
    data?: Record<string, unknown>;
}
