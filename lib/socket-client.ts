import { io, Socket } from "socket.io-client";
import useClusterStore from "@/stores/cluster.store";

export type EventHandler = (...args: any[]) => void;

export class SocketManager {
    protected socket: Socket;
    protected events = new Map<string, Array<{ event: string; handler: EventHandler }>>();

    protected constructor() {
        const opts: any = {
            transports: ["websocket", "polling"],
            withCredentials: true,
            autoConnect: false
        };

        // Include cluster in auth handshake
        try {
            const cluster = useClusterStore?.getState?.().cluster;
            if (cluster) {
                opts.auth = { cluster };
            }
        } catch {
            // ignore
        }

        this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, opts);

        // subscribe to cluster changes so we can re-handshake
        try {
            if (useClusterStore && useClusterStore.subscribe) {
                // subscribe to full state and react to cluster changes
                let prevCluster: string | undefined = undefined;
                const unsub = useClusterStore.subscribe((s) => {
                    const newCluster = (s as any).cluster as string;
                    if (newCluster === prevCluster) return;
                    prevCluster = newCluster;
                    try {
                        this.socket.auth = { cluster: newCluster };
                    } catch (e) {}
                    try {
                        this.disconnect();
                    } catch (e) {}
                    try {
                        this.connect();
                    } catch (e) {}
                });
                // ensure we don't leak subscription from constructor
                // note: leaving unsub in scope for GC; SocketManager instances are singletons in services
            }
        } catch (e) {
            // ignore
        }
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

    static subscribeToCluster(_socketManagerInstance: SocketManager) {
        // noop - deprecated
    }
}
