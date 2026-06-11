import apiClient from "@/lib/api-client";
import { ZaloSubscriptionStatus, GenerateZaloTokenResponse } from "../types/watchlist.types";

const BASE = "/api/zalo/subscription";

export const zaloService = {
    getSubscription: () => apiClient.get<ZaloSubscriptionStatus>(BASE),
    generateToken: () => apiClient.post<GenerateZaloTokenResponse>(`${BASE}/token`),
    getStatus: () => apiClient.get<ZaloSubscriptionStatus>(`${BASE}/status`),
    disconnect: () => apiClient.delete<{ success: boolean }>(BASE)
};
