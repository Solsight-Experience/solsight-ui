"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type AmountMode = "amount" | "holding";

export const AdvancedStrategySection: React.FC = () => {
    const [enabled, setEnabled] = useState(false);
    const [amountMode, setAmountMode] = useState<AmountMode>("amount");

    return (
        <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
                <Checkbox checked={enabled} onCheckedChange={(v) => setEnabled(v === true)} className="border-[var(--border-default)]" />
                <span className="text-sm underline text-[var(--text-secondary)]">Advanced Trading Strategy</span>
            </label>

            {enabled && (
                <>
                    <div className="flex items-center gap-6 text-sm">
                        {(["amount", "holding"] as const).map((mode) => (
                            <button key={mode} type="button" onClick={() => setAmountMode(mode)} className="flex items-center gap-2 cursor-pointer">
                                <span
                                    className={cn(
                                        "size-4 rounded-full border-2 flex items-center justify-center",
                                        amountMode === mode ? "border-[var(--text-primary)]" : "border-[var(--border-default)]"
                                    )}
                                >
                                    {amountMode === mode && <span className="size-2 rounded-full bg-[var(--text-primary)]" />}
                                </span>
                                <span className="text-[var(--text-secondary)] capitalize">{mode}</span>
                            </button>
                        ))}
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--border-default)] bg-[var(--surface-btn)] px-3 py-3 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-panel)] transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Add</span>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56 border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--text-primary)]">
                            <div className="px-3 py-6 text-center text-xs text-[var(--text-muted)]">No strategies available yet.</div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </>
            )}
        </div>
    );
};
