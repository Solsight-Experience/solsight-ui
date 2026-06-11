import React from "react";
import Image from "next/image";
import { AlertTriangle, Wallet } from "lucide-react";
import { useWallets } from "../hooks/portfolio.hooks";
import AddWalletButton from "./AddWalletButton";
import WalletDropdownMenu from "./WalletDropdownMenu";

export const WalletList: React.FC = () => {
    const { data: walletsData, isLoading, error } = useWallets();

    for (const wallet of walletsData?.wallets || []) {
        switch (wallet.icon) {
            case "phantom":
                wallet.icon = "https://cdn.prod.website-files.com/66e480f0e9eccea9c231ce92/688cfdedc848baa5dcb46202_685aaee76364cd101625876d_Phantom-logo.png";
                break;
        }
    }

    return (
        <div className="flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-[var(--text-muted)]">Wallets</span>
                <AddWalletButton />
            </div>

            {/* Error */}
            {error && (
                <div
                    className="flex items-center gap-2.5 p-3 rounded-xl
                                bg-red-500/[0.06] border border-red-500/20 text-red-400"
                >
                    <AlertTriangle size={14} className="shrink-0" />
                    <div>
                        <div className="text-[12px] font-semibold">Failed to load wallets</div>
                        <div className="text-[11px] opacity-70 mt-0.5">{error instanceof Error ? error.message : "Network error"}</div>
                    </div>
                </div>
            )}

            {/* Loading skeleton */}
            {isLoading && (
                <div className="flex flex-col gap-2">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 p-3 rounded-xl
                                                border border-[var(--border-faint)] animate-pulse"
                        >
                            <div className="h-8 w-8 rounded-lg bg-black/[0.07] dark:bg-white/[0.07] shrink-0" />
                            <div className="flex-1 space-y-1.5">
                                <div className="h-2.5 w-24 rounded-full bg-black/[0.07] dark:bg-white/[0.07]" />
                                <div className="h-2 w-16 rounded-full bg-black/[0.05] dark:bg-white/[0.05]" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!isLoading && !error && walletsData?.wallets?.length === 0 && (
                <div
                    className="flex flex-col items-center justify-center gap-2 py-8
                                rounded-xl border border-dashed border-[var(--border-subtle)]
                                text-[var(--text-muted)]"
                >
                    <Wallet size={20} className="opacity-40" />
                    <div className="text-[12px] font-medium">No wallets added</div>
                    <div className="text-[11px] opacity-60">Click + to add your first wallet</div>
                </div>
            )}

            {/* Wallet cards */}
            {!isLoading && !error && walletsData?.wallets && (
                <div className="flex flex-col gap-2">
                    {[...walletsData.wallets]
                        .sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0))
                        .map((wallet) => (
                            <div
                                key={wallet.address}
                                className="flex items-center gap-3 p-3 rounded-xl
                                           border border-[var(--border-subtle)]
                                           bg-[var(--surface-btn)]
                                           hover:border-violet-500/30 hover:bg-violet-500/[0.04]
                                           transition-all duration-150"
                            >
                                <Image
                                    src={wallet.icon}
                                    className="rounded-lg h-8 w-8 object-contain shrink-0"
                                    alt={wallet.name}
                                    width={32}
                                    height={32}
                                    unoptimized
                                />
                                <div className="flex flex-col flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[12.5px] font-semibold text-[var(--text-primary)] truncate">{wallet.name}</span>
                                        {wallet.is_default && (
                                            <span
                                                className="text-[9px] font-bold tracking-wide uppercase
                                                             px-1.5 py-0.5 rounded-md
                                                             bg-violet-500/10 text-violet-500 dark:text-violet-300
                                                             border border-violet-500/20 shrink-0"
                                            >
                                                Default
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-baseline gap-1.5 mt-0.5">
                                        <span className="text-[13px] font-semibold text-[var(--text-primary)]">{wallet.balance_sol.toFixed(4)} SOL</span>
                                        <span className="text-[11px] text-[var(--text-muted)]">
                                            ${wallet.balance_usd.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5">
                                        {wallet.address.slice(0, 4)}…{wallet.address.slice(-4)}
                                    </span>
                                </div>
                                <WalletDropdownMenu walletAddress={wallet.address} isDefault={wallet.is_default} />
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
};
