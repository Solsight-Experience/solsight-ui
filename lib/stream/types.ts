export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "reconnecting";

export interface StreamRegistryEntry<TParams = Record<string, string>> {
    subscribe: string;
    unsubscribe: string;
    event: string;
    buildSubscribePayload: (params: TParams) => Record<string, string>;
    buildRoomKey?: (params: TParams) => string;
}
