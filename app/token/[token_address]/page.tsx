'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useTokenDetail } from '@/features/token/hooks/token.hooks';
import {
  TokenHeader,
  TokenStats,
  TokenChart,
  TradingPanel,
  TokenTabs,
  AISummaryButton,
  AISummaryPanel,
} from '@/features/token/components';
import { useTokenUIStore } from '@/features/token/stores/token.stores';

export default function TokenDetailPage() {
  const params = useParams();
  const tokenAddress = params?.token_address as string;
  const [isAISummaryOpen, setIsAISummaryOpen] = useState(false);
  const [enablePriceRuler, setEnablePriceRuler] = useState(false);

  const { data: token, isLoading, error } = useTokenDetail(tokenAddress);
  const { setLimitPrice, orderType } = useTokenUIStore();

  // Enable price ruler when limit order is selected
  useEffect(() => {
    setEnablePriceRuler(orderType === 'limit');
  }, [orderType]);

  // Handle ruler price change from chart
  const handleRulerPriceChange = useCallback((price: number) => {
    setLimitPrice(price.toString());
  }, [setLimitPrice]);

  if (isLoading) {
    return (
      <div className="min-h-screen text-white">
        <div className="border-b border-gray-700 p-4 animate-pulse">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-700"></div>
            <div className="flex flex-col gap-2">
              <div className="h-6 w-32 bg-gray-700 rounded"></div>
              <div className="h-4 w-48 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto p-4">
          <div className="h-96 bg-gray-800 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Token Not Found</h1>
          <p className="text-gray-400">
            The token you're looking for doesn't exist or couldn't be loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <TokenHeader
        token={token}
        aiSummaryButton={<AISummaryButton onClick={() => setIsAISummaryOpen(true)} />}
      />
      {isAISummaryOpen && token && (
        <AISummaryPanel 
          isOpen={isAISummaryOpen} 
          onToggle={() => setIsAISummaryOpen(false)}
          tokenAddress={tokenAddress}
          tokenName={token.name}
          tokenSymbol={token.symbol}
        />
      )}

      {/* Stats Bar */}
      <TokenStats token={token} />

      {/* Main Content - Two Column Layout */}
      <div className="max-w-7xl mx-auto p-4 flex flex-row gap-6">
        {/* Left Column - Chart & Tabs */}
        <div className="flex flex-col gap-4 overflow-hidden flex-2">
          {/* Chart */}
          <div className="flex-2 border border-gray-700 rounded-lg p-4 bg-gray-900/50 ">
            <TokenChart 
              tokenAddress={tokenAddress} 
              isMulti={false}
              enablePriceRuler={enablePriceRuler}
              onRulerPriceChange={handleRulerPriceChange}
            />
          </div>
          {/* Tabs */}
          <div className="grow max-h-[500px] border border-gray-700 rounded-lg bg-gray-900/50 overflow-auto">
            <TokenTabs tokenAddress={tokenAddress} />
          </div>
        </div>

        {/* Right Column - Trading Panel */}
        <div className="flex-1">
          <TradingPanel token={token} />
        </div>
      </div>
    </div>
  );
}
