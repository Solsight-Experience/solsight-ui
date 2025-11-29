import { CurrencyConfig, INumberFormatter, Locale } from "./types";

export class CurrencyFormatter implements INumberFormatter {
  constructor(private config: CurrencyConfig = Locale.US) { }

  format(value: number | null): string {
    if (value === null) return "";
    return new Intl.NumberFormat(this.config.locale, {
      style: "currency",
      currency: this.config.currency,
    }).format(value);
  }

  convertBack(value: string): number | null {
    const normalized = value.replace(/[^\d.,-]/g, "").replace(",", ".");
    const num = parseFloat(normalized);
    return isNaN(num) ? null : num;
  }
}

