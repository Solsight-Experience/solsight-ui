import apiClient from "@/lib/network-requests/api-client";
import { TelegramSubscriptionStatus, GenerateTelegramTokenResponse } from "../types/watchlist.types";

const BASE = "/telegram/subscription";

export const telegramService = {
    getSubscription: () => apiClient.get<TelegramSubscriptionStatus>(BASE),
    generateToken: () => apiClient.post<GenerateTelegramTokenResponse>(`${BASE}/token`),
    getStatus: () => apiClient.get<TelegramSubscriptionStatus>(`${BASE}/status`),
    disconnect: () => apiClient.delete<{ success: boolean }>(BASE)
};
