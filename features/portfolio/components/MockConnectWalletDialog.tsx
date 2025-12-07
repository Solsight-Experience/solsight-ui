'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAddWallet } from '../hooks/portfolio.hooks';

interface MockConnectWalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MockConnectWalletDialog({ open, onOpenChange }: MockConnectWalletDialogProps) {
  const addWalletMutation = useAddWallet();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectPhantom = async () => {
    setIsConnecting(true);
    try {
      // Simulate connection delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await addWalletMutation.mutateAsync({
        address: '7sE8ZqS1pV3mFeaBr1QqLzk2v8kWJq7GJ8kZP2xKdJwH', // Mock address
        name: 'Phantom Wallet',
        icon: 'https://cdn.prod.website-files.com/66e480f0e9eccea9c231ce92/688cfdedc848baa5dcb46202_685aaee76364cd101625876d_Phantom-logo.png',
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>Choose a wallet to connect to your portfolio</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          <Button
            variant="outline"
            className="w-full h-16 justify-start gap-4 border-gray-600 hover:bg-purple-600/10 hover:border-purple-500"
            onClick={handleConnectPhantom}
            disabled={isConnecting || addWalletMutation.isPending}
          >
            <img
              src="https://cdn.prod.website-files.com/66e480f0e9eccea9c231ce92/688cfdedc848baa5dcb46202_685aaee76364cd101625876d_Phantom-logo.png"
              alt="Phantom"
              className="h-8 w-8 object-contain"
            />
            <div className="flex flex-col items-start">
              <span className="text-base font-medium">Phantom</span>
              <span className="text-xs text-gray-400">Connect to Phantom Wallet</span>
            </div>
            {(isConnecting || addWalletMutation.isPending) && (
              <span className="ml-auto text-sm text-purple-500">Connecting...</span>
            )}
          </Button>

          <Button
            variant="outline"
            className="w-full h-16 justify-start gap-4 border-gray-600 opacity-50 cursor-not-allowed"
            disabled
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
              alt="MetaMask"
              className="h-8 w-8 object-contain"
            />
            <div className="flex flex-col items-start">
              <span className="text-base font-medium">MetaMask</span>
              <span className="text-xs text-gray-400">Coming soon</span>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full h-16 justify-start gap-4 border-gray-600 opacity-50 cursor-not-allowed"
            disabled
          >
            <img
              src="https://chainstack.com/wp-content/uploads/2023/08/trustwallet-logo-r.png"
              alt="Trust Wallet"
              className="h-8 w-8 object-contain"
            />
            <div className="flex flex-col items-start">
              <span className="text-base font-medium">Trust Wallet</span>
              <span className="text-xs text-gray-400">Coming soon</span>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
