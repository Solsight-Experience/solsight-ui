import { CurrencyConfig, INumberFormatter, Locale } from "./types";
import { getLocaleSeparators } from "./utils";

// Subscript digits for small price formatting (Axiom style)
const SUBSCRIPT_DIGITS: Record<string, string> = {
    "0": "₀",
    "1": "₁",
    "2": "₂",
    "3": "₃",
    "4": "₄",
    "5": "₅",
    "6": "₆",
    "7": "₇",
    "8": "₈",
    "9": "₉"
};

export interface CurrencyFormatterOptions extends CurrencyConfig {
    /**
     * Force compact (K/M/B) notation for large numbers when blurred.
     * Defaults to true (≥1000 only) to preserve the previous implicit behaviour.
     */
    compact?: boolean;
    /**
     * Significant digits for the subscript-notation small-price branch (<0.01).
     * Defaults to 3.
     */
    significantDigits?: number;
}

export class CurrencyFormatter implements INumberFormatter {
    private readonly config: CurrencyConfig;
    private readonly compact: boolean;
    private readonly significantDigits: number;

    constructor(options: CurrencyConfig | CurrencyFormatterOptions = Locale.US) {
        const opts = options as CurrencyFormatterOptions;
        this.config = { locale: opts.locale, currency: opts.currency };
        this.compact = opts.compact ?? true;
        this.significantDigits = opts.significantDigits ?? 3;
    }

    /**
     * Smart currency formatter that handles all ranges:
     * - Large numbers (≥1000) when `compact`: Compact notation (K, M, B)
     * - Regular numbers (0.01 - 999): Standard currency format
     * - Small numbers (<0.01 with 4+ leading zeros): Subscript notation ($0.0₅412)
     */
    format(value: number | null, significantDigits: number = this.significantDigits): string {
        if (value == null || Number.isNaN(value)) return "$0";
        if (value === 0) return "$0";

        const absValue = Math.abs(value);

        // Large numbers: compact notation when enabled
        if (this.compact && absValue >= 1000) {
            return new Intl.NumberFormat(this.config.locale, {
                style: "currency",
                currency: this.config.currency,
                notation: "compact",
                maximumFractionDigits: 2
            }).format(value);
        }

        // Small numbers: subscript notation for leading zeros
        if (absValue < 0.01) {
            return this.formatSmallPrice(value, significantDigits);
        }

        // Regular numbers: standard currency format
        return new Intl.NumberFormat(this.config.locale, {
            style: "currency",
            currency: this.config.currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    }

    /**
     * While focused: render plain locale-grouped number, no currency symbol,
     * no compact, max precision so users can edit any digit.
     */
    formatFocused(value: number | null): string {
        if (value == null || Number.isNaN(value)) return "";
        return new Intl.NumberFormat(this.config.locale, {
            style: "decimal",
            maximumFractionDigits: 20
        }).format(value);
    }

    convertBack(formattedValue: string): number | null {
        if (!formattedValue || formattedValue.trim() === "") return null;

        const formatter = new Intl.NumberFormat(this.config.locale, {
            style: "currency",
            currency: this.config.currency
        });

        const parts = formatter.formatToParts(1234.56);
        const decimalSeparator = parts.find((p) => p.type === "decimal")?.value || ".";
        const groupSeparator = parts.find((p) => p.type === "group")?.value || ",";
        const currencySymbol = parts.find((p) => p.type === "currency")?.value || "";

        // Remove currency symbol, currency code, and whitespace
        let cleaned = formattedValue.replace(currencySymbol, "").replace(this.config.currency, "").trim();

        // Remove group separators
        const groupSeparatorRegex = new RegExp(`\\${groupSeparator}`, "g");
        cleaned = cleaned.replace(groupSeparatorRegex, "");

        // Replace decimal separator with standard dot
        if (decimalSeparator !== ".") {
            cleaned = cleaned.replace(decimalSeparator, ".");
        }

        // Strip remaining non-numeric characters except minus and dot
        cleaned = cleaned.replace(/[^\d.-]/g, "");

        if (!cleaned || cleaned === "-" || cleaned === ".") return null;

        const parsed = parseFloat(cleaned);
        return Number.isFinite(parsed) ? parsed : null;
    }

    getSeparators(): { group: string; decimal: string } {
        return getLocaleSeparators(this.config.locale);
    }

    /**
     * @deprecated Use format() instead - it now handles all cases automatically
     */
    formatCompact(value: number | null, significantDigits: number = this.significantDigits): string {
        return this.format(value, significantDigits);
    }

    /**
     * Format small prices with subscript notation (Axiom style)
     * e.g., 0.00000412 -> $0.0₅412
     */
    private formatSmallPrice(value: number, significantDigits: number = this.significantDigits): string {
        if (value === 0) return "$0";

        const absValue = Math.abs(value);
        const sign = value < 0 ? "-" : "";

        const str = absValue.toFixed(20);
        const decimalIndex = str.indexOf(".");

        if (decimalIndex === -1) {
            return this.format(value);
        }

        const decimals = str.slice(decimalIndex + 1);

        let leadingZeros = 0;
        for (const char of decimals) {
            if (char === "0") {
                leadingZeros++;
            } else {
                break;
            }
        }

        if (leadingZeros >= 4) {
            const significantPart = decimals.slice(leadingZeros, leadingZeros + significantDigits);
            const subscript = String(leadingZeros)
                .split("")
                .map((d) => SUBSCRIPT_DIGITS[d])
                .join("");
            return `${sign}$0.0${subscript}${significantPart}`;
        }

        const precision = leadingZeros + significantDigits;
        return new Intl.NumberFormat(this.config.locale, {
            style: "currency",
            currency: this.config.currency,
            minimumFractionDigits: precision,
            maximumFractionDigits: precision
        }).format(value);
    }
}
