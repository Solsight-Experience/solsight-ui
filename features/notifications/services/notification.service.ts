import apiClient from "@/lib/api-client";
import { NotificationsResponse, UnreadCountResponse } from "../types/notification.types";

const ENDPOINTS = {
    notifications: "/api/notifications",
    unreadCount: "/api/notifications/unread-count",
    markAsRead: (id: string) => `/api/notifications/${id}/read`,
    markAllAsRead: "/api/notifications/read-all",
    deleteNotification: (id: string) => `/api/notifications/${id}`,
    deleteAllNotifications: "/api/notifications"
} as const;

export async function fetchNotifications(params?: {
    limit?: number;
    cursor?: string;
    "filter[type]"?: string;
    "filter[isRead]"?: boolean;
}): Promise<NotificationsResponse> {
    return apiClient.get<NotificationsResponse>(ENDPOINTS.notifications, { params });
}

export async function fetchUnreadCount(): Promise<UnreadCountResponse> {
    return apiClient.get<UnreadCountResponse>(ENDPOINTS.unreadCount);
}

export async function markAsRead(id: string): Promise<void> {
    return apiClient.patch<void>(ENDPOINTS.markAsRead(id));
}

export async function markAllAsRead(): Promise<void> {
    return apiClient.patch<void>(ENDPOINTS.markAllAsRead);
}

export async function deleteNotification(id: string): Promise<void> {
    return apiClient.delete<void>(ENDPOINTS.deleteNotification(id));
}

export async function deleteAllNotifications(): Promise<void> {
    return apiClient.delete<void>(ENDPOINTS.deleteAllNotifications);
}
