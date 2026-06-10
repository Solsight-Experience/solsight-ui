import { SocketManager, type EventHandler } from "@/lib/socket-client";

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
            const [domain, resource, interval] = key.split(":");
            this.socket.emit("token:unsubscribe", {
                domain,
                resource,
                interval
            });
        });
        super.disconnect();
    }

    /** FE & BE dùng CHUNG logic room */
    private buildKey(dto: TokenSubscribeDto) {
        return `${dto.domain}:${dto.resource}:${dto.interval}`;
    }
}
