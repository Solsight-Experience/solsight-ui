/**
 * Utility classes and functions for formatting numbers, currency, and percentages
 * Uses the INumberFormatter interface for consistent number formatting
 */

import { INumberFormatter, CurrencyFormatter, DecimalFormatter, Locale, CompactFormatter } from '@/lib/number-formatters';

/**
 * Percentage formatter with customizable decimal places
 */
export class PercentFormatter implements INumberFormatter {
    constructor(private decimals: number = 1) {}

    format(value: number | null): string {
        if (value === null || !Number.isFinite(value)) {
            return '0%';
        }

        const rounded = Math.abs(value).toFixed(this.decimals);
        
        if (value === 0) {
            return `${rounded}%`;
        }

        return `${value > 0 ? '+' : '-'}${rounded}%`;
    }

    convertBack(value: string): number | null {
        if (!value) return null;
        const normalized = value.replace(/[%+\s]/g, '');
        const num = parseFloat(normalized);
        return isNaN(num) ? null : num;
    }
}

/**
 * Address formatter for wallet addresses
 */
export class AddressFormatter {
    constructor(
        private prefixLength: number = 8,
        private suffixLength: number = 8
    ) {}

    format(address: string): string {
        if (address.length <= this.prefixLength + this.suffixLength) {
            return address;
        }
        
        return `${address.slice(0, this.prefixLength)}...${address.slice(-this.suffixLength)}`;
    }
}

// Formatter instances for backward compatibility
const compactFormatter = new CompactFormatter();
const percentFormatter = new PercentFormatter(1);
const addressFormatter = new AddressFormatter();
const numberFormatter = new DecimalFormatter();
const currencyFormatter = new CurrencyFormatter(Locale.US);

// Legacy function exports for backward compatibility
/**
 * Format a number to compact notation (K, M, B)
 * @deprecated Use CompactFormatter instance instead
 */
export function formatCompact(value: number): string {
    return compactFormatter.format(value);
}

/**
 * Format a number as currency with symbol and compact notation
 * @deprecated Use CompactCurrencyFormatter instance instead
 */
export function formatCurrency(value: number, symbol: string = '$'): string {
    const formatter = new CurrencyFormatter();
    return formatter.formatCompact(value);
}

/**
 * Format a number as a percentage
 * @deprecated Use PercentFormatter instance instead
 */
export function formatPercent(value: number, decimals: number = 1): string {
    const formatter = new PercentFormatter(decimals);
    return formatter.format(value);
}

/**
 * Format a wallet address to show first and last characters
 * @deprecated Use AddressFormatter instance instead
 */
export function formatWalletAddress(
    address: string,
    prefixLength: number = 8,
    suffixLength: number = 8
): string {
    const formatter = new AddressFormatter(prefixLength, suffixLength);
    return formatter.format(address);
}

/**
 * Format a large number with full thousands separators
 * @deprecated Use DecimalFormatter or CurrencyFormatter instead
 */
export function formatNumber(value: number): string {
    return value.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
}

// Export formatter instances for direct use
export {
    compactFormatter,
    percentFormatter,
    addressFormatter,
    numberFormatter,
    currencyFormatter,
};
