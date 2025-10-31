import { ColumnDef } from '@tanstack/react-table';
import { ArrowDownRight, ArrowUpRight, ShieldAlert } from 'lucide-react';
import Sparkline from '../components/Sparkline';
import TokenCell from '../components/TokenCell';
import { TokenCategory, TokenTableData } from './types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const categoryStyles: Record<TokenCategory, string> = {
    MEME: 'bg-fuchsia-500/20 text-fuchsia-400',
    GameFi: 'bg-emerald-500/20 text-emerald-400',
    Infrastructure: 'bg-blue-500/20 text-blue-400',
    AI: 'bg-indigo-500/20 text-indigo-400',
    DeFi: 'bg-orange-500/20 text-orange-400',
};

const compactNumber = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
});

const formatCompact = (value: number) => {
    if (!Number.isFinite(value)) {
        return '0';
    }

    if (Math.abs(value) < 1000) {
        return value.toLocaleString('en-US');
    }

    return compactNumber.format(value);
};

const formatCurrency = (value: number, symbol: string) => {
    return `${symbol}${formatCompact(value)}`;
};

const formatPercent = (value: number) => {
    const rounded = Math.abs(value).toFixed(1);
    if (value === 0) {
        return `${rounded}%`;
    }

    return `${value > 0 ? '+' : '-'}${rounded}%`;
};

const columns: ColumnDef<TokenTableData>[] = [
    {
        accessorKey: 'token',
        header: 'Pair Info',
        cell: ({ row }) => <TokenCell token={row.original.token} />,
    },
    {
        id: 'sparkline',
        header: '',
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => <Sparkline points={row.original.token.priceHistory} />,
    },
    {
        accessorKey: 'token.category',
        header: 'Category',
        cell: ({ row }) => (
            <span
                className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium uppercase',
                    categoryStyles[row.original.token.category],
                )}
            >
                {row.original.token.category}
            </span>
        ),
    },
    {
        accessorKey: 'marketCap.value',
        header: () => <span className="block text-right">Market Cap</span>,
        cell: ({ row }) => {
            const marketCap = row.original.marketCap;
            const isPositive = marketCap.changePercent24h > 0;
            const isNegative = marketCap.changePercent24h < 0;
            const ChangeIcon = isPositive ? ArrowUpRight : isNegative ? ArrowDownRight : null;
            const accentColor = isPositive
                ? 'text-emerald-400'
                : isNegative
                    ? 'text-rose-400'
                    : 'text-muted-foreground';

            return (
                <div className="flex flex-col items-end gap-1 text-right">
                    <span className="font-semibold">
                        {formatCurrency(marketCap.value, marketCap.currencySymbol)}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-medium">
                        {ChangeIcon ? <ChangeIcon className={cn('size-4', accentColor)} /> : null}
                        <span className={accentColor}>{formatPercent(marketCap.changePercent24h)}</span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'liquidity',
        header: () => <span className="block text-right">Liquidity</span>,
        cell: ({ row }) => {
            const symbol = row.original.marketCap.currencySymbol;

            return (
                <span className="block text-right font-medium">
                    {formatCurrency(row.original.liquidity, symbol)}
                </span>
            );
        },
    },
    {
        accessorKey: 'volume24h',
        header: () => <span className="block text-right">Volume</span>,
        cell: ({ row }) => {
            const symbol = row.original.marketCap.currencySymbol;
            const { buyVolumn, sellVolumn } = row.original.transactions;

            return (
                <div className="flex flex-col items-end gap-1 text-right">
                    <span className="font-medium">
                        {formatCurrency(row.original.volume24h, symbol)}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-medium">
                        <span className="text-emerald-400">{formatCompact(buyVolumn)}</span>
                        <span className="text-muted-foreground">/</span>
                        <span className="text-rose-400">{formatCompact(sellVolumn)}</span>
                    </div>
                </div>
            );
        },
    },
    {
        id: 'transactions',
        header: () => <span className="block text-right">TXNS</span>,
        accessorFn: (row) => row.transactions.buyCount + row.transactions.sellCount,
        cell: ({ row }) => {
            const { buyCount, sellCount } = row.original.transactions;
            const total = buyCount + sellCount;

            return (
                <div className="flex flex-col items-end gap-1 text-right">
                    <span className="font-medium">{formatCompact(total)}</span>
                    <div className="flex items-center gap-1 text-xs font-medium">
                        <span className="text-emerald-400">{formatCompact(buyCount)}</span>
                        <span className="text-muted-foreground">/</span>
                        <span className="text-rose-400">{formatCompact(sellCount)}</span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'audit',
        header: () => <span className="block text-right">Audit</span>,
        enableSorting: false,
        cell: ({ row }) => (
            <div className="flex flex-wrap items-center justify-end gap-2 text-xs font-medium">
                {row.original.audit.map((item) => {
                    const Icon =
                        item.trend === 'up'
                            ? ArrowUpRight
                            : item.trend === 'down'
                                ? ArrowDownRight
                                : ShieldAlert;

                    return (
                        <span
                            key={item.label}
                            className={cn(
                                'inline-flex items-center gap-1 rounded-full px-3 py-1',
                                item.trend === 'up'
                                    ? 'bg-emerald-500/10 text-emerald-400'
                                    : item.trend === 'down'
                                        ? 'bg-rose-500/10 text-rose-400'
                                        : 'bg-muted/40 text-muted-foreground',
                            )}
                        >
                            <Icon className="size-3" />
                            <span>{item.label}</span>
                            <span>{item.value}</span>
                        </span>
                    );
                })}
            </div>
        ),
    },
    {
        id: 'action',
        header: '',
        enableHiding: false,
        cell: () => (
            <div className="flex justify-end">
                <Button size="sm" className="bg-primary text-white rounded-full hover:bg-fuchsia-500/90">
                    Buy 0.1 SOL
                </Button>
            </div>
        ),
    },
];

export default columns;
