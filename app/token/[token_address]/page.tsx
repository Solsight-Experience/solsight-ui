'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTokenDetail } from '@/features/token/hooks/token.hooks';
import {
  TokenHeader,
  TokenStats,
  TokenChart,
  TradingPanel,
  TokenTabs,
} from '@/features/token/components';

export default function TokenDetailPage() {
  const params = useParams();
  const tokenAddress = params?.token_address as string;

  const { data: token, isLoading, error } = useTokenDetail(tokenAddress);

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
    <div className="min-h-screen text-white">
      {/* Header */}
      <TokenHeader token={token} />

      {/* Stats Bar */}
      <TokenStats token={token} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 grid grid-cols-3 gap-4">
        {/* Left Column - Chart */}
        <div className="col-span-2 flex flex-col gap-4">
          <TokenChart tokenAddress={tokenAddress} />
        </div>

        {/* Right Column - Trading Panel */}
        <div className="flex flex-col gap-4">
          <TradingPanel token={token} />
        </div>

        {/* Trades/Top Traders/Holders Tabs */}
        <TokenTabs tokenAddress={tokenAddress} />
      </div>
    </div>
  );
}
