"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { NumbericInput } from "@/components/ui/NumbericInput";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronDown } from "lucide-react";
import { DecimalFormatter } from "@/lib/number-formatters";
import { ExpandedFormProps, SwapConfigItem } from "./swap-config-item";
import type { ConfigCtx } from "./types";

const SWAP_CONFIG_NUMBER_FORMATTER = new DecimalFormatter({ locale: "en-US", maximumFractionDigits: 9 });

// Two-element preset+custom (slippage, priority fee, tip fee)
export abstract class PresetCustomItem<T extends number> extends SwapConfigItem<{ mode: "auto" | "custom"; custom: T | null }> {
    abstract autoValue(ctx: ConfigCtx): T | null;
    abstract format(value: T): string;
    abstract placeholderCustom(ctx: ConfigCtx): T | null;
    abstract parseCustom(input: string): T | null;
    abstract toInputString(value: T): string;

    getDefaultState() {
        return { mode: "auto" as const, custom: null };
    }

    renderExpandedForm({ state, ctx, onChange }: ExpandedFormProps<{ mode: "auto" | "custom"; custom: T | null }>): React.ReactNode {
        const auto = this.autoValue(ctx);
        const validation = this.validate(state, ctx);
        const lock = this.isLocked(ctx);

        const handleAutoClick = () => {
            if (lock.forcedMode === "custom") return;
            onChange({ ...state, mode: "auto" });
        };

        const handleCustomChange = (value: string) => {
            const parsed = this.parseCustom(value);
            onChange({ mode: "custom", custom: parsed });
        };

        const customInput = state.custom === null ? "" : this.toInputString(state.custom);

        return (
            <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleAutoClick}
                        disabled={lock.forcedMode === "custom"}
                        className={cn(
                            "bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 ring-1 ring-transparent overflow-hidden whitespace-nowrap",
                            state.mode === "auto" && "ring-purple-400 dark:ring-white/80",
                            lock.forcedMode === "custom" && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        Auto {auto !== null ? `(${this.format(auto)})` : ""}
                    </Button>
                    <div className={cn("relative grow ring-1 ring-transparent rounded-md", state.mode === "custom" && "ring-purple-400 dark:ring-white/80")}>
                        <NumbericInput
                            mode="string"
                            decimals={9}
                            formatter={SWAP_CONFIG_NUMBER_FORMATTER}
                            value={customInput}
                            placeholder={this.placeholderCustom(ctx) ? this.toInputString(this.placeholderCustom(ctx)!) : "Custom"}
                            onChange={handleCustomChange}
                            onFocus={() => {
                                if (lock.forcedMode === "auto") return;
                                onChange({ ...state, mode: "custom" });
                            }}
                            disabled={lock.forcedMode === "auto"}
                            className="bg-gray-100 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700"
                        />
                    </div>
                </div>
                {validation && (
                    <div className={cn("text-xs", validation.level === "warn" && "text-amber-400", validation.level === "error" && "text-rose-400")}>
                        {validation.message}
                    </div>
                )}
                {lock.locked && lock.reason && <div className="text-xs text-gray-500 dark:text-zinc-400">{lock.reason}</div>}
            </div>
        );
    }
}

// Single numeric input with suffix (max auto fee)
export abstract class NumericFieldItem extends SwapConfigItem<{ value: number | null }> {
    abstract suffix: string;
    abstract placeholder(ctx: ConfigCtx): number | null;
    getDefaultState() {
        return { value: null };
    }

    renderExpandedForm({ state, ctx, onChange }: ExpandedFormProps<{ value: number | null }>): React.ReactNode {
        const validation = this.validate(state, ctx);
        return (
            <div className="space-y-2">
                <div className="relative">
                    <NumbericInput
                        formatter={SWAP_CONFIG_NUMBER_FORMATTER}
                        value={state.value}
                        placeholder={this.placeholder(ctx)?.toString() ?? "0"}
                        onChange={(value) => onChange({ value })}
                        className="bg-gray-100 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 pr-12"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 dark:text-zinc-400">{this.suffix}</div>
                </div>
                {validation && (
                    <div className={cn("text-xs", validation.level === "warn" && "text-amber-400", validation.level === "error" && "text-rose-400")}>
                        {validation.message}
                    </div>
                )}
            </div>
        );
    }
}

// Segmented button group (anti-MEV)
export abstract class SegmentedItem<TOption extends string> extends SwapConfigItem<{ value: TOption }> {
    abstract options: ReadonlyArray<{ id: TOption; icon: React.FC<{ className?: string }>; label: string; tooltip?: string }>;

    renderExpandedForm({ state, onChange }: ExpandedFormProps<{ value: TOption }>): React.ReactNode {
        return (
            <div className="ml-auto flex w-fit max-w-full min-w-0 items-center gap-1 rounded-md bg-gray-100 dark:bg-zinc-800 p-0.5">
                {this.options.map((option) => {
                    const button = (
                        <Button
                            key={option.id}
                            variant="ghost"
                            size="sm"
                            onClick={() => onChange({ value: option.id })}
                            className={cn(
                                "h-6 min-w-0 shrink px-2 text-xs font-normal gap-1 rounded text-gray-600 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white",
                                state.value === option.id &&
                                    "bg-gray-300 dark:bg-zinc-700 text-gray-900 dark:text-white ring-1 ring-purple-400 dark:ring-white/80"
                            )}
                        >
                            <option.icon className="h-3 w-3" />
                            <span className="whitespace-nowrap">{option.label}</span>
                        </Button>
                    );

                    if (!option.tooltip) {
                        return button;
                    }

                    return (
                        <Tooltip key={option.id}>
                            <TooltipTrigger asChild>{button}</TooltipTrigger>
                            <TooltipContent className="max-w-56">{option.tooltip}</TooltipContent>
                        </Tooltip>
                    );
                })}
            </div>
        );
    }
}

// Single-select dropdown (gasless)
export abstract class DropdownItem<TOption extends string> extends SwapConfigItem<{ value: TOption }> {
    abstract getOptions(ctx: ConfigCtx): ReadonlyArray<{ id: TOption; label: string; node?: React.ReactNode }>;

    renderExpandedForm({ state, ctx, onChange }: ExpandedFormProps<{ value: TOption }>): React.ReactNode {
        const options = this.getOptions(ctx);
        const selectedOption = options.find((opt) => opt.id === state.value);

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full justify-between bg-gray-100 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-700"
                    >
                        <div className="flex items-center gap-2">
                            {selectedOption?.node}
                            <span>{selectedOption?.label ?? "Select..."}</span>
                        </div>
                        <ChevronDown className="h-4 w-4 text-gray-500 dark:text-zinc-400" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700">
                    {options.map((option) => (
                        <DropdownMenuItem key={option.id} onSelect={() => onChange({ value: option.id })} className="hover:bg-gray-100 dark:hover:bg-zinc-700">
                            <div className="flex items-center gap-2">
                                {option.node}
                                <span>{option.label}</span>
                            </div>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }
}
