import { INumberFormatter } from "./types";

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

const DIGITS_BY_SUBSCRIPT = Object.fromEntries(Object.entries(SUBSCRIPT_DIGITS).map(([digit, subscript]) => [subscript, digit]));

export class DecimalFormatter implements INumberFormatter {
    format(value: number | null, significantDigits: number = 3): string {
        if (value === null || !Number.isFinite(value)) {
            return "";
        }

        if (value === 0) {
            return "0";
        }

        if (Math.abs(value) < 0.01) {
            return this.formatSmallDecimal(value, significantDigits);
        }

        return String(value);
    }

    convertBack(value: string): number | null {
        if (!value) return null;
        const smallDecimal = this.convertBackSmallDecimal(value);
        if (smallDecimal !== null) return smallDecimal;

        const cleaned = value.replace(/,/g, ".");
        const num = Number(cleaned);
        return isNaN(num) ? null : num;
    }

    private formatSmallDecimal(value: number, significantDigits: number = 3): string {
        const absValue = Math.abs(value);
        const sign = value < 0 ? "-" : "";
        const decimalString = absValue.toFixed(20);
        const decimalIndex = decimalString.indexOf(".");

        if (decimalIndex === -1) {
            return String(value);
        }

        const decimals = decimalString.slice(decimalIndex + 1);
        let leadingZeros = 0;

        for (const char of decimals) {
            if (char !== "0") {
                break;
            }
            leadingZeros++;
        }

        if (leadingZeros >= 4) {
            const significantPart = decimals.slice(leadingZeros, leadingZeros + significantDigits);
            const subscript = String(leadingZeros)
                .split("")
                .map((digit) => SUBSCRIPT_DIGITS[digit])
                .join("");

            return `${sign}0.0${subscript}${significantPart}`;
        }

        const precision = leadingZeros + significantDigits;
        return new Intl.NumberFormat("en-US", {
            maximumFractionDigits: precision
        }).format(value);
    }

    private convertBackSmallDecimal(value: string): number | null {
        const match = value.trim().match(/^(-)?0\.0([₀₁₂₃₄₅₆₇₈₉]+)(\d+)$/);
        if (!match) {
            return null;
        }

        const [, sign = "", leadingZerosSubscript, significantPart] = match;
        const leadingZeros = leadingZerosSubscript
            .split("")
            .map((digit) => DIGITS_BY_SUBSCRIPT[digit])
            .join("");

        const parsed = Number(`${sign}0.${"0".repeat(Number(leadingZeros))}${significantPart}`);
        return Number.isFinite(parsed) ? parsed : null;
    }
}
