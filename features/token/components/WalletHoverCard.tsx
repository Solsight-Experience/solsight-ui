import React, { useState } from 'react';
import { formatNumber } from '../utils/token.utils';
import type { Holder } from '../types/token.types';
import { WalletPnlPanel } from './WalletPnlPanel';

interface WalletHoverCardProps {
  holder: Holder;
  children: React.ReactNode;
  tokenSymbol?: string;
}

const formatHolderDuration = (firstTxTime: number): string => {
  if (!firstTxTime || firstTxTime <= 0) return '—';

  const now = Date.now();
  const diffMs = now - firstTxTime;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 0) return `${diffDays}d`;
  if (diffHours > 0) return `${diffHours}h`;
  if (diffMinutes > 0) return `${diffMinutes}m`;
  return '<1m';
};

export const WalletHoverCard: React.FC<WalletHoverCardProps> = ({ holder, children, tokenSymbol }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPnlPanelOpen, setIsPnlPanelOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(holder.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const shortAddr = `${holder.address.slice(0, 6)}...${holder.address.slice(-4)}`;
  const totalPnl = (holder.realized_pnl || 0) + (holder.unrealized_pnl || 0);
  const holderDuration = formatHolderDuration(holder.first_tx_time);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div
        onClick={() => {
          setIsOpen(false);
          setIsPnlPanelOpen(true);
        }}
        className="cursor-pointer"
      >
        {children}
      </div>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 z-50 animate-in fade-in-0 zoom-in-95 duration-100">
          <div className="bg-[#1a1a2e] border border-gray-700 rounded-lg shadow-xl p-3 min-w-[280px]">
            {/* Header with wallet address */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <code className="text-sm text-gray-300">{shortAddr}</code>
                <button
                  onClick={handleCopy}
                  className="text-gray-500 hover:text-gray-300 transition-colors"
                  title="Copy address"
                >
                  {copied ? (
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span>USD</span>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
                  <text x="10" y="14" textAnchor="middle" fontSize="10" fill="currentColor">$</text>
                </svg>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {/* Buys */}
              <div className="bg-[#0d0d1a] rounded-lg p-2 text-center">
                <div className="flex items-center justify-center gap-1 text-green-400 font-semibold">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  <span>{formatNumber(holder.total_bought)}</span>
                </div>
                <div className="text-xs text-gray-500">{holder.buy_tx_count} Buys</div>
              </div>

              {/* Sells */}
              <div className="bg-[#0d0d1a] rounded-lg p-2 text-center">
                <div className="flex items-center justify-center gap-1 text-red-400 font-semibold">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  <span>{formatNumber(holder.total_sold)}</span>
                </div>
                <div className="text-xs text-gray-500">{holder.sell_tx_count} Sells</div>
              </div>

              {/* PnL */}
              <div className="bg-[#0d0d1a] rounded-lg p-2 text-center">
                <div className={`font-semibold ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  <svg className="w-3 h-3 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span>{totalPnl >= 0 ? '+' : ''}{formatNumber(totalPnl)}</span>
                </div>
                <div className="text-xs text-gray-500">PnL</div>
              </div>
            </div>

            {/* Bottom Stats */}
            <div className="grid grid-cols-2 gap-2">
              {/* Holdings % */}
              <div className="bg-[#0d0d1a] rounded-lg p-2 text-center">
                <div className="flex items-center justify-center gap-1">
                  <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                  <span className="text-white font-semibold">{formatNumber(holder.remaining_usd)}</span>
                </div>
                <div className="text-xs text-gray-500">{holder.balance_percent.toFixed(3)}% Supply</div>
              </div>

              {/* Holder Since */}
              <div className="bg-[#0d0d1a] rounded-lg p-2 text-center">
                <div className="flex items-center justify-center gap-1">
                  <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-white font-semibold">{holderDuration}</span>
                </div>
                <div className="text-xs text-gray-500">Holder Since</div>
              </div>
            </div>

            {/* Action Icons */}
            <div className="flex items-center justify-center gap-4 mt-3 pt-2 border-t border-gray-700">
              <button
                className="text-gray-500 hover:text-white transition-colors"
                title="View on Explorer"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`https://solscan.io/account/${holder.address}`, '_blank');
                }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
              <button
                className="text-gray-500 hover:text-white transition-colors"
                title="Filter by wallet"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PnL Panel Dialog */}
      <WalletPnlPanel
        holder={holder}
        tokenSymbol={tokenSymbol}
        open={isPnlPanelOpen}
        onOpenChange={setIsPnlPanelOpen}
      />
    </div>
  );
};
