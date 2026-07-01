import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { NumbericInput } from "@/components/ui/NumbericInput";
import { INumberFormatter } from "@/lib/number-formatters";

export type FilterFieldProps = {
    label: string;
    unit?: string;
    icon?: ReactNode;
    minValue: number;
    maxValue: number;
    onMinChange: (value: number | string) => void;
    onMaxChange: (value: number | null) => void;
    inputFormatter: INumberFormatter;
};

/**
 * 0 = not entered yet (default) -> dim/gray text, like placeholder.
 * When user enters a real value (not 0) -> normal white text.
 */
function getValueTextClass(value: number) {
    return value === 0 ? "text-white/20" : "text-white/80";
}

export function FilterField({ label, unit, icon, minValue, maxValue, onMinChange, onMaxChange, inputFormatter }: FilterFieldProps) {
    const inputBaseClass = cn(
        "w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-2.5 py-1.5",
        "text-[12px] font-mono text-right placeholder:text-white/20",
        "focus:outline-none focus:border-violet-500/50 focus:bg-violet-500/5",
        "transition-all duration-150",
        "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
    );

    /**
     * When user leaves the Min or Max field (blur), if both values are set
     * (not 0) and min > max -> swap the 2 values on the UI.
     * If either field is still 0 (not entered) -> skip, don't compare.
     */
    const handleBlurCheckSwap = () => {
        if (minValue > 0 && maxValue > 0 && minValue > maxValue) {
            onMinChange(maxValue);
            onMaxChange(minValue);
        }
    };

    return (
        <div className="grid grid-cols-[1fr_auto] items-center gap-3 px-1 py-2.5 rounded-xl hover:bg-white/[0.02] transition-colors">
            {/* Label */}
            <div className="flex items-center gap-2 min-w-0">
                {icon && <span className="text-violet-400/60 shrink-0">{icon}</span>}
                <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-white/75 leading-none">{label}</p>
                    {unit && <p className="text-[10px] text-white/30 mt-0.5">{unit}</p>}
                </div>
            </div>

            {/* Inputs */}
            <div className="flex items-center gap-1.5">
                <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold tracking-wider text-white/25 uppercase text-center">Min</span>
                    <NumbericInput
                        value={minValue}
                        onChange={(val) => {
                            if (val !== null && !isNaN(val)) onMinChange(val);
                        }}
                        onBlur={handleBlurCheckSwap}
                        formatter={inputFormatter}
                        className={cn(inputBaseClass, getValueTextClass(minValue))}
                        style={{ width: "90px" }}
                    />
                </div>
                <span className="text-white/20 text-[12px] mt-3.5">–</span>
                <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold tracking-wider text-white/25 uppercase text-center">Max</span>
                    <NumbericInput
                        value={maxValue}
                        onChange={(val) => {
                            if (val !== null && !isNaN(val)) onMaxChange(val);
                        }}
                        onBlur={handleBlurCheckSwap}
                        formatter={inputFormatter}
                        className={cn(inputBaseClass, getValueTextClass(maxValue))}
                        style={{ width: "90px" }}
                    />
                </div>
            </div>
        </div>
    );
}
