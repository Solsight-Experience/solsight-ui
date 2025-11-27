import { INumberFormatter } from "./types";

export class CurrencyFormatter implements INumberFormatter {
  constructor(private locale = "en-US", private currency = "USD") { }

  format(value: number | null): string {
    if (value === null) return "";
    return new Intl.NumberFormat(this.locale, {
      style: "currency",
      currency: this.currency,
    }).format(value);
  }

  convertBack(value: string): number | null {
    const normalized = value.replace(/[^\d.,-]/g, "").replace(",", ".");
    const num = parseFloat(normalized);
    return isNaN(num) ? null : num;
  }
}

