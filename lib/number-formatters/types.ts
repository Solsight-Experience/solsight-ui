export interface INumberFormatter {
  format(value: number | null): string;
  convertBack(value: string): number | null;
}

