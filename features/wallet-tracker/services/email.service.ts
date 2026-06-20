import apiClient from "@/lib/network-requests/api-client";
import { EmailSubscriptionStatus } from "../types/watchlist.types";

const BASE = "/email/subscription";

export const emailService = {
    getSubscription: () => apiClient.get<EmailSubscriptionStatus>(BASE),
    submitEmail: (email: string) => apiClient.post<{ success: boolean }>(BASE, { email }),
    getStatus: () => apiClient.get<EmailSubscriptionStatus>(`${BASE}/status`),
    disconnect: () => apiClient.delete<{ success: boolean }>(BASE)
};
