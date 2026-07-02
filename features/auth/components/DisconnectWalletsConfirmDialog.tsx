"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "../../../components/ui/button";
import { Unplug, X, AlertCircle } from "lucide-react";
import { WalletService } from "@/features/wallets/services/wallet.service";
import { WalletResponseDto } from "@/types/dto";
import { toast } from "sonner";

interface DisconnectWalletsConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const DisconnectWalletsConfirmDialog = ({ isOpen, onClose, onSuccess }: DisconnectWalletsConfirmDialogProps) => {
    const [wallets, setWallets] = useState<WalletResponseDto[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchWallets();
        }
    }, [isOpen]);

    const fetchWallets = async () => {
        try {
            setIsLoading(true);
            const walletsList = await WalletService.getUserWallets();
            setWallets(walletsList);
        } catch (error) {
            console.error("Failed to fetch wallets:", error);
            toast.error("Failed to load wallets");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDisconnectAll = async () => {
        try {
            setIsDeleting(true);
            await WalletService.disconnectAllWallets();
            toast.success("All wallets disconnected successfully");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to disconnect wallets:", error);
            toast.error("Failed to disconnect wallets");
        } finally {
            setIsDeleting(false);
        }
    };

    if (!isOpen) return null;

    const walletList = wallets || [];

    const truncateAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-6)}`;
    };

    return createPortal(
        <div className="fixed inset-0 flex justify-center items-center z-[200] bg-gray-500/20 dark:bg-black/60 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-[var(--surface-card)] border border-violet-500/50 p-8 rounded-3xl shadow-2xl w-[520px] max-w-[90vw] relative animate-in slide-in-from-bottom-4 zoom-in-95 duration-300 max-h-[85vh] overflow-y-auto">
                {/* Close button */}
                <button
                    onClick={onClose}
                    disabled={isDeleting}
                    className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-btn-hover)] hover:scale-110 active:scale-95 transition-all duration-200 disabled:opacity-50 p-1 rounded-lg"
                >
                    <X size={20} />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/20 flex items-center justify-center animate-in scale-in-50 duration-300">
                        <AlertCircle size={32} className="text-violet-500 dark:text-purple-400 animate-pulse" />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold mb-3 text-center bg-gradient-to-r from-violet-600 to-purple-500 dark:from-purple-400 dark:to-purple-800 bg-clip-text text-transparent">
                    Disconnect All Wallets
                </h2>

                {/* Description */}
                <p className="mb-6 text-center text-[var(--text-secondary)] text-sm animate-in fade-in slide-in-from-top-2 duration-300 delay-100">
                    You are about to disconnect the following wallet{walletList.length !== 1 ? "s" : ""}. This action cannot be undone.
                </p>

                {/* Wallets List */}
                <div className="mb-8 bg-[var(--surface-panel)] border border-violet-500/20 rounded-xl p-4 space-y-2 max-h-[300px] overflow-y-auto">
                    {isLoading ? (
                        <div className="text-center py-8 text-[var(--text-muted)]">
                            <div className="inline-flex items-center justify-center w-8 h-8 mb-2">
                                <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                            </div>
                            <p className="text-sm">Loading wallets...</p>
                        </div>
                    ) : walletList.length > 0 ? (
                        walletList.map((wallet, index) => (
                            <div
                                key={wallet.address}
                                className="flex items-center justify-between bg-[var(--surface-btn)] border border-violet-500/15 rounded-lg p-3 hover:bg-[var(--surface-btn-hover)] hover:border-violet-500/30 transition-all duration-200 animate-in fade-in slide-in-from-left-4 duration-300"
                                style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-yellow-600 dark:text-yellow-400/70 mb-1 truncate capitalize font-medium">
                                        {wallet.icon || "Unknown"} Wallet
                                    </p>
                                    <p className="text-sm font-mono text-[var(--text-primary)] truncate" title={wallet.address}>
                                        {truncateAddress(wallet.address)}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-[var(--text-muted)] animate-in fade-in duration-300">
                            <p className="text-sm">No wallets found</p>
                        </div>
                    )}
                </div>

                {/* Warning */}
                <div className="mb-8 rounded-lg p-3 bg-red-500/10 border border-red-500/20 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-200">
                    <p className="text-xs text-red-600 dark:text-red-300/90 text-center">Disconnecting will remove all wallet connections from your account</p>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 delay-300">
                    <Button
                        onClick={handleDisconnectAll}
                        disabled={isDeleting || walletList.length === 0}
                        className="w-full py-3 !text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 active:from-red-700 active:to-orange-700 rounded-xl border border-red-500/40 transition-all duration-200 shadow-lg hover:shadow-red-500/30 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        {isDeleting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Disconnecting...</span>
                            </>
                        ) : (
                            <>
                                <Unplug size={18} />
                                <span>Disconnect All Wallets</span>
                            </>
                        )}
                    </Button>

                    <Button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="w-full py-3 text-[var(--text-secondary)] bg-[var(--surface-btn)] hover:bg-[var(--surface-btn-hover)] active:bg-[var(--surface-btn-active)] rounded-xl border border-[var(--border-default)] transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default DisconnectWalletsConfirmDialog;
