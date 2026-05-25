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
        // SocketManager uses EventHandler = (...args: any[]) => void
        // Wrap handler to adapt unknown incoming args into the typed Notification
        const wrapped: (...args: any[]) => void = (args: any) => {
            try {
                handler(args as Notification);
            } catch (e) {
                // ignore
            }
        };

        this.on("notification", wrapped, `notifications:${userId}`);
    }
}
