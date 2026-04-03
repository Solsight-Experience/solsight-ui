import React, { useMemo } from "react";
import { ExternalLink } from "lucide-react";
import { currencyFormatter } from "@/lib/formatters";
import { useTokenPools } from "../hooks/token.hooks";
import type { TokenPool } from "../types/token.types";

interface PoolsTableProps {
    tokenAddress: string;
}

const dexColor = ["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-orange-500", "bg-pink-500", "bg-cyan-500"];

const getDexColor = (index: number) => dexColor[index % dexColor.length];

const toPct = (value: number) => `${value.toFixed(1)}%`;

const DEXDistribution: React.FC<{ pools: TokenPool[]; totalLiquidity: number }> = ({ pools, totalLiquidity }) => {
    const distribution = useMemo(() => {
        const dexMap = new Map<string, number>();

        pools.forEach((pool) => {
            dexMap.set(pool.dex, (dexMap.get(pool.dex) || 0) + pool.liquidity_usd);
        });

        return Array.from(dexMap.entries())
            .map(([dex, liquidity]) => ({
                dex,
                liquidity,
                percent: totalLiquidity > 0 ? (liquidity / totalLiquidity) * 100 : 0
            }))
            .sort((a, b) => b.liquidity - a.liquidity);
    }, [pools, totalLiquidity]);

    if (distribution.length === 0) {
        return null;
    }

    return (
        <div className="px-4 pb-3">
            <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-3">
                <div className="mb-2 text-xs uppercase tracking-wide text-gray-400">DEX Liquidity Distribution</div>
                <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-800">
                    {distribution.map((item, index) => (
                        <div key={item.dex} className={getDexColor(index)} style={{ width: `${Math.max(item.percent, 1)}%` }} aria-hidden="true" />
                    ))}
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {distribution.map((item, index) => (
                        <div key={item.dex} className="flex items-center justify-between rounded-md border border-gray-800 bg-black/40 px-2 py-1.5">
                            <div className="flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full ${getDexColor(index)}`} aria-hidden="true" />
                                <span className="text-xs text-gray-200">{item.dex}</span>
                            </div>
                            <div className="text-xs text-gray-300">{toPct(item.percent)}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const PoolRow: React.FC<{
    pool: TokenPool;
    rank: number;
    totalLiquidity: number;
}> = ({ pool, rank, totalLiquidity }) => {
    const liquidityShare = totalLiquidity > 0 ? (pool.liquidity_usd / totalLiquidity) * 100 : 0;

    return (
        <tr className="border-b border-gray-700 hover:bg-gray-800/50">
            <td className="py-2.5 px-4 text-sm text-gray-400">#{rank}</td>
            <td className="py-2.5 px-4">
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-100">{pool.pair_name}</span>
                    <span className="text-xs text-gray-500">
                        {pool.pool_address.slice(0, 8)}...{pool.pool_address.slice(-6)}
                    </span>
                </div>
            </td>
            <td className="py-2.5 px-4 text-sm text-gray-300">{pool.dex}</td>
            <td className="py-2.5 px-4 text-sm text-gray-200">{currencyFormatter.format(pool.liquidity_usd)}</td>
            <td className="py-2.5 px-4">
                <div className="min-w-[120px]">
                    <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs text-gray-300">{toPct(liquidityShare)}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.max(liquidityShare, 2)}%` }} />
                    </div>
                </div>
            </td>
            <td className="py-2.5 px-4 text-sm text-gray-200">{currencyFormatter.format(pool.volume_24h_usd)}</td>
            <td className="py-2.5 px-4 text-sm text-gray-300">{pool.fee_percent.toFixed(2)}%</td>
            <td className="py-2.5 px-4">
                <a
                    href={`https://solscan.io/account/${pool.pool_address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                    View
                    <ExternalLink className="h-3.5 w-3.5" />
                </a>
            </td>
        </tr>
    );
};

export const PoolsTable: React.FC<PoolsTableProps> = ({ tokenAddress }) => {
    const { data: poolsData, isLoading, isError } = useTokenPools(tokenAddress);

    if (isLoading) {
        return (
            <div className="animate-pulse px-4 pb-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="mb-2 h-14 rounded bg-gray-800" />
                ))}
            </div>
        );
    }

    if (isError) {
        return <div className="py-10 text-center text-sm text-gray-400">Unable to load pool distribution right now.</div>;
    }

    if (!poolsData?.pools?.length) {
        return <div className="py-10 text-center text-sm text-gray-400">No pool distribution data available for this token.</div>;
    }

    const totalLiquidity = poolsData.summary.total_liquidity_usd || poolsData.pools.reduce((sum, pool) => sum + pool.liquidity_usd, 0);

    return (
        <div className="flex h-full flex-col overflow-hidden">
            <div className="grid grid-cols-2 gap-2 px-4 pb-3 pt-1 md:grid-cols-4">
                <div className="rounded-md border border-gray-800 bg-gray-900/40 p-2">
                    <p className="text-[11px] uppercase tracking-wide text-gray-500">Total Liquidity</p>
                    <p className="mt-1 text-sm font-semibold text-gray-100">{currencyFormatter.format(totalLiquidity)}</p>
                </div>
                <div className="rounded-md border border-gray-800 bg-gray-900/40 p-2">
                    <p className="text-[11px] uppercase tracking-wide text-gray-500">24h Volume</p>
                    <p className="mt-1 text-sm font-semibold text-gray-100">{currencyFormatter.format(poolsData.summary.total_volume_24h_usd)}</p>
                </div>
                <div className="rounded-md border border-gray-800 bg-gray-900/40 p-2">
                    <p className="text-[11px] uppercase tracking-wide text-gray-500">DEXs</p>
                    <p className="mt-1 text-sm font-semibold text-gray-100">{poolsData.summary.unique_dex_count}</p>
                </div>
                <div className="rounded-md border border-gray-800 bg-gray-900/40 p-2">
                    <p className="text-[11px] uppercase tracking-wide text-gray-500">Pools</p>
                    <p className="mt-1 text-sm font-semibold text-gray-100">{poolsData.summary.unique_pool_count || poolsData.pools.length}</p>
                </div>
            </div>

            <DEXDistribution pools={poolsData.pools} totalLiquidity={totalLiquidity} />

            <div className="flex-1 overflow-auto scrollbar-thin pb-4">
                <table className="w-full min-w-[940px] whitespace-nowrap">
                    <thead className="sticky top-0 z-10 border-b border-gray-700 bg-[black]/90 text-xs text-gray-500 shadow-sm backdrop-blur-md after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-gray-700">
                        <tr>
                            <th className="py-2 text-start px-4 font-medium">#</th>
                            <th className="py-2 text-start px-4 font-medium">Pool</th>
                            <th className="py-2 text-start px-4 font-medium">DEX</th>
                            <th className="py-2 text-start px-4 font-medium">Liquidity</th>
                            <th className="py-2 text-start px-4 font-medium">Distribution</th>
                            <th className="py-2 text-start px-4 font-medium">24h Volume</th>
                            <th className="py-2 text-start px-4 font-medium">Fee</th>
                            <th className="py-2 text-start px-4 font-medium">Explorer</th>
                        </tr>
                    </thead>
                    <tbody>
                        {poolsData.pools
                            .slice()
                            .sort((a, b) => b.liquidity_usd - a.liquidity_usd)
                            .map((pool, index) => (
                                <PoolRow key={pool.pool_address} pool={pool} rank={index + 1} totalLiquidity={totalLiquidity} />
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
