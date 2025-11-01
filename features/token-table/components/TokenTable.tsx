'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import columns from '../config/columns';
import { TokenTableData } from '../config/types';
import { TokenTabs } from './TokenTabs';
import { Filter, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogTitle,
    DialogTrigger,
    DialogContent,
    DialogFooter,
} from '@/components/ui/dialog';
import FilterDialog from './FilterDialog';
import { DialogClose } from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';

const data: TokenTableData[] = [
    // 1. MORON
    {
        id: 'moron_contract_address_xyz',
        token: {
            iconUrl: '/icons/moron.png',
            ticker: 'MORON',
            name: 'MORON',
            priceHistory: [30, 45, 40, 50, 60, 55, 65], // Upward trend
            category: 'MEME',
            age: '10m',
        },
        marketCap: {
            value: 123000,
            currencyCode: 'USD',
            currencySymbol: '$',
            changePercent24h: 46.8,
        },
        liquidity: 38000,
        volume24h: 20400,
        transactions: {
            buyCount: 2860,
            sellCount: 2010,
            buyVolumn: 27000,
            sellVolumn: 12000,
        },
        audit: [
            { label: 'Risk', value: '22.6%', trend: 'down' },
            { label: 'Fees', value: '0.83%', trend: 'up' },
            { label: 'Score', value: 'B 139', trend: 'neutral' },
        ],
    },
    // 2. RENDER
    {
        id: 'render_contract_address_abc',
        token: {
            iconUrl: '/icons/render.png',
            ticker: 'RENDER',
            name: 'RENDER',
            priceHistory: [80, 75, 70, 65, 60, 55, 50], // Downward trend
            category: 'GameFi',
            age: '7d',
        },
        marketCap: {
            value: 2030000000, // 2.03B
            currencyCode: 'USD',
            currencySymbol: '$',
            changePercent24h: -26.5,
        },
        liquidity: 115000000, // 115M
        volume24h: 980000000, // 980M
        transactions: {
            buyCount: 123000,
            sellCount: 120000,
            buyVolumn: 83000,
            sellVolumn: 46000,
        },
        audit: [
            { label: 'Risk', value: '28.3%', trend: 'down' },
            { label: 'Fees', value: '0.63%', trend: 'up' },
            { label: 'Score', value: 'A 271', trend: 'neutral' },
        ],
    },
    // 3. UOG
    {
        id: 'uog_contract_address_123',
        token: {
            iconUrl: '/icons/uog.png',
            ticker: 'UOG',
            name: 'University Of Games',
            priceHistory: [50, 52, 51, 53, 52, 54, 53], // Neutral / Slight Up
            category: 'GameFi',
            age: '2mo 4d',
        },
        marketCap: {
            value: 530800,
            currencyCode: 'USD',
            currencySymbol: '$',
            changePercent24h: 0.0,
        },
        liquidity: 82260,
        volume24h: 68740,
        transactions: {
            buyCount: 482000,
            sellCount: 480000,
            buyVolumn: 278000,
            sellVolumn: 204000,
        },
        audit: [
            { label: 'Risk', value: '18.4%', trend: 'down' },
            { label: 'Fees', value: '0.71%', trend: 'up' },
            { label: 'Score', value: 'B 188', trend: 'neutral' },
        ],
    },
    // 4. 2Z
    {
        id: '2z_contract_address_456',
        token: {
            iconUrl: '/icons/2z.png',
            ticker: '2Z',
            name: 'DoubleZero',
            priceHistory: [70, 65, 75, 60, 68, 55, 60], // Volatile / Down
            category: 'Infrastructure',
            age: '10d',
        },
        marketCap: {
            value: 865190000, // 865.19M
            currencyCode: 'USD',
            currencySymbol: '$',
            changePercent24h: -10.1,
        },
        liquidity: 72580000, // 72.58M
        volume24h: 12400000, // 12.4M
        transactions: {
            buyCount: 12400,
            sellCount: 12000,
            buyVolumn: 6800,
            sellVolumn: 5600,
        },
        audit: [
            { label: 'Risk', value: '30.5%', trend: 'down' },
            { label: 'Fees', value: '0.54%', trend: 'up' },
            { label: 'Score', value: 'A 272', trend: 'neutral' },
        ],
    },
    // 5. SOON
    {
        id: 'soon_contract_address_789',
        token: {
            iconUrl: '/icons/soon.png',
            ticker: 'SOON',
            name: 'SOON',
            priceHistory: [20, 25, 23, 30, 28, 35, 38], // Upward trend
            category: 'Infrastructure',
            age: '10m',
        },
        marketCap: {
            value: 234800000, // 234.8M
            currencyCode: 'USD',
            currencySymbol: '$',
            changePercent24h: 3.4,
        },
        liquidity: 120800000, // 120.8M
        volume24h: 118600000, // 118.6M
        transactions: {
            buyCount: 123000,
            sellCount: 120000,
            buyVolumn: 1500,
            sellVolumn: 2500,
        },
        audit: [
            { label: 'Risk', value: '14.2%', trend: 'down' },
            { label: 'Fees', value: '0.72%', trend: 'up' },
            { label: 'Score', value: 'A 265', trend: 'neutral' },
        ],
    },
    // 6. DOGE
    {
        id: 'doge_contract_address_dog',
        token: {
            iconUrl: '/icons/doge.png',
            ticker: 'DOGE',
            name: 'Dogecoin',
            priceHistory: [40, 38, 42, 35, 37, 30, 32], // Downward trend
            category: 'MEME',
            age: '10y',
        },
        marketCap: {
            value: 28500000000, // 28.5B
            currencyCode: 'USD',
            currencySymbol: '$',
            changePercent24h: -2.0,
        },
        liquidity: 3700000000, // 3.7B
        volume24h: 28500000, // 28.5M
        transactions: {
            buyCount: 331000,
            sellCount: 330000,
            buyVolumn: 130000,
            sellVolumn: 200000,
        },
        audit: [
            { label: 'Risk', value: '25.8%', trend: 'down' },
            { label: 'Fees', value: '0.59%', trend: 'up' },
            { label: 'Score', value: 'B 112', trend: 'neutral' },
        ],
    },
    // 7. FET
    {
        id: 'fet_contract_address_ai',
        token: {
            iconUrl: '/icons/fet.png',
            ticker: 'FET',
            name: 'Artificial Superintelligence',
            priceHistory: [30, 45, 40, 50, 60, 55, 65], // Upward trend
            category: 'AI',
            age: '10m',
        },
        marketCap: {
            value: 963300000, // 963.3M
            currencyCode: 'USD',
            currencySymbol: '$',
            changePercent24h: 46.8,
        },
        liquidity: 300100000, // 300.1M
        volume24h: 143700000, // 143.7M
        transactions: {
            buyCount: 123000, // Same as SOON in UI
            sellCount: 120000, // Same as SOON in UI
            buyVolumn: 1500, // Same as SOON in UI
            sellVolumn: 2500, // Same as SOON in UI
        },
        audit: [
            { label: 'Risk', value: '19.1%', trend: 'down' },
            { label: 'Fees', value: '0.68%', trend: 'up' },
            { label: 'Score', value: 'A 270', trend: 'neutral' },
        ],
    },
];

