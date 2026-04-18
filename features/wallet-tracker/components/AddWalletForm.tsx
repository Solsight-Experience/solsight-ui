"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useAddWatchedWallet } from "../hooks/useWatchlist";
import { useWatchlistStore } from "../store/watchlistStore";

export const AddWalletForm: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [address, setAddress] = useState("");
    const [label, setLabel] = useState("");

    const { mutate: addWallet, isPending } = useAddWatchedWallet();
    const setSelectedWalletAddress = useWatchlistStore((s) => s.setSelectedWalletAddress);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedAddress = address.trim();
        if (!trimmedAddress) return;

        addWallet(
            { walletAddress: trimmedAddress, label: label.trim() || undefined },
            {
                onSuccess: (wallet) => {
                    toast.success("Wallet added to watchlist");
                    setSelectedWalletAddress(wallet.walletAddress);
                    setAddress("");
                    setLabel("");
                    setIsOpen(false);
                },
                onError: (err: any) => {
                    const message = err?.response?.data?.message || err?.message || "Failed to add wallet";
                    if (err?.response?.status === 409) {
                        toast.error("This wallet is already in your watchlist");
                    } else {
                        toast.error(message);
                    }
                }
            }
        );
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-dashed border-[var(--border-default)]
                   text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-violet-500/50 transition-colors text-sm"
            >
                <Plus className="size-4" />
                Add Wallet
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-3 rounded-lg border border-violet-500/30 bg-violet-500/[0.05]">
            <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-[var(--text-secondary)]">Track a wallet</span>
                <button
                    type="button"
                    onClick={() => {
                        setIsOpen(false);
                        setAddress("");
                        setLabel("");
                    }}
                    className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                    <X className="size-3.5" />
                </button>
            </div>

            <input
                type="text"
                placeholder="Wallet address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[var(--surface-btn)] border border-[var(--border-default)] rounded-md px-3 py-1.5 text-xs text-[var(--text-primary)]
                   placeholder:text-[var(--text-disabled)] focus:outline-none focus:border-violet-500 transition-colors"
                autoFocus
            />
            <input
                type="text"
                placeholder="Label (optional)"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full bg-[var(--surface-btn)] border border-[var(--border-default)] rounded-md px-3 py-1.5 text-xs text-[var(--text-primary)]
                   placeholder:text-[var(--text-disabled)] focus:outline-none focus:border-violet-500 transition-colors"
            />

            <button
                type="submit"
                disabled={isPending || !address.trim()}
                style={{ color: "white" }}
                className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-md text-xs font-medium
                   bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors"
            >
                {isPending ? "Adding..." : "Add Wallet"}
            </button>
        </form>
    );
};
