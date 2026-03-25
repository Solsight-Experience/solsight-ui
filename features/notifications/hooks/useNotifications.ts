import { useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNotificationStore } from "../stores/notification.store";
import { NotificationSocketManager } from "../services/notification.socket.service";
import { Notification } from "../types/notification.types";

export function useNotifications() {
    const { user } = useAuth();
    const store = useNotificationStore();
    const subscribedUserIdRef = useRef<string | null>(null);

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

    useEffect(() => {
        if (!user) {
            // User logged out — clean up any existing subscription
            if (subscribedUserIdRef.current) {
                const socket = NotificationSocketManager.getInstance();
                socket.unsubscribe(subscribedUserIdRef.current);
                subscribedUserIdRef.current = null;
            }
            store.reset();
            return;
        }

        const userId = user.id;

        // Avoid re-subscribing if already subscribed for this user
        if (subscribedUserIdRef.current === userId) return;

        // Clean up previous subscription if user switched
        if (subscribedUserIdRef.current) {
            const socket = NotificationSocketManager.getInstance();
            socket.unsubscribe(subscribedUserIdRef.current);
        }

        store.fetchInitial();

        const socket = NotificationSocketManager.getInstance();
        socket.subscribe(userId);
        socket.onNotification(userId, (notification) => handleNewNotificationRef.current(notification));
        subscribedUserIdRef.current = userId;

        return () => {
            socket.unsubscribe(userId);
            subscribedUserIdRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    return {
        notifications: store.notifications,
        unreadCount: store.unreadCount,
        hasMore: store.hasMore,
        isLoading: store.isLoading,
        isPanelOpen: store.isPanelOpen,
        setPanelOpen: store.setPanelOpen,
        markAsRead: store.markAsRead,
        markAllAsRead: store.markAllAsRead,
        loadMore: store.loadMore
    };
}
