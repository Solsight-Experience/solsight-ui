import type { ConfigCtx, LockResult, SwapConfigId, SwapRequestFragment, Validation } from "./types";

export abstract class SwapConfigItem<TState> {
    abstract readonly id: SwapConfigId;
    abstract readonly label: string;
    abstract readonly icon: React.FC<{ className?: string }>;
    readonly tooltip?: string;

    // Lifecycle
    abstract getDefaultState(): TState;
    abstract serialize(state: TState, ctx: ConfigCtx): SwapRequestFragment;

    // Cross-item awareness — default no-ops
    isVisible(_ctx: ConfigCtx): boolean {
        return true;
    }
    isLocked(_ctx: ConfigCtx): LockResult {
        return { locked: false };
    }
    validate(_state: TState, _ctx: ConfigCtx): Validation | null {
        return null;
    }

    // Render contract — surface-specific
    abstract getCompactDisplay(state: TState, ctx: ConfigCtx): React.ReactNode;
    abstract renderExpandedForm(props: ExpandedFormProps<TState>): React.ReactNode;
}

export interface ExpandedFormProps<TState> {
    state: TState;
    ctx: ConfigCtx;
    onChange: (next: TState) => void;
}
