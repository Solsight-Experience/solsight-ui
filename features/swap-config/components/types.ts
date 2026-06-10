import type { SwapConfigId, ConfigCtx } from "../core/types";

// Untyped state map keyed by item ID. Each item knows its own state shape;
// components receive whichever subset is relevant via the adapter.
export type SwapConfigStateMap = Record<SwapConfigId, unknown>;

export interface SwapConfigSurfaceProps {
    ctx: ConfigCtx;
    states: SwapConfigStateMap;
    onItemChange: (id: SwapConfigId, next: unknown) => void;
}
