import type { ConnectionStatus } from "../types";

export interface StreamAdapter {
    connect(): void;
    disconnect(): void;
    subscribe(channel: string, payload: Record<string, string>, roomKey?: string, unsubscribeChannel?: string): void;
    unsubscribe(channel: string, payload: Record<string, string>): void;
    on(event: string, handler: (...args: unknown[]) => void, roomKey?: string): () => void;
    off(event: string, handler: (...args: unknown[]) => void): void;
    emit(event: string, data?: unknown): void;
    onReconnect(callback: () => void): () => void;
    getStatus(): ConnectionStatus;
    onStatusChange(callback: (status: ConnectionStatus) => void): () => void;
}
