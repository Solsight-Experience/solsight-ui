"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createIndexedDBStorage } from "@/lib/indexeddb-storage";
import type { ItemStates } from "./core/apply-item-change";
import { buildInitialStates } from "./store";

export type PresetSlot = 1 | 2 | 3;

export const PRESET_SLOTS: readonly PresetSlot[] = [1, 2, 3];

// Distinct default slippage per slot (bps) so the 3 presets aren't identical
// out of the box; Priority Fee / Tip Fee stay on Auto since they're network-dependent.
const DEFAULT_SLIPPAGE_BPS_BY_SLOT: Record<PresetSlot, number> = {
    1: 100, // 1%
    2: 500, // 5%
    3: 1500 // 15%
};

const buildDefaultPresetItems = (slot: PresetSlot): ItemStates => {
    const items = buildInitialStates();
    items.slippage = { mode: "custom", custom: DEFAULT_SLIPPAGE_BPS_BY_SLOT[slot] };
    return items;
};

const buildDefaultPresets = (): Record<PresetSlot, ItemStates> => ({
    1: buildDefaultPresetItems(1),
    2: buildDefaultPresetItems(2),
    3: buildDefaultPresetItems(3)
});

interface SwapPresetsState {
    presets: Record<PresetSlot, ItemStates>;
    activeSlot: PresetSlot;
    selectPreset: (slot: PresetSlot) => void;
    setPresets: (presets: Record<PresetSlot, ItemStates>) => void;
}

export const useSwapPresetsStore = create<SwapPresetsState>()(
    persist(
        (set) => ({
            presets: buildDefaultPresets(),
            activeSlot: 1,

            selectPreset: (slot) => set({ activeSlot: slot }),

            setPresets: (presets) => set({ presets })
        }),
        {
            name: "solsight.swap-config-presets",
            storage: createJSONStorage(() => createIndexedDBStorage()),
            // activeSlot reflects the current session's live values (which don't
            // persist themselves — see useSwapConfigStore), so persisting it would
            // show a "selected" preset that no longer matches the reset-to-default
            // live config after reload. Only the saved preset values persist.
            partialize: (s) => ({ presets: s.presets })
        }
    )
);
