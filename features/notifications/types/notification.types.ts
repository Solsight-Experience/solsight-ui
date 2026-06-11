export enum NotificationEventType {
    SWAP_EXECUTED = "swap_executed",
    SWAP_FAILED = "swap_failed",
    TRANSACTION_CONFIRMED = "transaction_confirmed",
    TRANSACTION_FAILED = "transaction_failed",
    PRICE_ALERT_TRIGGERED = "price_alert_triggered",
    SECURITY_ALERT = "security_alert",
    SYSTEM_ANNOUNCEMENT = "system_announcement"
}

export interface NotificationMetadata {
    mintIn?: string;
    mintOut?: string;
    tokenIn?: string;
    tokenOut?: string;
    tokenInLogo?: string;
    tokenOutLogo?: string;
    tokenMint?: string;
    tokenLogo?: string;
    tokenSymbol?: string;
    walletAddress?: string;
    walletShort?: string;
    txUrl?: string;
}

export interface Notification {
    id: string;
    userId: string;
    type: NotificationEventType;
    title: string;
    message: string;
    metadata?: NotificationMetadata;
    isRead: boolean;
    createdAt: string;
}

export interface NotificationsResponse {
    notifications: Notification[];
    hasMore: boolean;
}

export interface UnreadCountResponse {
    count: number;
}
