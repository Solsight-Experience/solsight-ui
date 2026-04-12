import React, { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Check, ExternalLink, AlertTriangle, Wallet, ArrowUpRight, ArrowDownRight, Layers } from "lucide-react";
import { useWallets, usePositions } from "../hooks/portfolio.hooks";
import { usePortfolioUIStore } from "../stores/portfolioUIStore";
import Link from "next/link";

// Wallet Positions Component
const WalletPositions: React.FC<{ walletAddress: string; walletName: string }> = ({ walletAddress, walletName }) => {
    const { data: positionsData, isLoading, error } = usePositions(walletAddress, { sort_by: "value" });

    const formatPrice = (price: number): string => {
        if (price >= 1) {
            return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        if (price >= 0.01) {
            return price.toFixed(4);
        }
        return price.toFixed(6);
    };

    const formatBalance = (balance: number, symbol: string): string => {
        if (balance >= 1000) {
            return `${balance.toLocaleString("en-US", { maximumFractionDigits: 2 })} ${symbol}`;
        }
        if (balance >= 1) {
            return `${balance.toFixed(4)} ${symbol}`;
        }
        return `${balance.toLocaleString("en-US", { maximumFractionDigits: 6 })} ${symbol}`;
    };

    if (isLoading) {
        return (
            <div className="py-12 flex flex-col items-center justify-center">
                <div className="relative w-12 h-12 flex items-center justify-center mb-4">
                    <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <div className="text-purple-300/60 animate-pulse text-sm font-medium">Scanning blockchain...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-10 text-center flex flex-col items-center justify-center bg-red-500/5 rounded-2xl border border-red-500/10 mx-4 mb-4">
                <AlertTriangle className="size-6 text-red-400 mb-2" />
                <div className="text-sm font-medium text-red-300/80">Sync failed</div>
                <div className="text-xs text-red-300/50 mt-1 max-w-xs mx-auto">Could not retrieve positions from the network. Try refreshing.</div>
            </div>
        );
    }

    if (!positionsData?.positions || positionsData.positions.length === 0) {
        return (
            <div className="py-12 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-[#1a1a24] rounded-2xl flex items-center justify-center mb-4 border border-white/5 shadow-inner">
                    <Layers className="size-8 text-gray-500" />
                </div>
                <div className="text-white font-medium mb-1">No Assets Found</div>
                <div className="text-gray-500 text-sm">This wallet has no active positions on this chain.</div>
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
                <thead className="text-xs uppercase tracking-wider text-gray-500 border-b border-white/5 bg-[#08080c]/50 backdrop-blur-md sticky top-0 z-10">
                    <tr>
                        <th className="px-6 py-4 text-start font-semibold">Asset</th>
                        <th className="px-6 py-4 text-start font-semibold">Balance</th>
                        <th className="px-6 py-4 text-start font-semibold">Price / 24h</th>
                        <th className="px-6 py-4 text-end font-semibold">Value (USD)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                    {positionsData.positions.map((position) => (
                        <tr key={position.token.address} className="hover:bg-purple-900/[0.03] transition-colors group">
                            <td className="px-6 py-4">
                                <Link
                                    href={`/token/${position.token.address}`}
                                    target="_blank"
                                    className="flex items-center gap-4 hover:text-purple-400 transition-colors w-max"
                                >
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-purple-500/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <img
                                            src={position.token.logo_uri}
                                            alt={position.token.symbol}
                                            className="w-10 h-10 rounded-full border border-white/10 relative z-10 shadow-sm bg-[#12121a]"
                                        />
                                    </div>
                                    <div>
                                        <div className="font-bold text-white tracking-wide">{position.token.symbol}</div>
                                        <div className="text-xs text-gray-500 font-medium">{position.token.name}</div>
                                    </div>
                                    <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0">
                                        <ExternalLink className="size-3 text-purple-400" />
                                    </div>
                                </Link>
                            </td>
                            <td className="px-6 py-4 font-mono text-sm text-gray-300 font-medium">{formatBalance(position.balance, position.token.symbol)}</td>
                            <td className="px-6 py-4">
                                <div className="font-mono text-white text-sm font-medium mb-1">${formatPrice(position.current_price)}</div>
                                <div
                                    className={`text-xs font-bold inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md ${position.price_change_24h >= 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}
                                >
                                    {position.price_change_24h >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                                    {Math.abs(position.price_change_24h).toFixed(2)}%
                                </div>
                            </td>
                            <td className="px-6 py-4 font-mono text-base font-bold text-white text-end">
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

    // Error state
    if (error) {
        return (
            <div className="border border-red-500/20 bg-red-950/20 backdrop-blur-md p-10 rounded-3xl shadow-xl">
                <div className="flex flex-col items-center justify-center text-center gap-4">
                    <div className="p-4 bg-red-500/10 rounded-full border border-red-500/20">
                        <AlertTriangle className="size-8 text-red-500" />
                    </div>
                    <div className="text-red-400 text-xl font-bold tracking-tight">System Disconnected</div>
                    <div className="text-red-300/60 max-w-sm">{error instanceof Error ? error.message : "Failed to retrieve wallet data across networks."}</div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4">
                {[1, 2].map((i) => (
                    <div key={i} className="border border-white/5 bg-[#0c0c14]/50 p-6 rounded-3xl animate-pulse backdrop-blur-sm">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex gap-4 items-center">
                                <div className="w-12 h-12 bg-gray-800 rounded-xl"></div>
                                <div className="space-y-2">
                                    <div className="h-5 w-32 bg-gray-800 rounded"></div>
                                    <div className="h-3 w-48 bg-gray-800 rounded"></div>
                                </div>
                            </div>
                            <div className="h-8 w-24 bg-gray-800 rounded-lg"></div>
                        </div>
                        <div className="h-32 bg-gray-800/50 rounded-2xl"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (!walletsData?.wallets) return null;

    // Empty state - no wallets
    if (walletsData.wallets.length === 0) {
        return (
            <div className="group border border-dashed border-white/20 bg-white/5 hover:bg-white/10 p-16 rounded-3xl transition-colors duration-300 text-center flex flex-col items-center justify-center cursor-pointer">
                <div className="p-5 bg-[#1a1a24] rounded-full mb-6 relative group-hover:scale-110 transition-transform duration-500 shadow-xl border border-white/5">
                    <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full"></div>
                    <Wallet className="size-10 text-gray-400 relative z-10 group-hover:text-purple-400 transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Connect Your First Wallet</h3>
                <p className="text-gray-400 max-w-md mx-auto">
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
                        className="group relative rounded-3xl bg-[#0c0c14]/80 backdrop-blur-2xl border border-white/10 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all hover:border-purple-500/30"
                    >
                        {/* Subtle top glow */}
                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div
                            className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 sm:p-6 cursor-pointer hover:bg-white/[0.02] transition-colors"
                            onClick={() => toggleWalletCollapse(wallet.address)}
                        >
                            <div className="flex gap-4 items-center flex-1">
                                <div className="p-1.5 bg-gradient-to-b from-white/10 to-white/5 rounded-2xl border border-white/10 shadow-lg relative">
                                    <img src={wallet.icon} alt={wallet.name} className="h-10 w-10 rounded-xl object-contain" />
                                </div>
                                <div>
                                    <div className="font-bold text-lg text-white tracking-tight flex items-center gap-2">
                                        {wallet.name}
                                        <span className="text-[10px] uppercase font-bold tracking-widest bg-white/10 px-2 py-0.5 rounded text-white/70">
                                            Connected
                                        </span>
                                    </div>
                                    <div
                                        className="text-gray-400 text-xs flex items-center gap-1.5 cursor-pointer hover:text-purple-400 transition-colors font-mono mt-1 w-max"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCopyAddress(wallet.address);
                                        }}
                                        title="Click to copy address"
                                    >
                                        <span>
                                            {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                                        </span>
                                        {copiedAddress === wallet.address ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-6 items-center mt-4 sm:mt-0 ml-[4.5rem] sm:ml-0">
                                <div className="text-right">
                                    <div className="font-mono font-bold text-white text-lg">
                                        ${wallet.balance_usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                    <div className="text-xs text-purple-300/70 font-semibold uppercase tracking-wider">{wallet.balance_sol.toFixed(4)} SOL</div>
                                </div>

                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10 transition-transform duration-300 ${isCollapsed ? "" : "rotate-180 bg-purple-500/20 border-purple-500/30 text-purple-400"}`}
                                >
                                    <ChevronDown className="size-4" />
                                </div>
                            </div>
                        </div>

                        <div
                            className={`grid transition-all duration-300 ease-in-out ${isCollapsed ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100 border-t border-white/5"}`}
                        >
                            <div className="overflow-hidden">
                                <div className="bg-[#050508]/50">
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
