import { SocketManager, type EventHandler } from "@/lib/socket-client";
import useClusterStore, { type Cluster } from "@/stores/cluster.store";

export interface TokenSubscribeDto {
    domain: string;
    resource: string;
    interval: string;
}
export interface TokenUnsubscribeDto {
    domain: string;
    resource: string;
    interval: string;
}

export class TokenSocketManager extends SocketManager {
    private static instance: TokenSocketManager;
    private readonly subscriptions = new Map<string, TokenSubscribeDto>();

    private constructor() {
        super();
        this.socket.on("connect", () => {
            this.subscriptions.forEach((dto) => {
                this.socket.emit("token:subscribe", this.withCluster(dto));
            });
        });
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new TokenSocketManager();
        }
        return this.instance;
    }

    subscribe(dto: TokenSubscribeDto) {
        this.connect();
        const key = this.buildKey(dto);
        this.subscriptions.set(key, dto);
        this.socket.emit("token:subscribe", this.withCluster(dto));
    }

    unsubscribe(dto: TokenUnsubscribeDto) {
        const key = this.buildKey(dto);
        this.subscriptions.delete(key);
        this.socket.emit("token:unsubscribe", this.withCluster(dto));
        this.offKey(key);
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
        this.subscriptions.forEach((dto) => {
            this.socket.emit("token:unsubscribe", this.withCluster(dto));
        });
        super.disconnect();
    }

    /** FE & BE dùng CHUNG logic room */
    private buildKey(dto: TokenSubscribeDto) {
        return `${dto.domain}:${this.getCluster()}:${dto.resource}:${dto.interval}`;
    }

    private withCluster(dto: TokenSubscribeDto | TokenUnsubscribeDto) {
        return {
            cluster: this.getCluster(),
            ...dto
        };
    }

    private getCluster(): Cluster {
        return useClusterStore.getState().cluster;
    }
}
