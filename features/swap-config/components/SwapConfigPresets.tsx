"use client";

import React from "react";
import { Save } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ItemStates } from "../core/apply-item-change";
import { useSwapConfigStore } from "../store";
import { useSwapPresetsStore, PRESET_SLOTS, type PresetSlot } from "../presets-store";

interface SwapConfigPresetsProps {
    liveItems: ItemStates;
}

export const SwapConfigPresets: React.FC<SwapConfigPresetsProps> = ({ liveItems }) => {
    const presets = useSwapPresetsStore((s) => s.presets);
    const activeSlot = useSwapPresetsStore((s) => s.activeSlot);
    const selectPreset = useSwapPresetsStore((s) => s.selectPreset);
    const setPresets = useSwapPresetsStore((s) => s.setPresets);
    const loadItems = useSwapConfigStore((s) => s.loadItems);

    const applyPreset = (slot: PresetSlot) => {
        selectPreset(slot);
        loadItems(presets[slot]);
    };

    const saveCurrentToActive = () => {
        setPresets({ ...presets, [activeSlot]: liveItems });
    };

    return (
        <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-(--text-muted)">Presets</span>
            <div className="flex items-center gap-1">
                {PRESET_SLOTS.map((slot) => {
                    const isActive = activeSlot === slot;

                    return (
                        <button
                            key={slot}
                            type="button"
                            onClick={() => applyPreset(slot)}
                            aria-label={`Apply Preset ${slot}`}
                            aria-pressed={isActive}
                            className={cn(
                                "flex items-center justify-center h-7 w-7 rounded-full border text-xs font-semibold cursor-pointer transition-colors",
                                "bg-(--surface-btn) border-(--border-default) text-(--text-secondary) hover:bg-(--surface-btn-hover)",
                                isActive && "bg-(--primary) border-(--primary) text-(--primary-foreground) hover:bg-(--primary)"
                            )}
                        >
                            {slot}
                        </button>
                    );
                })}
                <button
                    type="button"
                    onClick={saveCurrentToActive}
                    title={`Save current settings to Preset ${activeSlot}`}
                    aria-label="Save current settings to active preset"
                    className={cn(
                        "flex items-center justify-center h-7 w-7 rounded-full border cursor-pointer transition-colors",
                        "bg-(--surface-btn) border-(--border-default) text-(--text-muted) hover:bg-(--surface-btn-hover) hover:text-(--text-primary)"
                    )}
                >
                    <Save className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
};
