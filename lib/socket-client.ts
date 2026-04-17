import { io, Socket } from "socket.io-client";

export type EventHandler = (...args: unknown[]) => void;

export class SocketManager {
    protected socket: Socket;
    protected events = new Map<string, Array<{ event: string; handler: EventHandler }>>();

    protected constructor() {
        this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
            transports: ["websocket", "polling"],
            withCredentials: true,
            autoConnect: false
        });
    }

    protected connect() {
        if (!this.socket.connected) {
            this.socket.connect();
        }
    }

    on(event: string, handler: EventHandler, key?: string) {
        this.connect();
        this.socket.on(event, handler);

        if (!key) return;

        const list = this.events.get(key) ?? [];
        list.push({ event, handler });
        this.events.set(key, list);
    }

    offKey(key: string) {
        const list = this.events.get(key);
        if (!list) return;

        list.forEach(({ event, handler }) => {
            this.socket.off(event, handler);
        });

        this.events.delete(key);
    }

    emit(event: string, data?: unknown) {
        this.connect();
        this.socket.emit(event, data);
    }

    getSocket(): Socket {
        return this.socket;
    }

    disconnect() {
        this.events.forEach((_, key) => this.offKey(key));
        this.socket.disconnect();
        this.events.clear();
    }
}
