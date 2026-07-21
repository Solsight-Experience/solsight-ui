"use client";

import { Shield, ShieldCheck, ShieldOff } from "lucide-react";
import { ExecutorCapability } from "@/features/swap/types";
import { SegmentedItem } from "../core/control-base-classes";
import type { ConfigCtx, SwapRequestFragment } from "../core/types";

type AntiMevOption = "off" | "sec";

export class AntiMevItem extends SegmentedItem<AntiMevOption> {
    readonly id = "antiMev" as const;
    readonly label = "Anti-MEV RPC";
    readonly icon = Shield;

    readonly options: ReadonlyArray<{ id: AntiMevOption; icon: React.FC<{ className?: string }>; label: string; tooltip: string }> = [
        { id: "off", icon: ShieldOff, label: "Off", tooltip: "Off protection: transactions sent to all nodes, very fast" },
        { id: "sec", icon: ShieldCheck, label: "Sec.", tooltip: "Reduced protection: transactions sent to limited nodes, fast, maybe front-run" }
    ];

    getDefaultState() {
        return { value: "sec" as AntiMevOption };
    }

    isVisible(ctx: ConfigCtx): boolean {
        return ctx.swapInfo?.capabilities?.includes(ExecutorCapability.MevProtection) ?? false;
    }

    serialize(state: { value: AntiMevOption }): SwapRequestFragment {
        return { antiMevRpc: state.value };
    }

    getCompactDisplay(state: { value: AntiMevOption }): React.ReactNode {
        const selectedOption = this.options.find((opt) => opt.id === state.value);
        return (
            <span className="inline-flex items-center gap-1">
                <Shield className="h-3 w-3" />
                {selectedOption?.label ?? "Sec."}
            </span>
        );
    }
}

export const antiMevItem = new AntiMevItem();
