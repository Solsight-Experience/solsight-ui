import { useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNotificationStore } from "../stores/notification.store";
import { NotificationSocketManager } from "../services/notification.socket.service";
import { Notification } from "../types/notification.types";

export function useNotifications() {
    const { user } = useAuth();
    const notifications = useNotificationStore((state) => state.notifications);
    const unreadCount = useNotificationStore((state) => state.unreadCount);
    const hasMore = useNotificationStore((state) => state.hasMore);
    const isLoading = useNotificationStore((state) => state.isLoading);
    const isPanelOpen = useNotificationStore((state) => state.isPanelOpen);
    const fetchInitial = useNotificationStore((state) => state.fetchInitial);
    const loadMore = useNotificationStore((state) => state.loadMore);
    const addNotification = useNotificationStore((state) => state.addNotification);
    const markAsRead = useNotificationStore((state) => state.markAsRead);
    const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
    const deleteNotification = useNotificationStore((state) => state.deleteNotification);
    const deleteAllNotifications = useNotificationStore((state) => state.deleteAllNotifications);
    const setPanelOpen = useNotificationStore((state) => state.setPanelOpen);
    const reset = useNotificationStore((state) => state.reset);
    const subscribedUserIdRef = useRef<string | null>(null);

    const handleNewNotification = useCallback(
        (notification: Notification) => {
            addNotification(notification);
            toast(notification.title, {
                description: notification.message,
                duration: 5000,
                action: {
                    label: "View",
                    onClick: () => setPanelOpen(true)
                }
            });
        },
        [addNotification, setPanelOpen]
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
            reset();
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

        fetchInitial();

        const socket = NotificationSocketManager.getInstance();
        socket.subscribe(userId);
        socket.onNotification(userId, (notification) => handleNewNotificationRef.current(notification));

        // Re-subscribe after reconnect so client rejoins the user room
        const handleReconnect = () => socket.subscribe(userId);
        socket.getSocket().on("connect", handleReconnect);
        subscribedUserIdRef.current = userId;

        return () => {
            socket.getSocket().off("connect", handleReconnect);
            socket.unsubscribe(userId);
            subscribedUserIdRef.current = null;
        };
    }, [fetchInitial, reset, user]);

    return {
        notifications,
        unreadCount,
        hasMore,
        isLoading,
        isPanelOpen,
        setPanelOpen,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications,
        loadMore
    };
}
