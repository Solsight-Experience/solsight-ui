// Lamports <-> SOL formatter that strips trailing zeros.

import { DecimalFormatter } from "@/lib/number-formatters/DecimalFormatter";

const decimalFormatter = new DecimalFormatter();

// 100_000 -> "0.0001"; 2_032_000 -> "0.002032"; 100_000_000 -> "0.1"
export function lamportsToSolString(lamports: number): string {
    if (!Number.isFinite(lamports) || lamports === 0) return "0";
    const sol = lamports / 1e9;
    // Use toFixed(9) then strip trailing zeros + dangling decimal
    return decimalFormatter.format(sol, 9).replace(/\.?0+$/, "");
}
export function solStringToLamports(input: string): number | null {
    const trimmed = input.trim();
    if (trimmed === "") return null;
    const parsed = decimalFormatter.convertBack(trimmed);
    if (parsed === null || !Number.isFinite(parsed) || parsed < 0) return null;
    return Math.floor(parsed * 1e9);
}
