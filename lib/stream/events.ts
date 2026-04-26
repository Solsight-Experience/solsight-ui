import type { TokenDetail, TradeStreamResponse, TopTrader, HolderUpdatePayload } from "@/features/token/types/token.types";
import type { Notification } from "@/features/notifications/types/notification.types";

// Per-entry params types (one per registry key)
export interface StreamParamsMap {
    TOKEN_STATS: { domain: string; resource: string; interval: string };
    TOKEN_TRADES: { domain: string; resource: string; interval: string };
    TOKEN_TOP_TRADERS: { domain: string; resource: string; interval: string };
    TOKEN_HOLDERS: { domain: string; resource: string; interval: string };
    TOKEN_CHART: { domain: string; resource: string; interval: string };
    NOTIFICATIONS: { userId: string };
}

// Maps STREAMS registry keys to their data payload types
export interface StreamEventMap {
    TOKEN_STATS: TokenDetail;
    TOKEN_TRADES: TradeStreamResponse;
    TOKEN_TOP_TRADERS: { data: TopTrader };
    TOKEN_HOLDERS: HolderUpdatePayload;
    TOKEN_CHART: { priceOHLC: { open: number; high: number; low: number; close: number }; time: number };
    NOTIFICATIONS: Notification;
}
