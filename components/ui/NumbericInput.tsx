"use client";

import { ChangeEvent, ComponentProps, FocusEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "./input";
import { cn } from "@/lib/utils";
import type { INumberFormatter } from "@/lib/number-formatters";

type BaseProps = Omit<ComponentProps<"input">, "type" | "value" | "onChange">;

type NumericValueMode =
    | {
          /** Number-backed (default). Value passes through `formatter.convertBack`. */
          mode?: "number";
          value: number | null | undefined;
          onChange: (value: number | null) => void;
      }
    | {
          /**
           * String-backed. Emits a canonical en-US digit string ("1234.56") so
           * existing helpers (`toBaseUnits`, `parseInputNumber`) keep working
           * unchanged, while the *display* still uses the formatter's locale.
           * Use for token amounts where Number() round-trip would lose precision.
           */
          mode: "string";
          value: string;
          onChange: (value: string) => void;
      };

export type NumbericInputProps = BaseProps &
    NumericValueMode & {
        /** Required pluggable formatter. See `lib/number-formatters/`. */
        formatter: INumberFormatter;
        /** Show the up/down stepper buttons. Defaults to false. */
        showStepper?: boolean;
        /** Step size for stepper buttons. Defaults to 1. */
        step?: number;
        /** Min value (inclusive). Clamped on blur. */
        min?: number;
        /** Max value (inclusive). Clamped on blur. */
        max?: number;
        /** Class applied to the wrapper around the underlying input. */
        containerClassName?: string;
        /**
         * mode="string" only: max number of fractional digits accepted while typing.
         * Excess digits are clipped.
         */
        decimals?: number;
    };

/**
 * Numeric input primitive.
 *
 * - `mode="number"` (default): two-way bound to a `number | null`.
 * - `mode="string"`: bound to a digit string in en-US canonical form, while the
 *   visible display uses the formatter's locale. Use for high-precision token
 *   amounts that must not round-trip through `Number()`.
 *
 * Cursor position is preserved across grouping characters using
 * `formatter.getSeparators?.()`. Falls back to `","`/`"."` if the formatter
 * does not implement it.
 */
export const NumbericInput = (props: NumbericInputProps) => {
    const { formatter, showStepper = false, step = 1, min, max, decimals, className, containerClassName, onFocus, disabled, ...rest } = props;

    const mode: "number" | "string" = props.mode ?? "number";
    const numericValue =
        mode === "number" ? toNumberOrNull((props as { value: number | null | undefined }).value) : parseStringValue((props as { value: string }).value);

    const [display, setDisplay] = useState<string>("");
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const cursorState = useRef<{ offset: number } | null>(null);

    const separators = formatter.getSeparators?.() ?? { group: ",", decimal: "." };
    const { group: groupChar, decimal: decimalChar } = separators;

    // Sync display from prop when not focused, or when the prop diverges from
    // what the user is typing (external update while focused).
    useEffect(() => {
        if (!isFocused) {
            setDisplay(formatter.format(numericValue));
            return;
        }
        setDisplay((currentDisplay) => {
            const currentParsed = parseDisplay(currentDisplay, decimalChar, groupChar);
            if (currentParsed !== numericValue && numericValue !== null) {
                return formatFocusedSafe(formatter, numericValue);
            }
            return currentDisplay;
        });
    }, [numericValue, isFocused, formatter, decimalChar, groupChar]);

    // Cursor preservation after a re-render caused by handleInputChange.
    useEffect(() => {
        if (!isFocused || !inputRef.current || cursorState.current === null) return;
        const { offset } = cursorState.current;
        const currentVal = inputRef.current.value;

        let newPos = 0;
        let charCount = 0;
        for (let i = 0; i < currentVal.length; i++) {
            if (currentVal[i] !== groupChar) charCount++;
            if (charCount === offset) {
                newPos = i + 1;
                break;
            }
        }
        if (offset === 0) {
            newPos = currentVal.startsWith("-") ? 1 : 0;
        }
        inputRef.current.setSelectionRange(newPos, newPos);
        cursorState.current = null;
    }, [display, isFocused, groupChar]);

    const emitNumber = (next: number | null) => {
        if (mode === "number") {
            (props as Extract<NumericValueMode, { mode?: "number" }>).onChange(next);
        } else {
            (props as Extract<NumericValueMode, { mode: "string" }>).onChange(next === null ? "" : numberToCanonicalString(next));
        }
    };

    const emitString = (nextDisplay: string) => {
        (props as Extract<NumericValueMode, { mode: "string" }>).onChange(displayToCanonicalString(nextDisplay, decimalChar, groupChar, decimals));
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const target = e.target;
        const inputValue = target.value;
        const selectionStart = target.selectionStart ?? 0;

        // Track cursor offset (counting only non-grouping characters).
        let nonGroupCharsBefore = 0;
        for (let i = 0; i < selectionStart; i++) {
            if (inputValue[i] !== groupChar) nonGroupCharsBefore++;
        }
        cursorState.current = { offset: nonGroupCharsBefore };

        // Allow transient empty / minus-only / decimal-only states.
        if (inputValue === "" || inputValue === "-" || inputValue === decimalChar) {
            setDisplay(inputValue);
            emitNumber(null);
            return;
        }

        const parts = inputValue.split(decimalChar);
        const intPart = parts[0].replace(/[^0-9-]/g, "");
        let formattedValue = "";

        if (intPart === "" || intPart === "-") {
            formattedValue = intPart;
        } else {
            const parsedInt = parseFloat(intPart);
            formattedValue = Number.isFinite(parsedInt) ? new Intl.NumberFormat(localeFromSeparators(separators)).format(parsedInt) : "";
        }

        if (parts.length > 1) {
            let decPart = parts
                .slice(1)
                .join("")
                .replace(/[^0-9]/g, "");
            if (mode === "string" && typeof decimals === "number" && decimals >= 0) {
                decPart = decPart.slice(0, decimals);
            }
            formattedValue += decimalChar + decPart;
        }

        setDisplay(formattedValue);

        if (mode === "string") {
            emitString(formattedValue);
            return;
        }

        const parsed = formatter.convertBack(formattedValue);
        emitNumber(parsed);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        const target = e.currentTarget;
        const start = target.selectionStart;
        if (start === null) return;

        const charToLeft = target.value[start - 1];
        const charToRight = target.value[start];

        if (e.key === "ArrowLeft" && (charToLeft === groupChar || charToLeft === decimalChar)) {
            e.preventDefault();
            target.setSelectionRange(start - 2, start - 2);
        }
        if (e.key === "ArrowRight" && (charToRight === groupChar || charToRight === decimalChar)) {
            e.preventDefault();
            target.setSelectionRange(start + 2, start + 2);
        }
    };

    const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        // Switch to focused-mode display so users can edit raw digits.
        setDisplay(formatFocusedSafe(formatter, numericValue));
        onFocus?.(e);
    };

    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);

        if (numericValue !== null && mode === "number") {
            let clamped = numericValue;
            if (typeof min === "number" && clamped < min) clamped = min;
            if (typeof max === "number" && clamped > max) clamped = max;
            if (clamped !== numericValue) {
                emitNumber(clamped);
            }
        }
        // Display will re-sync from prop in the effect above.
        // Surface blur to caller via `rest.onBlur` if they passed one.
        (rest as { onBlur?: (e: FocusEvent<HTMLInputElement>) => void }).onBlur?.(e);
    };

    const stepValue = (direction: 1 | -1) => {
        if (disabled) return;
        const current = numericValue ?? 0;
        let next = current + step * direction;
        if (typeof min === "number" && next < min) next = min;
        if (typeof max === "number" && next > max) next = max;
        emitNumber(next);
    };

    const stepperUpDisabled = disabled || (typeof max === "number" && numericValue !== null && numericValue >= max);
    const stepperDownDisabled = disabled || (typeof min === "number" && numericValue !== null && numericValue <= min);

    return (
        <div className={cn("relative flex items-center", containerClassName)} data-slot="numberic-input">
            <Input
                {...rest}
                type="text"
                inputMode="decimal"
                ref={inputRef}
                value={display}
                disabled={disabled}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className={cn("w-full", showStepper && "pr-8", className)}
            />

            {showStepper && (
                <div className="absolute right-1 flex h-[calc(100%-8px)] w-6 flex-col items-center overflow-hidden rounded-md">
                    <button
                        type="button"
                        tabIndex={-1}
                        disabled={stepperUpDisabled}
                        onClick={() => stepValue(1)}
                        className="flex h-1/2 w-full items-center justify-center text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-btn)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ChevronUp className="h-3 w-3" />
                    </button>
                    <button
                        type="button"
                        tabIndex={-1}
                        disabled={stepperDownDisabled}
                        onClick={() => stepValue(-1)}
                        className="flex h-1/2 w-full items-center justify-center text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-btn)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ChevronDown className="h-3 w-3" />
                    </button>
                </div>
            )}
        </div>
    );
};

