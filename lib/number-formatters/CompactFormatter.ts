import { INumberFormatter } from "./types";

/**
 * Compact number formatter for K, M, B notation
 */
export class CompactFormatter implements INumberFormatter {
    private formatter = new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1
    });

    format(value: number | null): string {
        if (value === null || !Number.isFinite(value)) {
            return "0";
        }

        if (Math.abs(value) < 1000) {
            return value.toLocaleString("en-US");
        }

        return this.formatter.format(value);
    }

    convertBack(value: string): number | null {
        if (!value) return null;
        const normalized = value.replace(/[^\d.,-]/g, "").replace(",", ".");
        const num = parseFloat(normalized);
        return isNaN(num) ? null : num;
    }
}
