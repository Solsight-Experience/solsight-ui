import { currencyFormatter, percentFormatter, numberFormatter, PercentFormatter } from '@/lib/formatters';

// Time formatting
export const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

// Number formatting
export const formatNumber = (num: number, decimals: number = 2): string => {
  return currencyFormatter.formatCompact(num);
};

export const formatTokenAmount = (amount: number, decimals: number = 2): string => {
  return numberFormatter.format(amount) || amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatPercent = (value: number, decimals: number = 2): string => {
  const formatter = new PercentFormatter(decimals);
  return formatter.format(value);
};

// Clipboard
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
};

// Chart data generation (for mock data)
export const generateChartData = (points: number, seed: number = 12345) => {
  const data = [];
  const now = Date.now();
  const basePrice = 0.0412;

  // Simple seeded random function for consistent results
  const seededRandom = (index: number) => {
    const x = Math.sin(seed + index) * 10000;
    return x - Math.floor(x);
  };

  for (let i = points; i >= 0; i--) {
    const timestamp = now - i * 60000; // 1 minute intervals
    const volatility = 0.002;
    const trend = -0.00001 * i;
    const randomChange = (seededRandom(i) - 0.5) * volatility;
    const price = basePrice + trend + randomChange;

    data.push({
      timestamp,
      price: Math.max(0.039, Math.min(0.043, price)),
      volume: seededRandom(i + 1000) * 400000 + 100000,
    });
  }

  return data;
};
