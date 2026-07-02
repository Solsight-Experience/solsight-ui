import type { SwapConfigId } from "./types";

export type ItemStates = Record<SwapConfigId, unknown>;

export interface ModeCustomState {
    mode: "auto" | "custom";
    custom: number | null;
}

// When TipFee switches to custom mode, force PriorityFee into custom mode too.
// Seed PriorityFee.custom from its existing custom value if present; otherwise
// leave null so the render layer can fall back to autoValue(ctx) at display time.
export function applyItemChange(items: ItemStates, id: SwapConfigId, next: unknown): ItemStates {
    const updated: ItemStates = { ...items, [id]: next };

    if (id === "tipFee") {
        const tipState = next as ModeCustomState;
        if (tipState.mode === "custom") {
            const priorityState = updated.priorityFee as ModeCustomState;
            if (priorityState.mode === "auto") {
                updated.priorityFee = {
                    mode: "custom",
                    custom: priorityState.custom
                };
            }
        }
    }

    return updated;
}
