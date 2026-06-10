// Lamports <-> SOL formatter that strips trailing zeros.
// 100_000 -> "0.0001"; 2_032_000 -> "0.002032"; 100_000_000 -> "0.1"
export function lamportsToSolString(lamports: number): string {
    if (!Number.isFinite(lamports) || lamports === 0) return "0";
    const sol = lamports / 1e9;
    // Use toFixed(9) then strip trailing zeros + dangling decimal
    return parseFloat(sol.toFixed(9)).toString();
}
export function solStringToLamports(input: string): number | null {
    const trimmed = input.trim();
    if (trimmed === "") return null;
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || parsed < 0) return null;
    return Math.floor(parsed * 1e9);
}
