export enum NotificationEventType {
    SWAP_EXECUTED = "swap_executed",
    SWAP_FAILED = "swap_failed",
    TRANSACTION_CONFIRMED = "transaction_confirmed",
    TRANSACTION_FAILED = "transaction_failed",
    PRICE_ALERT_TRIGGERED = "price_alert_triggered",
    SECURITY_ALERT = "security_alert",
    SYSTEM_ANNOUNCEMENT = "system_announcement"
}

export interface Notification {
    id: string;
    userId: string;
    type: NotificationEventType;
    title: string;
    message: string;
    metadata?: Record<string, unknown>;
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
