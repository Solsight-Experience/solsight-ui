'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { MockConnectWalletDialog } from './MockConnectWalletDialog';

export default function AddWalletButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Wallet
      </Button>
      <MockConnectWalletDialog open={open} onOpenChange={setOpen} />
    </>
  );
}