"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Zap, ArrowRight, X } from "lucide-react";
import { useTokenUIStore } from "@/features/token/stores/token.stores";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { addressFormatter } from "@/lib/formatters";

interface TradeConfirmDialogProps {
    data: {
        inputMint: string;
        outputMint: string;
        amount: string;
    };
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const TradeConfirmDialog: React.FC<TradeConfirmDialogProps> = ({ data, open, onConfirm, onCancel }) => {
    const router = useRouter();

    const handleConfirm = React.useCallback(() => {
        useTokenUIStore.getState().setPayAmount(data.amount);
        router.push("/token/" + data.outputMint);
        onConfirm();
    }, [data.amount, data.outputMint, onConfirm, router]);

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
            <DialogContent data-testid="trade-confirm-dialog" className="max-w-sm border-border/60 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                            <Zap className="w-3.5 h-3.5 text-white" />
                        </div>
                        Confirm Trade
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-3 py-1">
                    <p className="text-sm text-muted-foreground">Review your trade details before proceeding to the swap interface.</p>

                    <div className="rounded-xl border border-border/60 bg-muted/20 divide-y divide-border/40 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3">
                            <span className="text-xs text-muted-foreground uppercase tracking-wide">Amount</span>
                            <span className="text-sm font-mono font-semibold">{data.amount}</span>
                        </div>
                        <div className="flex items-center justify-between px-4 py-3">
                            <span className="text-xs text-muted-foreground uppercase tracking-wide">From</span>
                            <span className="text-xs font-mono text-muted-foreground">{addressFormatter.format(data.inputMint)}</span>
                        </div>
                        <div className="flex items-center justify-between px-4 py-3">
                            <span className="text-xs text-muted-foreground uppercase tracking-wide">To</span>
                            <span className="text-xs font-mono text-violet-400">{addressFormatter.format(data.outputMint)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 pt-1">
                    <button
                        onClick={onCancel}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-border/60 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                    >
                        <X className="w-3.5 h-3.5" />
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-sm font-medium shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Go to Swap
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default TradeConfirmDialog;
