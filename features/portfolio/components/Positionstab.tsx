import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Copy, Check, ExternalLink, AlertTriangle, Wallet, ArrowUpRight, ArrowDownRight, Layers } from "lucide-react";
import { useWallets, usePositions } from "../hooks/portfolio.hooks";
import { usePortfolioUIStore } from "../stores/portfolioUIStore";

const WalletPositions: React.FC<{ walletAddress: string; walletName: string }> = ({ walletAddress }) => {
    const { data: positionsData, isLoading, error } = usePositions(walletAddress, { sort_by: "value" });

    const formatPrice = (price: number): string => {
        if (price >= 1) return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        if (price >= 0.01) return price.toFixed(4);
        return price.toFixed(6);
    };

    const formatBalance = (balance: number, symbol: string): string => {
        if (balance >= 1000) return `${balance.toLocaleString("en-US", { maximumFractionDigits: 2 })} ${symbol}`;
        if (balance >= 1) return `${balance.toFixed(4)} ${symbol}`;
        return `${balance.toLocaleString("en-US", { maximumFractionDigits: 6 })} ${symbol}`;
    };

    if (isLoading) {
        return (
            <div className="py-12 flex flex-col items-center justify-center">
                <div className="relative w-12 h-12 flex items-center justify-center mb-4">
                    <div className="absolute inset-0 border-4 border-violet-500/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-violet-500 rounded-full border-t-transparent animate-spin" />
                </div>
                <div className="text-violet-500 dark:text-violet-300/60 animate-pulse text-sm font-medium">Scanning blockchain...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-10 text-center flex flex-col items-center justify-center bg-red-500/5 rounded-2xl border border-red-500/10 mx-4 mb-4">
                <AlertTriangle className="size-6 text-red-500 dark:text-red-400 mb-2" />
                <div className="text-sm font-medium text-red-500 dark:text-red-300/80">Sync failed</div>
                <div className="text-xs text-red-400/60 mt-1 max-w-xs mx-auto">Could not retrieve positions from the network. Try refreshing.</div>
            </div>
        );
    }

    if (!positionsData?.positions || positionsData.positions.length === 0) {
        return (
            <div className="py-12 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-[var(--surface-panel)] rounded-2xl flex items-center justify-center mb-4 border border-[var(--border-faint)] shadow-inner">
                    <Layers className="size-8 text-[var(--text-muted)]" />
                </div>
                <div className="text-[var(--text-primary)] font-medium mb-1">No Assets Found</div>
                <div className="text-[var(--text-muted)] text-sm">This wallet has no active positions on this chain.</div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full table-fixed min-w-[700px]">
                <colgroup>
                    <col className="w-[35%]" />
                    <col className="w-[20%]" />
                    <col className="w-[25%]" />
                    <col className="w-[20%]" />
                </colgroup>
                <thead className="text-xs uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-faint)] bg-[var(--surface-panel)] sticky top-0 z-10">
                    <tr>
                        <th className="px-6 py-4 text-start font-semibold">Asset</th>
                        <th className="px-6 py-4 text-start font-semibold">Balance</th>
                        <th className="px-6 py-4 text-start font-semibold">Price / 24h</th>
                        <th className="px-6 py-4 text-end font-semibold">Value (USD)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-faint)]">
                    {positionsData.positions.map((position) => (
                        <tr key={position.token.address} className="hover:bg-violet-500/[0.03] transition-colors group">
                            <td className="px-6 py-4">
                                <Link
                                    href={`/token/${position.token.address}`}
                                    target="_blank"
                                    className="flex items-center gap-4 hover:text-violet-500 dark:hover:text-violet-400 transition-colors w-max"
                                >
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-violet-500/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {position.token.logo_uri ? (
                                            <Image
                                                src={position.token.logo_uri}
                                                alt={position.token.symbol}
                                                width={40}
                                                height={40}
                                                className="w-10 h-10 rounded-full border border-[var(--border-default)] relative z-10 shadow-sm bg-[var(--surface-card)]"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full border border-[var(--border-default)] relative z-10 shadow-sm bg-violet-500/10 flex items-center justify-center font-bold text-xs text-violet-500 select-none">
                                                {position.token.symbol.slice(0, 2)}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-bold text-[var(--text-primary)] tracking-wide">{position.token.symbol}</div>
                                        <div className="text-xs text-[var(--text-muted)] font-medium">{position.token.name}</div>
                                    </div>
                                    <div className="w-6 h-6 rounded-md bg-[var(--surface-btn)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0">
                                        <ExternalLink className="size-3 text-violet-500 dark:text-violet-400" />
                                    </div>
                                </Link>
                            </td>
                            <td className="px-6 py-4 font-mono text-sm text-[var(--text-secondary)] font-medium">
                                {formatBalance(position.balance, position.token.symbol)}
                            </td>
                            <td className="px-6 py-4">
                                <div className="font-mono text-[var(--text-primary)] text-sm font-medium mb-1">${formatPrice(position.current_price)}</div>
                                <div
                                    className={`text-xs font-bold inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md
                                    ${
                                        position.price_change_24h >= 0
                                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                            : "bg-red-500/10 text-red-600 dark:text-red-400"
                                    }`}
                                >
                                    {position.price_change_24h >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                                    {Math.abs(position.price_change_24h).toFixed(2)}%
                                </div>
                            </td>
                            <td className="px-6 py-4 font-mono text-base font-bold text-[var(--text-primary)] text-end">
                                ${position.value_usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export const PositionsTab: React.FC = () => {
    const { data: walletsData, isLoading, error } = useWallets();
    const { collapsedWallets, toggleWalletCollapse } = usePortfolioUIStore();
    const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

    const handleCopyAddress = (address: string) => {
        navigator.clipboard.writeText(address);
        setCopiedAddress(address);
        setTimeout(() => setCopiedAddress(null), 2000);
    };

    if (error) {
        return (
            <div className="border border-red-500/20 bg-red-500/[0.04] p-10 rounded-3xl">
                <div className="flex flex-col items-center justify-center text-center gap-4">
                    <div className="p-4 bg-red-500/10 rounded-full border border-red-500/20">
                        <AlertTriangle className="size-8 text-red-500" />
                    </div>
                    <div className="text-red-500 dark:text-red-400 text-xl font-bold tracking-tight">System Disconnected</div>
                    <div className="text-red-400/60 max-w-sm text-sm">
                        {error instanceof Error ? error.message : "Failed to retrieve wallet data across networks."}
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4">
                {[1, 2].map((i) => (
                    <div key={i} className="border border-[var(--border-faint)] bg-[var(--surface-card)] p-6 rounded-3xl animate-pulse">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex gap-4 items-center">
                                <div className="w-12 h-12 bg-[var(--surface-panel)] rounded-xl" />
                                <div className="space-y-2">
                                    <div className="h-5 w-32 bg-[var(--surface-panel)] rounded" />
                                    <div className="h-3 w-48 bg-[var(--surface-panel)] rounded" />
                                </div>
                            </div>
                            <div className="h-8 w-24 bg-[var(--surface-panel)] rounded-lg" />
                        </div>
                        <div className="h-32 bg-[var(--surface-panel)] rounded-2xl" />
                    </div>
                ))}
            </div>
        );
    }

    if (!walletsData?.wallets) return null;

    if (walletsData.wallets.length === 0) {
        return (
            <div className="group border border-dashed border-[var(--border-default)] bg-[var(--surface-btn)] hover:bg-[var(--surface-btn-hover)] p-16 rounded-3xl transition-colors duration-300 text-center flex flex-col items-center justify-center">
                <div className="p-5 bg-[var(--surface-panel)] rounded-full mb-6 relative group-hover:scale-110 transition-transform duration-500 border border-[var(--border-subtle)]">
                    <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full" />
                    <Wallet className="size-10 text-[var(--text-muted)] relative z-10 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Connect Your First Wallet</h3>
                <p className="text-[var(--text-muted)] max-w-md mx-auto text-sm">
                    Get comprehensive tracking of all your assets, positions, and performance across the ecosystem.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5">
            {walletsData.wallets.map((wallet) => {
                const isCollapsed = collapsedWallets[wallet.address] || false;

                return (
                    <div
                        key={wallet.address}
                        className="group relative rounded-3xl bg-[var(--surface-card)] border border-[var(--border-subtle)]
                                   overflow-hidden shadow-[var(--shadow-card)] transition-all hover:border-violet-500/30"
                    >
                        {/* Subtle top glow on hover */}
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div
                            className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 sm:p-6 cursor-pointer hover:bg-[var(--surface-btn)] transition-colors"
                            onClick={() => toggleWalletCollapse(wallet.address)}
                        >
                            <div className="flex gap-4 items-center flex-1">
                                <div className="p-1.5 bg-[var(--surface-btn)] rounded-2xl border border-[var(--border-subtle)] shadow-sm">
                                    {wallet.icon ? (
                                        <Image
                                            src={wallet.icon}
                                            alt={wallet.name}
                                            width={40}
                                            height={40}
                                            className="h-10 w-10 rounded-xl object-contain"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center font-bold text-xs text-violet-500 select-none">
                                            {wallet.name.slice(0, 2)}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="font-bold text-lg text-[var(--text-primary)] tracking-tight flex items-center gap-2">
                                        {wallet.name}
                                        <span
                                            className="text-[10px] uppercase font-bold tracking-widest
                                                         bg-[var(--surface-btn)] px-2 py-0.5 rounded
                                                         text-[var(--text-muted)] border border-[var(--border-faint)]"
                                        >
                                            Connected
                                        </span>
                                    </div>
                                    <div
                                        className="text-[var(--text-muted)] text-xs flex items-center gap-1.5
                                                   cursor-pointer hover:text-violet-500 dark:hover:text-violet-400
                                                   transition-colors font-mono mt-1 w-max"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCopyAddress(wallet.address);
                                        }}
                                        title="Click to copy address"
                                    >
                                        <span>
                                            {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                                        </span>
                                        {copiedAddress === wallet.address ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-6 items-center mt-4 sm:mt-0 ml-[4.5rem] sm:ml-0">
                                <div className="text-right">
                                    <div className="font-mono font-bold text-[var(--text-primary)] text-lg">
                                        ${wallet.balance_usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                    <div className="text-xs text-violet-500 dark:text-violet-300/70 font-semibold uppercase tracking-wider">
                                        {wallet.balance_sol.toFixed(4)} SOL
                                    </div>
                                </div>

                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300
                                    ${
                                        isCollapsed
                                            ? "bg-[var(--surface-btn)] border-[var(--border-subtle)]"
                                            : "rotate-180 bg-violet-500/10 border-violet-500/25 text-violet-500 dark:text-violet-400"
                                    }`}
                                >
                                    <ChevronDown className="size-4" />
                                </div>
                            </div>
                        </div>

                        <div
                            className={`grid transition-all duration-300 ease-in-out
                            ${isCollapsed ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100 border-t border-[var(--border-faint)]"}`}
                        >
                            <div className="overflow-hidden">
                                <div className="bg-[var(--surface-panel)]">
                                    <WalletPositions walletAddress={wallet.address} walletName={wallet.name} />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
