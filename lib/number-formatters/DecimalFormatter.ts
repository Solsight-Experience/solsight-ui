import { INumberFormatter } from "./types";
import { getLocaleSeparators } from "./utils";

export interface DecimalFormatterOptions {
    /** BCP-47 locale tag. Defaults to "en-US". */
    locale?: string;
    /** Render with K / M / B compact notation when blurred. Defaults to false. */
    compact?: boolean;
    /** Minimum fraction digits when blurred (Intl.NumberFormat). */
    minimumFractionDigits?: number;
    /** Maximum fraction digits when blurred (Intl.NumberFormat). Defaults to 6. */
    maximumFractionDigits?: number;
}

export class DecimalFormatter implements INumberFormatter {
    private readonly locale: string;
    private readonly compact: boolean;
    private readonly minimumFractionDigits: number | undefined;
    private readonly maximumFractionDigits: number;

    constructor(options: DecimalFormatterOptions = {}) {
        this.locale = options.locale ?? "en-US";
        this.compact = options.compact ?? false;
        this.minimumFractionDigits = options.minimumFractionDigits;
        this.maximumFractionDigits = options.maximumFractionDigits ?? 6;
    }

    format(value: number | null, maximumFractionDigits: number = this.maximumFractionDigits): string {
        if (value === null || value === undefined || !Number.isFinite(value)) return "";
        return new Intl.NumberFormat(this.locale, {
            style: "decimal",
            notation: this.compact ? "compact" : "standard",
            minimumFractionDigits: this.minimumFractionDigits,
            maximumFractionDigits
        }).format(value);
    }

    formatFocused(value: number | null): string {
        if (value === null || value === undefined || !Number.isFinite(value)) return "";
        return new Intl.NumberFormat(this.locale, {
            style: "decimal",
            maximumFractionDigits: 20
        }).format(value);
    }

    convertBack(value: string): number | null {
        if (!value) return null;
        const { group, decimal } = getLocaleSeparators(this.locale);
        const escapedGroup = group.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const escapedDecimal = decimal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
