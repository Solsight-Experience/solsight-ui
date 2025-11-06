import { ColumnDef } from '@tanstack/react-table';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { CategoryOverview } from './types';
import { cn } from '@/lib/utils';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

/**
 * Category Table Columns
 * Columns configuration for the Categories tab table
 */
export const categoryColumns: ColumnDef<CategoryOverview>[] = [
    {
        accessorKey: 'name',
        header: 'Category',
        cell: ({ row }) => (
            <span className="font-medium text-foreground">
                {row.original.name}
            </span>
        ),
    },
    {
        accessorKey: 'top_tokens',
        header: 'Top Gainers',
        cell: ({ row }) => (
            <div className="flex -space-x-2">
                {row.original.top_tokens.slice(0, 3).map((tokenAddress, idx) => (
                    <Avatar
                        key={idx}
                        className="h-8 w-8 border-2 border-background cursor-pointer transition-transform hover:scale-110 hover:z-10"
                        title={tokenAddress}
                    >
                        <AvatarFallback className="bg-gradient-to-br from-brand-200 to-brand-100 text-xs font-semibold text-white">
                            {tokenAddress.slice(2, 4).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                ))}
            </div>
        ),
    },
    {
        accessorKey: 'change_1h',
        header: () => <span className="block text-right">1h</span>,
        cell: ({ row }) => {
            const change = row.original.change_1h;
            const isPositive = change > 0;
            const isNegative = change < 0;
            const ChangeIcon = isPositive ? ArrowUpRight : isNegative ? ArrowDownRight : null;
            const accentColor = isPositive
                ? 'text-emerald-400'
                : isNegative
                    ? 'text-rose-400'
                    : 'text-muted-foreground';

            return (
                <div className="flex items-center justify-end gap-1">
                    {ChangeIcon ? <ChangeIcon className={cn('size-4', accentColor)} /> : null}
                    <span className={cn('font-medium', accentColor)}>
                        {formatPercent(change)}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: 'change_24h',
        header: () => <span className="block text-right">24h</span>,
        cell: ({ row }) => {
            const change = row.original.change_24h;
            const isPositive = change > 0;
            const isNegative = change < 0;
            const ChangeIcon = isPositive ? ArrowUpRight : isNegative ? ArrowDownRight : null;
            const accentColor = isPositive
                ? 'text-emerald-400'
                : isNegative
                    ? 'text-rose-400'
                    : 'text-muted-foreground';

            return (
                <div className="flex items-center justify-end gap-1">
                    {ChangeIcon ? <ChangeIcon className={cn('size-4', accentColor)} /> : null}
                    <span className={cn('font-medium', accentColor)}>
                        {formatPercent(change)}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: 'change_7d',
        header: () => <span className="block text-right">7d</span>,
        cell: ({ row }) => {
            const change = row.original.change_7d;
            const isPositive = change > 0;
            const isNegative = change < 0;
            const ChangeIcon = isPositive ? ArrowUpRight : isNegative ? ArrowDownRight : null;
            const accentColor = isPositive
                ? 'text-emerald-400'
                : isNegative
                    ? 'text-rose-400'
                    : 'text-muted-foreground';

            return (
                <div className="flex items-center justify-end gap-1">
                    {ChangeIcon ? <ChangeIcon className={cn('size-4', accentColor)} /> : null}
                    <span className={cn('font-medium', accentColor)}>
                        {formatPercent(change)}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: 'market_cap',
        header: () => <span className="block text-right">Market Cap</span>,
        cell: ({ row }) => (
            <span className="block text-right font-semibold">
                {formatCurrency(row.original.market_cap, '$')}
            </span>
        ),
    },
    {
        accessorKey: 'volume',
        header: () => <span className="block text-right">Volume</span>,
        cell: ({ row }) => (
            <span className="block text-right font-medium">
                {formatCurrency(row.original.volume, '$')}
            </span>
        ),
    },
    {
        accessorKey: 'num_tokens',
        header: () => <span className="block text-right">Nums of Coins</span>,
        cell: ({ row }) => (
            <span className="block text-right font-medium">
                {row.original.num_tokens}
            </span>
        ),
    },
];

