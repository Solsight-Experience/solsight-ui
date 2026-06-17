import { INumberFormatter } from "./types";
import { getLocaleSeparators } from "./utils";

export interface CompactFormatterOptions {
    /** BCP-47 locale tag. Defaults to "en-US". */
    locale?: string;
    /** Maximum fraction digits when blurred. Defaults to 1. */
    maximumFractionDigits?: number;
}

/**
 * Compact number formatter for K, M, B notation.
 *
 * - Numbers with absolute value < 1000 are rendered with locale grouping (no compact).
 * - Numbers ≥ 1000 use `Intl.NumberFormat({ notation: "compact" })`.
 */
export class CompactFormatter implements INumberFormatter {
    private readonly locale: string;
    private readonly maximumFractionDigits: number;
    private readonly compactFormatter: Intl.NumberFormat;
    private readonly standardFormatter: Intl.NumberFormat;

    constructor(options: CompactFormatterOptions = {}) {
        this.locale = options.locale ?? "en-US";
        this.maximumFractionDigits = options.maximumFractionDigits ?? 1;
        this.compactFormatter = new Intl.NumberFormat(this.locale, {
            notation: "compact",
            maximumFractionDigits: this.maximumFractionDigits
        });
        this.standardFormatter = new Intl.NumberFormat(this.locale);
    }

    format(value: number | null): string {
        if (value == null || !Number.isFinite(value)) {
            return "0";
        }

        if (Math.abs(value) < 1000) {
            return this.standardFormatter.format(value);
        }

        return this.compactFormatter.format(value);
    }

    formatFocused(value: number | null): string {
        if (value == null || !Number.isFinite(value)) return "";
        // While focused: full grouping, no compact, max precision.
        return new Intl.NumberFormat(this.locale, {
            style: "decimal",
            maximumFractionDigits: 20
        }).format(value);
    }

    convertBack(value: string): number | null {
        if (!value) return null;
        const { group, decimal } = getLocaleSeparators(this.locale);
        // Strip everything except digits, the locale decimal char, and minus.
        const escapedDecimal = decimal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const escapedGroup = group.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        let cleaned = value.replace(new RegExp(escapedGroup, "g"), "");
        cleaned = cleaned.replace(new RegExp(`[^0-9\\-${escapedDecimal}]`, "g"), "");
        const standard = decimal === "." ? cleaned : cleaned.replace(decimal, ".");
        if (!standard || standard === "-" || standard === ".") return null;
        const num = parseFloat(standard);
        return Number.isFinite(num) ? num : null;
    }

    getSeparators(): { group: string; decimal: string } {
        return getLocaleSeparators(this.locale);
    }
}
