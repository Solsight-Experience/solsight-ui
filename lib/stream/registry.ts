import type { StreamRegistryEntry } from "./types";
import type { StreamParamsMap } from "./events";

type TokenParams = StreamParamsMap["TOKEN_STATS"];

function tokenEntry(domain: string): StreamRegistryEntry<TokenParams> {
    return {
        subscribe: "token:subscribe",
        unsubscribe: "token:unsubscribe",
        event: domain,
        buildSubscribePayload: (p) => ({ domain, resource: p.resource, interval: p.interval }),
        buildRoomKey: (p) => `${domain}:${p.resource}:${p.interval}`
    };
}

export const STREAMS = {
    TOKEN_STATS: tokenEntry("stats"),
    TOKEN_TRADES: tokenEntry("trades"),
    TOKEN_TOP_TRADERS: tokenEntry("top_traders"),
    TOKEN_HOLDERS: tokenEntry("holders"),
    TOKEN_CHART: tokenEntry("priceOHLC"),
    NOTIFICATIONS: {
        subscribe: "notification:subscribe",
        unsubscribe: "notification:unsubscribe",
        event: "notification",
        buildSubscribePayload: (p: StreamParamsMap["NOTIFICATIONS"]) => ({ userId: p.userId })
    } satisfies StreamRegistryEntry<StreamParamsMap["NOTIFICATIONS"]>
} as const;

export type StreamKey = keyof typeof STREAMS;
