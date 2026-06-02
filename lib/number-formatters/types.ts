export interface INumberFormatter {
    /** Formats a value for display (blurred state). Accepts null/undefined/NaN. */
    format(value: number | null): string;

    /** Parses any user-typed string back to a number. Tolerant of partial input. */
    convertBack(value: string): number | null;

    /**
     * Optional: formats a value for the focused state (while typing).
     * Should use grouping but no symbols/compact, with high precision so the
     * user can edit any digit without truncation.
     *
     * If omitted, NumericInput falls back to `format(value)`.
     */
    formatFocused?(value: number | null): string;

    /**
     * Optional: returns the grouping/decimal characters this formatter would
     * produce. Required by NumericInput's cursor-preservation algorithm.
     *
     * If omitted, NumericInput assumes "," (group) and "." (decimal).
     */
    getSeparators?(): { group: string; decimal: string };
}

export type CurrencyConfig = {
    locale: string;
    currency: string;
};

export const Locale = {
    US: { locale: "en-US", currency: "USD" },
    VN: { locale: "vi-VN", currency: "VND" },
    JP: { locale: "ja-JP", currency: "JPY" },
    EU: { locale: "de-DE", currency: "EUR" }
} as const;
