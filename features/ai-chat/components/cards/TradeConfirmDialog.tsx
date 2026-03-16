 'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useTokenUIStore } from '@/features/token/stores/token.stores';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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

export const TradeConfirmDialog: React.FC<TradeConfirmDialogProps> = ({
  data,
  open,
  onConfirm,
  onCancel,
}) => {
  const router = useRouter();

  const handleConfirm = React.useCallback(() => {
    useTokenUIStore.getState().setPayAmount(data.amount);
    router.push('/token/' + data.outputMint);
    onConfirm();
  }, [data.amount, data.outputMint, onConfirm, router]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent data-testid="trade-confirm-dialog">
        <DialogHeader>
          <DialogTitle>Confirm Trade</DialogTitle>
        </DialogHeader>

        <div className="grid gap-2">
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

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button onClick={handleConfirm} type="button">
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TradeConfirmDialog;
