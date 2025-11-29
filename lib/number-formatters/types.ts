export interface INumberFormatter {
  format(value: number | null): string;
  convertBack(value: string): number | null;
}

export type CurrencyConfig = {
  locale: string;
  currency: string;
}

export const Locale = {
  US: { locale: "en-US", currency: "USD" },
  VN: { locale: "vi-VN", currency: "VND" },
  JP: { locale: "ja-JP", currency: "JPY" },
  EU: { locale: "de-DE", currency: "EUR" },
} as const;