import React, { useEffect, useState } from 'react';
import { LimitOrderService } from '@/features/limit-orders';
import type { LimitOrder } from '@/features/limit-orders';
import { useWallet } from '@/features/wallets/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ExternalLink, X, Loader2 } from 'lucide-react';
import { formatFromBaseUnits } from '@/features/swap';

interface ActiveLimitOrdersProps {
  tokenAddress?: string;
  inputMint?: string;
  outputMint?: string;
}

export const ActiveLimitOrders: React.FC<ActiveLimitOrdersProps> = ({
  tokenAddress,
  inputMint,
  outputMint,
}) => {
  const { connected, publicKey } = useWallet();
  const [orders, setOrders] = useState<LimitOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!connected || !publicKey) return;

    setLoading(true);
    try {
      const walletAddress = typeof publicKey === 'string' ? publicKey : (publicKey as any).toBase58();
      const response = await LimitOrderService.getOrders(
        walletAddress,
        'active',
        {
          inputMint,
          outputMint,
        }
      );
      setOrders(response.orders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [connected, publicKey, inputMint, outputMint]);

  const handleCancelOrder = async (orderAccount: string) => {
    if (!publicKey) return;

    setCancellingOrder(orderAccount);
    try {
      const provider = (window as Window & { solana?: any }).solana;
      if (!provider?.isPhantom) {
        throw new Error('Phantom wallet not found');
      }

      const walletAddress = typeof publicKey === 'string' ? publicKey : (publicKey as any).toBase58();
      
      // Get cancel transaction
      const cancelResponse = await LimitOrderService.cancelOrder(
        walletAddress,
        orderAccount
      );

      // Sign transaction
      const txBuffer = Buffer.from(cancelResponse.transaction, 'base64');
      const { VersionedTransaction } = await import('@solana/web3.js');
      const transaction = VersionedTransaction.deserialize(txBuffer);
      const signedTx = await provider.signTransaction(transaction);
      const signedTxBase64 = Buffer.from(signedTx.serialize()).toString('base64');

      // Execute cancel
      await LimitOrderService.executeOrder({
        requestId: cancelResponse.requestId,
        signedTransaction: signedTxBase64,
      });

      toast.success('Order cancelled successfully');
      fetchOrders(); // Refresh orders
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to cancel order';
      toast.error(message);
    } finally {
      setCancellingOrder(null);
    }
  };

  if (!connected) {
    return null;
  }

  if (loading) {
    return (
      <div className="p-4 bg-gray-900/80 rounded-lg border border-gray-700">
        <div className="flex items-center justify-center gap-2 text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading orders...</span>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-4 bg-gray-900/80 rounded-lg border border-gray-700">
        <p className="text-sm text-gray-400 text-center">No active limit orders</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/80 rounded-lg border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <h3 className="font-semibold text-white">Active Limit Orders ({orders.length})</h3>
      </div>
      <div className="divide-y divide-gray-700">
        {orders.map((order) => (
          <div key={order.account} className="p-4 hover:bg-gray-800/50 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">
                    {formatFromBaseUnits(order.makingAmount, 9)} → {formatFromBaseUnits(order.takingAmount, 6)}
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  {order.expiredAt && (
                    <span>Expires: {new Date(order.expiredAt * 1000).toLocaleString()}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://solscan.io/account/${order.account}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    View on Solscan <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleCancelOrder(order.account)}
                disabled={cancellingOrder === order.account}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                {cancellingOrder === order.account ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
