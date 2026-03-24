import { CurrencyConfig, INumberFormatter, Locale } from "./types";

// Subscript digits for small price formatting (Axiom style)
const SUBSCRIPT_DIGITS: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
  '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
};

export class CurrencyFormatter implements INumberFormatter {

  constructor(private config: CurrencyConfig = Locale.US) { }

  /**
   * Smart currency formatter that handles all ranges:
   * - Large numbers (≥1000): Compact notation (K, M, B)
   * - Regular numbers (0.01 - 999): Standard currency format
   * - Small numbers (<0.01 with 4+ leading zeros): Subscript notation ($0.0₅412)
   *
   * @param value - The value to format
   * @param significantDigits - Significant digits for small numbers (default: 3)
   */
  format(value: number | null, significantDigits: number = 3): string {
    if (value === null) return '$0';
    if (value === 0) return '$0';

    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    // Large numbers: use compact notation (K, M, B)
    if (absValue >= 1000) {
      return new Intl.NumberFormat(this.config.locale, {
        style: 'currency',
        currency: this.config.currency,
        notation: 'compact',
        maximumFractionDigits: 2,
      }).format(value);
    }

    // Small numbers: use subscript notation for leading zeros
    if (absValue < 0.01) {
      return this.formatSmallPrice(value, significantDigits);
    }

    // Regular numbers: standard currency format
    return new Intl.NumberFormat(this.config.locale, {
      style: 'currency',
      currency: this.config.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
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

  /**
   * @deprecated Use format() instead - it now handles all cases automatically
   */
  formatCompact(value: number | null, significantDigits: number = 3): string {
    return this.format(value, significantDigits);
  }

  /**
   * Format small prices with subscript notation (Axiom style)
   * e.g., 0.00000412 -> $0.0₅412
   * Shows the count of leading zeros after decimal as subscript
   */
  private formatSmallPrice(value: number, significantDigits: number = 3): string {
    if (value === 0) return '$0';

    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    // Convert to string to count leading zeros
    const str = absValue.toFixed(20); // Use high precision
    const decimalIndex = str.indexOf('.');

    if (decimalIndex === -1) {
      return this.format(value);
    }

    const decimals = str.slice(decimalIndex + 1);

    // Count leading zeros after decimal point
    let leadingZeros = 0;
    for (const char of decimals) {
      if (char === '0') {
        leadingZeros++;
      } else {
        break;
      }
    }

    // If 4 or more leading zeros, use subscript notation
    if (leadingZeros >= 4) {
      // Get significant digits after the zeros
      const significantPart = decimals.slice(leadingZeros, leadingZeros + significantDigits);
      const subscript = String(leadingZeros).split('').map(d => SUBSCRIPT_DIGITS[d]).join('');
      return `${sign}$0.0${subscript}${significantPart}`;
    }

    // For 1-3 leading zeros, show normally with appropriate precision
    const precision = leadingZeros + significantDigits;
    return new Intl.NumberFormat(this.config.locale, {
      style: 'currency',
      currency: this.config.currency,
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    }).format(value);
  }
}