/** Alias with the corrected spelling. New code should prefer this name. */
export const NumericInput = NumbericInput;
export type NumericInputProps = NumbericInputProps;

// ---------- helpers ----------

function toNumberOrNull(v: number | null | undefined): number | null {
    if (v === null || v === undefined) return null;
    return Number.isFinite(v) ? v : null;
}

function parseStringValue(v: string): number | null {
    if (!v) return null;
    const num = Number(v);
    return Number.isFinite(num) ? num : null;
}

function numberToCanonicalString(n: number): string {
    // Avoid scientific notation; emit plain digits with up to 20 fraction digits.
    if (!Number.isFinite(n)) return "";
    const s = n.toString();
    if (!s.includes("e") && !s.includes("E")) return s;
    // Fall back to fixed-precision for very small / large numbers.
    return n.toFixed(20).replace(/\.?0+$/, "");
}

function parseDisplay(display: string, decimalChar: string, groupChar: string): number | null {
    if (!display) return null;
    let s = display.split(groupChar).join("");
    if (decimalChar !== ".") s = s.replace(decimalChar, ".");
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : null;
}

function displayToCanonicalString(display: string, decimalChar: string, groupChar: string, decimals?: number): string {
    let s = display.split(groupChar).join("");
    if (decimalChar !== ".") s = s.replace(decimalChar, ".");
    s = s.replace(/[^0-9.-]/g, "");

    if (!s || s === "-" || s === "." || s === "-.") return "";

    const isNegative = s.startsWith("-");
    const unsigned = s.replace(/-/g, "");
    const [rawInt, ...rawFractionParts] = unsigned.split(".");
    const intPart = rawInt || "0";
    let fractionPart = rawFractionParts.join("").replace(/\D/g, "");

    if (typeof decimals === "number" && decimals >= 0) {
        fractionPart = fractionPart.slice(0, decimals);
    }

    const sign = isNegative ? "-" : "";
    if (rawFractionParts.length === 0) return `${sign}${intPart}`;
    return `${sign}${intPart}.${fractionPart}`;
}

function formatFocusedSafe(formatter: INumberFormatter, value: number | null): string {
    if (formatter.formatFocused) return formatter.formatFocused(value);
    return formatter.format(value);
}

/**
 * Best-effort guess of a locale that produces the given separator pair, so
 * `handleInputChange` can re-format the integer part with `Intl.NumberFormat`.
 * The component never asks the caller for a locale directly.
 */
function localeFromSeparators(sep: { group: string; decimal: string }): string {
    if (sep.group === "." && sep.decimal === ",") return "de-DE";
    if (sep.group === "\u00a0" && sep.decimal === ",") return "fr-FR";
    if (sep.group === " " && sep.decimal === ",") return "fr-FR";
    if (sep.group === "," && sep.decimal === ".") return "en-US";
    return "en-US";
}
