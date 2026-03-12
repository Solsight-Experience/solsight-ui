import { create } from 'zustand';
import {
  fetchNotifications,
  fetchUnreadCount,
  markAsRead as apiMarkAsRead,
  markAllAsRead as apiMarkAllAsRead,
} from '../services/notification.service';
import { Notification } from '../types/notification.types';

const PAGE_LIMIT = 20;

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  hasMore: boolean;
  cursor: string | null;
  isLoading: boolean;
  isPanelOpen: boolean;

  fetchInitial: () => Promise<void>;
  loadMore: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  setPanelOpen: (open: boolean) => void;
  reset: () => void;
}

const initialState = {
  notifications: [],
  unreadCount: 0,
  hasMore: false,
  cursor: null,
  isLoading: false,
  isPanelOpen: false,
};

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  ...initialState,

  fetchInitial: async () => {
    set({ isLoading: true });
    const [notificationsRes, unreadRes] = await Promise.all([
      fetchNotifications({ limit: PAGE_LIMIT }),
      fetchUnreadCount(),
    ]);
    set({
      notifications: notificationsRes.notifications,
      hasMore: notificationsRes.hasMore,
      cursor: notificationsRes.notifications.at(-1)?.id ?? null,
      unreadCount: unreadRes.count,
      isLoading: false,
    });
  },

  loadMore: async () => {
    const { cursor, isLoading, hasMore, notifications } = get();
    if (isLoading || !hasMore || !cursor) return;
    set({ isLoading: true });
    const res = await fetchNotifications({ limit: PAGE_LIMIT, cursor });
    set({
      notifications: [...notifications, ...res.notifications],
      hasMore: res.hasMore,
      cursor: res.notifications.at(-1)?.id ?? cursor,
      isLoading: false,
    });
  },

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n,
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
    apiMarkAsRead(id);
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
    apiMarkAllAsRead();
  },

  setPanelOpen: (open) => set({ isPanelOpen: open }),

  reset: () => set(initialState),
}));
