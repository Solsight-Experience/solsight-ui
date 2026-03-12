import apiClient from '@/lib/api-client';
import { NotificationsResponse, UnreadCountResponse } from '../types/notification.types';

const ENDPOINTS = {
  notifications: '/notifications',
  unreadCount: '/notifications/unread-count',
  markAsRead: (id: string) => `/notifications/${id}/read`,
  markAllAsRead: '/notifications/read-all',
} as const;

export async function fetchNotifications(params?: {
  limit?: number;
  cursor?: string;
  'filter[type]'?: string;
  'filter[isRead]'?: boolean;
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
