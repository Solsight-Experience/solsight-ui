import { io, type Socket, type ManagerOptions, type SocketOptions } from "socket.io-client";
import type { StreamAdapter } from "./types";
import type { ConnectionStatus } from "../types";

interface SubscriptionRecord {
    channel: string;
    unsubscribeChannel: string;
    payload: Record<string, string>;
    roomKey?: string;
}

export class SocketIoAdapter implements StreamAdapter {
    private socket: Socket;
    private activeSubscriptions: Map<string, SubscriptionRecord>;
    private statusCallbacks: Set<(status: ConnectionStatus) => void>;
    private reconnectCallbacks: Set<() => void>;
    private currentStatus: ConnectionStatus;
    // Maps original handler -> wrapped handler for room-filtered listeners
    private handlerMap: Map<(...args: unknown[]) => void, (...args: unknown[]) => void>;

    constructor(url: string, options?: Partial<ManagerOptions & SocketOptions>) {
        this.activeSubscriptions = new Map();
        this.statusCallbacks = new Set();
        this.reconnectCallbacks = new Set();
        this.currentStatus = "disconnected";
        this.handlerMap = new Map();

        this.socket = io(url, {
            transports: ["websocket", "polling"],
            withCredentials: true,
            autoConnect: false,
            ...options
        });

        this.socket.on("connect", () => {
            this.currentStatus = "connected";
            this.notifyStatusCallbacks("connected");
            // Re-subscribe all active subscriptions on connect/reconnect
            for (const sub of this.activeSubscriptions.values()) {
                this.socket.emit(sub.channel, sub.payload);
            }
            for (const cb of this.reconnectCallbacks) {
                cb();
            }
        });

        this.socket.on("disconnect", () => {
            this.currentStatus = "disconnected";
            this.notifyStatusCallbacks("disconnected");
        });

        this.socket.on("connect_error", () => {
            this.currentStatus = "disconnected";
            this.notifyStatusCallbacks("disconnected");
        });

        this.socket.on("reconnect_attempt", () => {
            this.currentStatus = "reconnecting";
            this.notifyStatusCallbacks("reconnecting");
        });

        // reconnect_attempt is a manager event in socket.io v4, not on socket
        this.socket.io.on("reconnect_attempt", () => {
            this.currentStatus = "reconnecting";
            this.notifyStatusCallbacks("reconnecting");
        });
    }

    connect(): void {
        this.currentStatus = "connecting";
        this.notifyStatusCallbacks("connecting");
        this.socket.connect();
    }

    disconnect(): void {
        // Emit unsubscribe for all active subscriptions before closing
        for (const sub of this.activeSubscriptions.values()) {
            this.socket.emit(sub.unsubscribeChannel, sub.payload);
        }
        this.activeSubscriptions.clear();
        this.socket.disconnect();
        this.currentStatus = "disconnected";
        this.notifyStatusCallbacks("disconnected");
    }

    subscribe(channel: string, payload: Record<string, string>, roomKey?: string, unsubscribeChannel?: string): void {
        const id = this.subscriptionId(payload);
        this.activeSubscriptions.set(id, {
            channel,
            unsubscribeChannel: unsubscribeChannel || channel.replace(":subscribe", ":unsubscribe"),
            payload,
            roomKey
        });
        this.socket.emit(channel, payload);
    }

    unsubscribe(channel: string, payload: Record<string, string>): void {
        const id = this.subscriptionId(payload);
        this.activeSubscriptions.delete(id);
        this.socket.emit(channel, payload);
    }

    on(event: string, handler: (...args: unknown[]) => void, roomKey?: string): () => void {
        if (roomKey) {
            const wrappedHandler = (payload: { room: string; data: unknown }) => {
                if (payload.room === roomKey) {
                    handler(payload.data);
                }
            };
            // Store the mapping so off() can remove the right handler
            this.handlerMap.set(handler, wrappedHandler as (...args: unknown[]) => void);
            this.socket.on(event, wrappedHandler);
            return () => {
                this.socket.off(event, wrappedHandler);
                this.handlerMap.delete(handler);
            };
        } else {
            this.socket.on(event, handler);
            return () => {
                this.socket.off(event, handler);
            };
        }
    }

    off(event: string, handler: (...args: unknown[]) => void): void {
        const wrapped = this.handlerMap.get(handler);
        if (wrapped) {
            this.socket.off(event, wrapped);
            this.handlerMap.delete(handler);
        } else {
            this.socket.off(event, handler);
        }
    }

    emit(event: string, data?: unknown): void {
        this.socket.emit(event, data);
    }

    onReconnect(callback: () => void): () => void {
        this.reconnectCallbacks.add(callback);
        return () => {
            this.reconnectCallbacks.delete(callback);
        };
    }

    getStatus(): ConnectionStatus {
        return this.currentStatus;
    }

    onStatusChange(callback: (status: ConnectionStatus) => void): () => void {
        this.statusCallbacks.add(callback);
        return () => {
            this.statusCallbacks.delete(callback);
        };
    }

    private subscriptionId(payload: Record<string, string>): string {
        return `subscription:${JSON.stringify(payload)}`;
    }

    private notifyStatusCallbacks(status: ConnectionStatus): void {
        for (const cb of this.statusCallbacks) {
            cb(status);
        }
    }
}