export default function TokenTable() {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <>
            <div className="flex justify-between">
                <TokenTabs onTabClick={() => { }} />
                <div className="flex items-center gap-[18px]">
                    <TimeFilters />
                    <FilterButton />
                    <QuickBuyInput />
                </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl px-4">
                <Table>
                    <TableHeader className="bg-muted/20">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-4">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}

function TimeFilters() {
    enum TimeFilterVariant {
        '1m' = 60,
        '5m' = 300, // 60 * 5
        '30m' = 1800,
        '1h' = 3600,
    }
    const variantList = Object.keys(TimeFilterVariant).filter((key) =>
        isNaN(Number(key))
    ) as (keyof typeof TimeFilterVariant)[];
    return (
        <div className="flex gap-5 font-medium">
            {variantList.map((variant) => (
                <TimeFilterItem key={variant} value={variant} isActive={variant === '1m'} />
            ))}
        </div>
    );
}

function TimeFilterItem({ value, isActive }: { value: string; isActive: boolean }) {
    return (
        <Button variant="link" className={`text-neutral-500 ${isActive && 'text-brand-200'}`}>
            {value}
        </Button>
    );
}

function FilterButton() {
    return (
        <Dialog>
            <form>
                <DialogTrigger>
                    <Button asChild variant="ghost">
                        <div className="flex items-center px-4 cursor-pointer">
                            <Filter fill="var(--color-brand-200)" stroke="none" size="1rem" />
                            <span>Filter</span>
                        </div>
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogTitle className="text-brand-200">Filter</DialogTitle>
                    <FilterDialog />
                    <DialogFooter>
                        <div className="flex justify-between flex-1">
                            <Button variant="secondary">{<RefreshCw />}Reset</Button>
                            <DialogClose asChild>
                                <Button type="submit">Apply</Button>
                            </DialogClose>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
}

function QuickBuyInput() {
    return (
        <div className="flex items-center border-[1.25] border-brand-200 rounded-full overflow-hidden px-4 py-0.5 gap-7">
            <Label htmlFor="input--quickBuy" className="w-auto text-dark-default-hover">
                Quick Buy
            </Label>
            <Input
                id="input--quickBuy"
                placeholder="0.1"
                className="w-16 border-none focus-visible:ring-0 focus-visible:border-none font-bold text-center text-brand-200 p-0 placeholder:text-brand-200"
            />
            <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_Tq97-Pbo95DdBUs0rEHGDkQ4eBkl8gW3WA&s"
                alt="solana-icon"
                className="w-6 h-6"
            />
        </div>
    );
}
