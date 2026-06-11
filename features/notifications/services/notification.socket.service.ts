import { SocketManager } from "@/lib/socket-client";
import { Notification } from "../types/notification.types";

export class NotificationSocketManager extends SocketManager {
    private static instance: NotificationSocketManager;

    private constructor() {
        super();
    }

    static getInstance(): NotificationSocketManager {
        if (!this.instance) {
            this.instance = new NotificationSocketManager();
        }
        return this.instance;
    }

    subscribe(userId: string): void {
        this.connect();
        this.emit("notification:subscribe", { userId });
    }

    unsubscribe(userId: string): void {
        this.emit("notification:unsubscribe", { userId });
        this.offKey(`notifications:${userId}`);
    }

    onNotification(userId: string, handler: (data: Notification) => void): void {
        this.on<Notification>("notification", handler, `notifications:${userId}`);
    }
}
