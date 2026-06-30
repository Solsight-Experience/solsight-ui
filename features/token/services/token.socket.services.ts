import { SocketManager, type EventHandler } from "@/lib/socket-client";
import type { Cluster } from "@/stores/cluster.store";

export interface TokenSubscribeDto {
    cluster: Cluster;
    domain: string;
    resource: string;
    interval: string;
}
export interface TokenUnsubscribeDto {
    cluster: Cluster;
    domain: string;
    resource: string;
    interval: string;
}

export class TokenSocketManager extends SocketManager {
    private static instance: TokenSocketManager;

    private constructor() {
        super();
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new TokenSocketManager();
        }
        return this.instance;
    }

    subscribe(dto: TokenSubscribeDto) {
        this.connect();
        console.log("Subscribing:", dto);
        this.socket.emit("token:subscribe", dto);
    }

    unsubscribe(dto: TokenUnsubscribeDto) {
        this.socket.emit("token:unsubscribe", dto);
        this.offKey(this.buildKey(dto));
    }

    onDomainEvent<T = unknown>(dto: TokenSubscribeDto, handler: EventHandler<T>) {
        const key = this.buildKey(dto);
        this.subscribe(dto);

        const wrapped = (payload: { room: string; data: T }) => {
            if (payload.room === key) {
                handler(payload.data);
            }
        };

        this.on(dto.domain, wrapped, key);
    }

    emitDomainEvent(dto: TokenSubscribeDto, data: unknown) {
        this.emit(dto.domain, {
            room: this.buildKey(dto),
            data
        });
    }

    override disconnect() {
        this.events.forEach((_, key) => {
            const [domain, cluster, resource, interval] = key.split(":");
            this.socket.emit("token:unsubscribe", {
                cluster,
                domain,
                resource,
                interval
            });
        });
        super.disconnect();
    }

    /** FE & BE dùng CHUNG logic room: domain:cluster:resource:interval */
    private buildKey(dto: TokenSubscribeDto) {
        return `${dto.domain}:${dto.cluster}:${dto.resource}:${dto.interval}`;
    }
}
