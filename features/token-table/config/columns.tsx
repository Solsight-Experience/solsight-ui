import { ColumnDef } from '@tanstack/react-table';
import { ArrowDownRight, ArrowUpRight, ShieldAlert, Star } from 'lucide-react';
import Sparkline from '../components/Sparkline';
import TokenCell from '../components/TokenCell';
import { TokenCategory, TokenTableData } from './types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatCompact, formatCurrency, formatPercent } from '@/lib/formatters';

const categoryStyles: Record<TokenCategory, string> = {
    MEME: 'bg-fuchsia-500/20 text-fuchsia-400',
    GameFi: 'bg-emerald-500/20 text-emerald-400',
    Infrastructure: 'bg-blue-500/20 text-blue-400',
    AI: 'bg-indigo-500/20 text-indigo-400',
    DeFi: 'bg-orange-500/20 text-orange-400',
};

/**
 * Creates columns with optional favorite toggle handler
 */
export const createColumns = (
    toggleFavourite?: (tokenId: string) => void,
    favouriteIds?: Set<string>,
    quickBuyAmount?: string,
): ColumnDef<TokenTableData>[] => [
    {
        id: 'favourite',
        header: '',
        enableHiding: false,
        size: 40,
        cell: ({ row }) => {
            const isFavourite = favouriteIds?.has(row.original.id) ?? false;
            
            return toggleFavourite ? (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleFavourite(row.original.id);
                    }}
                    className="text-muted-foreground hover:text-yellow-400 transition-colors"
                    aria-label={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
                >
                    <Star
                        size={18}
                        className={cn(isFavourite && 'fill-yellow-400 text-yellow-400')}
                    />
                </button>
            ) : null;
        },
    },
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
        cell: ({ row }) => {
            const auditData = row.original.audit;
            
            // Calculate top holders and audit score based on audit data
            const topHoldersData = auditData.find(item => item.label.includes('271'));
            const auditScoreData = auditData.find(item => item.label.includes('139'));
            
            const topHolders = topHoldersData?.value || '22.66%';
            const auditScore = auditScoreData?.value || '0.03%';
            const topHoldersTrend = topHoldersData?.trend || 'down';
            const auditScoreTrend = auditScoreData?.trend || 'up';

            return (
                <div className="flex flex-col items-end gap-2 text-right">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                            {topHoldersTrend === 'down' ? (
                                <ArrowDownRight className="size-4 text-rose-400" />
                            ) : (
                                <ArrowUpRight className="size-4 text-emerald-400" />
                            )}
                            <span className={cn(
                                'text-sm font-semibold',
                                topHoldersTrend === 'down' ? 'text-rose-400' : 'text-emerald-400'
                            )}>
                                {topHolders}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            {auditScoreTrend === 'up' ? (
                                <ShieldAlert className="size-4 text-emerald-400" />
                            ) : (
                                <ShieldAlert className="size-4 text-rose-400" />
                            )}
                            <span className={cn(
                                'text-sm font-semibold',
                                auditScoreTrend === 'up' ? 'text-emerald-400' : 'text-rose-400'
                            )}>
                                {auditScore}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <span>👤 271</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span>📊 139</span>
                        </div>
                    </div>
                </div>
            );
        },
    },
    {
        id: 'action',
        header: '',
        enableHiding: false,
        cell: () => (
            <div className="flex justify-end">
                <Button 
                    size="sm" 
                    className="bg-primary text-white rounded-full hover:bg-fuchsia-500/90"
                    onClick={(e) => e.stopPropagation()}
                >
                    Buy {quickBuyAmount} SOL
                </Button>
            </div>
        ),
    },
];

// Default export for backward compatibility
const columns = createColumns();
export default columns;
