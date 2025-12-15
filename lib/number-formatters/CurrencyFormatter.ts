import { CompactFormatter } from "./CompactFormatter";
import { CurrencyConfig, INumberFormatter, Locale } from "./types";

export class CurrencyFormatter implements INumberFormatter {

  constructor(private config: CurrencyConfig = Locale.US) { }

  format(value: number | null): string {
    let formatValue = value ?? 0;
    return new Intl.NumberFormat(this.config.locale, {
      style: "currency",
      currency: this.config.currency,
    }).format(formatValue);
  }

  convertBack(formattedValue: string): number | null {
    if (!formattedValue || formattedValue.trim() === "") return null;

    // Get currency symbol and formatting info
    const formatter = new Intl.NumberFormat(this.config.locale, {
      style: "currency",
      currency: this.config.currency,
    });

    // Format a known number to extract decimal and thousand separators
    const parts = formatter.formatToParts(1234.56);
    const decimalSeparator = parts.find(p => p.type === "decimal")?.value || ".";
    const groupSeparator = parts.find(p => p.type === "group")?.value || ",";
    const currencySymbol = parts.find(p => p.type === "currency")?.value || "";

    // Remove currency symbol, currency code, and whitespace
    let cleaned = formattedValue
      .replace(currencySymbol, "")
      .replace(this.config.currency, "")
      .trim();

    // Remove group separators (thousands separators)
    const groupSeparatorRegex = new RegExp(`\\${groupSeparator}`, "g");
    cleaned = cleaned.replace(groupSeparatorRegex, "");

    // Replace decimal separator with standard dot
    if (decimalSeparator !== ".") {
      cleaned = cleaned.replace(decimalSeparator, ".");
    }

    // Remove any remaining non-numeric characters except minus sign and dot
    cleaned = cleaned.replace(/[^\d.-]/g, "");

    // Parse to number
    const parsed = parseFloat(cleaned);

    return isNaN(parsed) ? 0 : parsed;
  }

  formatCompact(value: number | null): string {
    if (value === null) return '';
    return new Intl.NumberFormat(this.config.locale, {
      style: 'currency',
      currency: this.config.currency,
      notation: 'compact',
    }).format(value);
  }
}

