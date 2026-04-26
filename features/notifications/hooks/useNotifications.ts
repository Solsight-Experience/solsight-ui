"use client";

import { useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNotificationStore } from "../stores/notification.store";
import { useStream } from "@/hooks/useStream";
import type { Notification } from "../types/notification.types";

export function useNotifications() {
    const { user } = useAuth();
    const store = useNotificationStore();

    const handleNewNotification = useCallback(
        (notification: Notification) => {
            store.addNotification(notification);
            toast(notification.title, {
                description: notification.message,
                duration: 5000,
                action: {
                    label: "View",
                    onClick: () => store.setPanelOpen(true)
                }
            });
        },
        // store actions are stable (zustand), safe to omit from deps
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    const handleNewNotificationRef = useRef(handleNewNotification);
    handleNewNotificationRef.current = handleNewNotification;

    // useStream handles:
    // - subscribe/unsubscribe lifecycle
    // - reconnect re-subscription (replaces manual socket.on('connect', handleReconnect))
    // - params stability (replaces subscribedUserIdRef dedup)
    // - onEvent fires for EVERY notification (prevents React batching loss -- Architect R2-1)
    useStream(
        "NOTIFICATIONS",
        { userId: user?.id ?? "" },
        {
            enabled: !!user,
            onEvent: (notification) => handleNewNotificationRef.current(notification)
        }
    );

    // PRESERVED: Fetch initial notifications when user logs in
    useEffect(() => {
        if (user) {
            store.fetchInitial();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    // PRESERVED: Reset store when user logs out
    useEffect(() => {
        if (!user) {
            store.reset();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    return {
        notifications: store.notifications,
        unreadCount: store.unreadCount,
        hasMore: store.hasMore,
        isLoading: store.isLoading,
        isPanelOpen: store.isPanelOpen,
        setPanelOpen: store.setPanelOpen,
        markAsRead: store.markAsRead,
        markAllAsRead: store.markAllAsRead,
        deleteNotification: store.deleteNotification,
        deleteAllNotifications: store.deleteAllNotifications,
        loadMore: store.loadMore
    };
}
