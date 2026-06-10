import { io, Socket } from "socket.io-client";
import useClusterStore from "@/stores/cluster.store";

export type EventHandler<T = unknown> = { bivarianceHack(payload: T): void }["bivarianceHack"];

export class SocketManager {
    protected socket: Socket;
    protected events = new Map<string, Array<{ event: string; handler: EventHandler<unknown> }>>();

    protected constructor() {
        const opts: Record<string, unknown> = {
            transports: ["websocket", "polling"],
            withCredentials: true,
            autoConnect: false
        };

        const cluster = useClusterStore.getState().cluster;
        if (cluster) {
            opts.auth = { cluster };
        }

        this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, opts);

        // subscribe to cluster changes so we can re-handshake
        let prevCluster = cluster;
        useClusterStore.subscribe((state) => {
            if (state.cluster === prevCluster) return;
            prevCluster = state.cluster;
            this.socket.auth = { cluster: prevCluster };
            this.disconnect();
            this.connect();
        });
    }

    protected connect() {
        if (!this.socket.connected) {
            this.socket.connect();
        }
    }

    on<T = unknown>(event: string, handler: EventHandler<T>, key?: string) {
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

    emit<T = unknown>(event: string, data?: T) {
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

    static subscribeToCluster(_socketManagerInstance: SocketManager) {
        // noop - deprecated
    }
}
