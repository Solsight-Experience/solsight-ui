/**
 * Resolves the grouping (thousands) and decimal separators a given locale uses
 * via `Intl.NumberFormat.formatToParts`. Falls back to en-US characters if the
 * locale does not produce them.
 */
export function getLocaleSeparators(locale: string): { group: string; decimal: string } {
    const parts = new Intl.NumberFormat(locale).formatToParts(1000.1);
    return {
        group: parts.find((p) => p.type === "group")?.value ?? ",",
        decimal: parts.find((p) => p.type === "decimal")?.value ?? "."
    };
}
