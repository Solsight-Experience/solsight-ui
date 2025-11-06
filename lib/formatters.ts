/**
 * Utility functions for formatting numbers, currency, and percentages
 */

const compactNumberFormatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
});

/**
 * Format a number to compact notation (K, M, B)
 * @param value - The number to format
 * @returns Formatted string
 */
export function formatCompact(value: number): string {
    if (!Number.isFinite(value)) {
        return '0';
    }

    if (Math.abs(value) < 1000) {
        return value.toLocaleString('en-US');
    }

    return compactNumberFormatter.format(value);
}

/**
 * Format a number as currency with symbol and compact notation
 * @param value - The number to format
 * @param symbol - The currency symbol (e.g., '$', '€')
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, symbol: string = '$'): string {
    return `${symbol}${formatCompact(value)}`;
}

/**
 * Format a number as a percentage
 * @param value - The number to format as percentage
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string with + or - sign
 */
export function formatPercent(value: number, decimals: number = 1): string {
    const rounded = Math.abs(value).toFixed(decimals);
    
    if (value === 0) {
        return `${rounded}%`;
    }

    return `${value > 0 ? '+' : '-'}${rounded}%`;
}

/**
 * Format a wallet address to show first and last characters
 * @param address - The full wallet address
 * @param prefixLength - Number of characters to show at start (default: 8)
 * @param suffixLength - Number of characters to show at end (default: 8)
 * @returns Shortened address string
 */
export function formatWalletAddress(
    address: string,
    prefixLength: number = 8,
    suffixLength: number = 8
): string {
    if (address.length <= prefixLength + suffixLength) {
        return address;
    }
    
    return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
}

/**
 * Format a large number with full thousands separators
 * @param value - The number to format
 * @returns Formatted string with commas
 */
export function formatNumber(value: number): string {
    return value.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
}
