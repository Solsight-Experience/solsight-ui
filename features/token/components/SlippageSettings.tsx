import React from "react";
import { Label } from "@/components/ui/label";

interface SlippageSettingsProps {
    slippageBps: number;
    onSlippageChange: (bps: number) => void;
}

export const SlippageSettings: React.FC<SlippageSettingsProps> = ({ slippageBps, onSlippageChange }) => {
    return (
        <div className="mb-4">
            <Label className="text-sm text-gray-400 mb-2 font-semibold">Slippage</Label>
            <div className="border border-gray-700 rounded-lg p-3 bg-gray-800/70 backdrop-blur flex items-center gap-2 hover:bg-gray-800/80 transition-colors">
                <input
                    type="number"
                    min="1"
                    step="1"
                    value={slippageBps}
                    onChange={(e) => onSlippageChange(Number(e.target.value))}
                    className="w-full bg-transparent text-base font-bold outline-none text-white placeholder-gray-600"
                />
                <span className="text-sm text-gray-400 font-semibold">bps</span>
            </div>
            <div className="mt-2 text-xs text-gray-500">Example: 50 bps = 0.5%</div>
        </div>
    );
};
