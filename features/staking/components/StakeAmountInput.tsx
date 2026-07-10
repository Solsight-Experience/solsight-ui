"use client";

import React from "react";
import { NumbericInput } from "@/components/ui/NumbericInput";
import { DecimalFormatter } from "@/lib/number-formatters";

const AMOUNT_FORMATTER = new DecimalFormatter({ locale: "en-US", maximumFractionDigits: 9 });

const ACCENT_CLASSES = {
    purple: { max: "text-purple-400 hover:text-purple-300", focus: "focus-within:border-purple-500/50" },
    orange: { max: "text-orange-400 hover:text-orange-300", focus: "focus-within:border-orange-500/50" }
} as const;

interface StakeAmountInputProps {
    label: string;
    amount: string;
    onAmountChange: (value: string) => void;
    onMax: () => void;
    disabled: boolean;
    accent: keyof typeof ACCENT_CLASSES;
    helperText: React.ReactNode;
}

export function StakeAmountInput({ label, amount, onAmountChange, onMax, disabled, accent, helperText }: StakeAmountInputProps) {
    const accentClasses = ACCENT_CLASSES[accent];

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <label className="text-[13px] font-semibold text-slate-600 dark:text-gray-400">{label}</label>
                <button
                    className={`cursor-pointer text-[12px] font-bold transition-colors disabled:cursor-not-allowed ${accentClasses.max}`}
                    onClick={onMax}
                    disabled={disabled}
                >
                    MAX
                </button>
            </div>
            <div
                className={`flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 transition-colors dark:border-white/10 dark:bg-white/5 ${accentClasses.focus}`}
            >
                <NumbericInput
                    mode="string"
                    decimals={9}
                    formatter={AMOUNT_FORMATTER}
                    min={0}
                    value={amount}
                    onChange={onAmountChange}
                    placeholder="0.00"
                    containerClassName="flex-1"
                    className="flex-1 bg-transparent text-2xl font-bold text-slate-900 outline-none placeholder:text-slate-300 dark:text-white dark:placeholder:text-white/20"
                    disabled={disabled}
                />
                <span className="ml-2 text-[15px] font-semibold text-slate-500 dark:text-gray-400">SOL</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500 dark:text-gray-600">{helperText}</p>
        </div>
    );
}
