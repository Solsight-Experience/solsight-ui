import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

export const DEFAULT_QUICK_BUY_AMOUNT = "0.1";
export const DEFAULT_SLIPPAGE_BPS = 50;

interface SettingsState {
    defaultQuickBuyAmount: string;
    defaultSlippageBps: number;
    setDefaultQuickBuyAmount: (amount: string) => void;
    setDefaultSlippageBps: (bps: number) => void;
    resetTradingDefaults: () => void;
}

const noopStorage: StateStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
};

const storage = createJSONStorage<SettingsState>(() => (typeof window === "undefined" ? noopStorage : localStorage));

function clampSlippageBps(bps: number): number {
    if (!Number.isFinite(bps)) return DEFAULT_SLIPPAGE_BPS;
    return Math.min(10000, Math.max(1, Math.round(bps)));
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            defaultQuickBuyAmount: DEFAULT_QUICK_BUY_AMOUNT,
            defaultSlippageBps: DEFAULT_SLIPPAGE_BPS,
            setDefaultQuickBuyAmount: (amount: string) => set({ defaultQuickBuyAmount: amount }),
            setDefaultSlippageBps: (bps: number) => set({ defaultSlippageBps: clampSlippageBps(bps) }),
            resetTradingDefaults: () =>
                set({
                    defaultQuickBuyAmount: DEFAULT_QUICK_BUY_AMOUNT,
                    defaultSlippageBps: DEFAULT_SLIPPAGE_BPS
                })
        }),
        {
            name: "solsight.settings",
            storage
        }
    )
);

export default useSettingsStore;
