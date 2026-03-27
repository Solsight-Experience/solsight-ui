"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/dialog";

interface TradeConfirmDialogProps {
    data: {
        inputMint: string;
        outputMint: string;
        amount: string;
    };
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    onSetPayAmount: (amount: string) => void;
}

export const TradeConfirmDialog: React.FC<TradeConfirmDialogProps> = ({ data, open, onConfirm, onCancel, onSetPayAmount }) => {
    const router = useRouter();

    const handleConfirm = React.useCallback(() => {
        onSetPayAmount(data.amount);
        router.push("/token/" + data.outputMint);
        onConfirm();
    }, [data.amount, data.outputMint, onConfirm, onSetPayAmount, router]);

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={(isOpen) => !isOpen && onCancel()}
            title="Confirm Trade"
            confirmLabel="Confirm"
            onConfirm={handleConfirm}
            onCancel={onCancel}
        >
            <div className="grid gap-2" data-testid="trade-confirm-dialog">
                <div className="text-sm text-muted-foreground">You are about to trade:</div>
                <div className="flex items-center justify-between">
                    <div className="font-medium">Amount</div>
                    <div className="font-mono">{data.amount}</div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="font-medium">To</div>
                    <div className="truncate text-right">{data.outputMint}</div>
                </div>
            </div>
        </ConfirmDialog>
    );
};

export default TradeConfirmDialog;
