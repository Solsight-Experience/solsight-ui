import { INumberFormatter } from "./types";

export class DecimalFormatter implements INumberFormatter {
    format(value: number | null) {
        return value !== null && !isNaN(value) ? String(value) : "";
    }
    convertBack(value: string): number | null {
        if (!value) return null;
        const cleaned = value.replace(/,/g, ".");
        const num = Number(cleaned);
        return isNaN(num) ? null : num;
    }
}
