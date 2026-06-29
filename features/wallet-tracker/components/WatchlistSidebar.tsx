"use client";

import React, { useState } from "react";
import { Trash2, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useWatchlist, useRemoveWatchedWallet, useUpdateWatchedWallet } from "../hooks/useWatchlist";
import { useWatchlistStore } from "../store/watchlistStore";
import { AddWalletForm } from "./AddWalletForm";
import type { WatchedWallet } from "../types/watchlist.types";

const shortenAddress = (address: string) => `${address.slice(0, 4)}...${address.slice(-4)}`;

const WalletItem: React.FC<{ wallet: WatchedWallet; isSelected: boolean; onSelect: () => void }> = ({ wallet, isSelected, onSelect }) => {
    const [editing, setEditing] = useState(false);
    const [labelInput, setLabelInput] = useState(wallet.label || "");

    const { mutate: removeWallet, isPending: removing } = useRemoveWatchedWallet();
    const { mutate: updateWallet, isPending: updating } = useUpdateWatchedWallet();
    const setSelectedWallet = useWatchlistStore((s) => s.setSelectedWallet);

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        removeWallet(wallet.walletAddress, {
            onSuccess: () => {
                toast.success("Wallet removed from watchlist");
                setSelectedWallet(null);
            },
            onError: () => toast.error("Failed to remove wallet")
        });
    };

    const handleSaveLabel = (e: React.MouseEvent) => {
        e.stopPropagation();
        updateWallet(
            { address: wallet.walletAddress, data: { label: labelInput } },
            {
                onSuccess: () => {
                    toast.success("Label updated");
                    setEditing(false);
                },
                onError: () => toast.error("Failed to update label")
            }
        );
    };

    const handleCancelEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setLabelInput(wallet.label || "");
        setEditing(false);
    };

    return (
        <div
            onClick={onSelect}
            className={`group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors
        ${isSelected ? "bg-violet-500/10 border border-violet-500/30" : "hover:bg-[var(--surface-btn)] border border-transparent"}`}
        >
            <div className="flex flex-col min-w-0 flex-1">
                {editing ? (
                    <input
                        type="text"
                        value={labelInput}
                        onChange={(e) => setLabelInput(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[var(--surface-btn)] border border-[var(--border-default)] rounded px-2 py-0.5 text-xs text-[var(--text-primary)]
                       focus:outline-none focus:border-violet-500 w-full"
                        autoFocus
                    />
                ) : (
                    <>
                        <span className="text-xs font-medium text-[var(--text-primary)] truncate">{wallet.label || shortenAddress(wallet.walletAddress)}</span>
                        {wallet.label && (
                            <span className="text-[10px] text-[var(--text-muted)] font-mono truncate">{shortenAddress(wallet.walletAddress)}</span>
                        )}
                    </>
                )}
            </div>

            <div className="flex items-center gap-1 ml-2 shrink-0">
                {editing ? (
                    <>
                        <button onClick={handleSaveLabel} disabled={updating} className="p-1 text-emerald-500 hover:text-emerald-400 transition-colors">
                            <Check className="size-3" />
                        </button>
                        <button onClick={handleCancelEdit} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                            <X className="size-3" />
                        </button>
                    </>
                ) : (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setEditing(true);
                            }}
                            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                        >
                            <Pencil className="size-3" />
                        </button>
                        <button
                            onClick={handleRemove}
                            disabled={removing}
                            className="p-1 text-[var(--text-muted)] hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        >
                            <Trash2 className="size-3" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export const WatchlistSidebar: React.FC = () => {
    const { data, isLoading, error } = useWatchlist();
    const { selectedWalletAddress, setSelectedWallet } = useWatchlistStore();

    return (
        <div className="flex flex-col h-full border-r border-[var(--border-subtle)] bg-[var(--surface-panel)]">
            <div className="px-4 py-4 border-b border-[var(--border-subtle)]">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">Watchlist</h2>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Track any Solana wallet</p>
                <div className="mt-3">
                    <AddWalletForm />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-1.5">
                {isLoading && (
                    <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-10 bg-[var(--surface-btn)] rounded-lg animate-pulse" />
                        ))}
                    </div>
                )}

                {error && <p className="text-xs text-red-500 dark:text-red-400 text-center py-4">Failed to load watchlist</p>}

                {!isLoading && !error && data?.wallets?.length === 0 && (
                    <p className="text-xs text-[var(--text-muted)] text-center py-4">No wallets tracked yet</p>
                )}

                {data?.wallets?.map((wallet) => (
                    <WalletItem
                        key={wallet.id}
                        wallet={wallet}
                        isSelected={selectedWalletAddress === wallet.walletAddress}
                        onSelect={() => setSelectedWallet(wallet.walletAddress, wallet.network)}
                    />
                ))}
            </div>
        </div>
    );
};
