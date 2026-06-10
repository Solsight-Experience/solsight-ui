"use client";

import { Shield, ShieldCheck, ShieldOff } from "lucide-react";
import { SegmentedItem } from "../core/control-base-classes";
import type { SwapRequestFragment } from "../core/types";

type AntiMevOption = "off" | "red" | "sec";

export class AntiMevItem extends SegmentedItem<AntiMevOption> {
    readonly id = "antiMev" as const;
    readonly label = "Anti-MEV RPC";
    readonly icon = Shield;

    readonly options: ReadonlyArray<{ id: AntiMevOption; icon: React.FC<{ className?: string }>; label: string }> = [
        { id: "off", icon: ShieldOff, label: "Off" },
        { id: "red", icon: Shield, label: "Red." },
        { id: "sec", icon: ShieldCheck, label: "Sec." }
    ];

    getDefaultState() {
        return { value: "red" as AntiMevOption };
    }

    serialize(state: { value: AntiMevOption }): SwapRequestFragment {
        return { antiMevRpc: state.value };
    }

    getCompactDisplay(state: { value: AntiMevOption }): React.ReactNode {
        const selectedOption = this.options.find((opt) => opt.id === state.value);
        return (
            <span className="inline-flex items-center gap-1">
                <Shield className="h-3 w-3" />
                {selectedOption?.label ?? "Red."}
            </span>
        );
    }
}

export const antiMevItem = new AntiMevItem();
