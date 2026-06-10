"use client";

import React from "react";
import { SWAP_CONFIG_ITEMS } from "../items";
import { InfoTooltip } from "./InfoTooltip";
import type { SwapConfigSurfaceProps } from "./types";

export const SwapConfigPanel: React.FC<SwapConfigSurfaceProps> = ({ ctx, states, onItemChange }) => {
    return (
        <div className="flex flex-col">
            {SWAP_CONFIG_ITEMS.map((item) => {
                if (!item.isVisible(ctx)) {
                    return null;
                }
                const state = states[item.id];

                return (
                    <div key={item.id} className="flex items-start gap-4 py-2 min-w-0">
                        <div className="flex items-center gap-1 w-32 text-xs text-zinc-400 shrink-0">
                            {item.label}
                            {item.tooltip && <InfoTooltip content={item.tooltip} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            {(
                                item as {
                                    renderExpandedForm: (props: { state: unknown; ctx: typeof ctx; onChange: (next: unknown) => void }) => React.ReactNode;
                                }
                            ).renderExpandedForm({
                                state,
                                ctx,
                                onChange: (next: unknown) => onItemChange(item.id, next)
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
