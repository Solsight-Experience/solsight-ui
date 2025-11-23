import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useTokenUIStore } from '../stores/token.stores';
import type { TokenDetail } from '../types/token.types';

interface TradingPanelProps {
  token: TokenDetail;
}

export const TradingPanel: React.FC<TradingPanelProps> = ({ token }) => {
  const {
    tradeMode,
    setTradeMode,
    orderType,
    setOrderType,
    payAmount,
    setPayAmount,
    receiveAmount,
    setReceiveAmount,
    limitPrice,
    setLimitPrice,
  } = useTokenUIStore();

  // Dynamic token values based on trade mode
  const payToken = tradeMode === 'buy' ? 'SOL' : token.symbol;
  const receiveToken = tradeMode === 'buy' ? token.symbol : 'SOL';
  const payTokenLogo =
    tradeMode === 'buy'
      ? 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
      : token.logo_uri;
  const receiveTokenLogo =
    tradeMode === 'buy'
      ? token.logo_uri
      : 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png';

  const payBalance = tradeMode === 'buy' ? '2.45' : '0.00';
  const receiveBalance = tradeMode === 'buy' ? '0.00' : '2.45';

  return (
    <div className="border border-gray-700 rounded-lg p-4 bg-gradient-to-br">
      <div className="flex gap-2 mb-4">
        <Button
          className="flex-1"
          variant={tradeMode === 'buy' ? 'default' : 'outline'}
          onClick={() => setTradeMode('buy')}
        >
          Buy
        </Button>
        <Button
          variant={tradeMode === 'sell' ? 'default' : 'outline'}
          className="flex-1"
          onClick={() => setTradeMode('sell')}
        >
          Sell
        </Button>
      </div>

      <div className="flex gap-2 mb-4 text-sm">
        <button
          onClick={() => setOrderType('market')}
          className={`flex-1 py-2 px-3 rounded ${
            orderType === 'market'
              ? 'bg-gray-800 border-b-2 border-purple-500'
              : 'bg-gray-800 text-gray-400'
          }`}
        >
          Market
        </button>
        <button
          onClick={() => setOrderType('limit')}
          className={`flex-1 py-2 px-3 rounded ${
            orderType === 'limit'
              ? 'bg-gray-800 border-b-2 border-purple-500'
              : 'bg-gray-800 text-gray-400'
          }`}
        >
          Limit
        </button>
      </div>

      {/* Pay Section */}
      <div className="mb-4">
        <Label className="text-sm text-gray-400 mb-2">{tradeMode === 'buy' ? 'Pay' : 'Sell'}</Label>
        <div className="border border-gray-600 rounded-lg p-2 bg-gray-800/50">
          <div className="flex items-center justify-between mb-2">
            <button className="flex items-center gap-2 bg-gray-700 px-3 py-2 rounded-lg">
              <img src={payTokenLogo} className="w-5 h-5 rounded-full" alt={payToken} />
              <span className="font-semibold">{payToken}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-400">Balance: {payBalance}</span>
          </div>
          <input
            type="text"
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-transparent text-base font-bold outline-none"
          />
        </div>
      </div>

      {/* Price Section - Only for Limit Orders */}
      {orderType === 'limit' && (
        <div className="mb-4">
          <Label className="text-sm text-gray-400 mb-2">Price</Label>
          <div className="border border-gray-600 rounded-lg p-2 bg-gray-800/50">
            <input
              type="text"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent text-base font-bold outline-none"
            />
          </div>
        </div>
      )}

      {/* Receive Section */}
      <div className="mb-4">
        <Label className="text-sm text-gray-400 mb-2">Receive</Label>
        <div className="border border-gray-600 rounded-lg p-2 bg-gray-800/50">
          <div className="flex items-center justify-between mb-2">
            <button className="flex items-center gap-2 bg-gray-700 px-3 py-2 rounded-lg">
              <img src={receiveTokenLogo} className="w-5 h-5 rounded-full" alt={receiveToken} />
              <span className="font-semibold">{receiveToken}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-400">Balance: {receiveBalance}</span>
          </div>
          <input
            type="text"
            value={receiveAmount}
            onChange={(e) => setReceiveAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-transparent text-base font-bold outline-none"
          />
        </div>
      </div>

      {/* Quick Amount Buttons */}
      <div className="flex gap-2 mb-4">
        {['0.1', '0.5', '1', 'MAX'].map((amount) => (
          <button
            key={amount}
            onClick={() => setPayAmount(amount === 'MAX' ? payBalance : amount)}
            className="flex-1 py-2 px-3 rounded bg-gray-800 hover:bg-gray-700 text-sm"
          >
            {amount}
          </button>
        ))}
      </div>

      {/* Buy/Sell Button */}
      <Button className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-bold py-6 text-lg">
        {tradeMode.toUpperCase()} {tradeMode === 'buy' ? token.symbol : payToken}
      </Button>

      <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
        <span>Powered by Jupiter API</span>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span>Connected: Solana Mainnet</span>
        </div>
      </div>
    </div>
  );
};
