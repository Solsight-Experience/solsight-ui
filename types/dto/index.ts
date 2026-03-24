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
    id: string;
    publicKey: string;
    walletType: string;
    balance?: number;
    userId: string;
    createdAt: string;
    updatedAt: string;
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
    role: "user" | "assistant";
    content: string;
    type?: "text" | "token_brief" | "portfolio_summary" | "navigation" | "trade_intent";
    data?: Record<string, unknown>;
    timestamp: number;
}

export interface SendChatMessageDto {
    message: string;
    sessionId: string;
    userId?: string;
    walletAddress?: string;
}

export interface ChatResponseDto {
    sessionId: string;
    type: "text" | "token_brief" | "portfolio_summary" | "navigation" | "trade_intent";
    content?: string;
    data?: Record<string, unknown>;
}
