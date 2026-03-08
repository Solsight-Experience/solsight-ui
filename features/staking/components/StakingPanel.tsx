'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TrendingUp, Zap, Wallet } from 'lucide-react';
import { useWallet, useWalletBalance } from '@/features/wallets/hooks/useWallet';
import { StakeModal } from './StakeModal';
import { UnstakeModal } from './UnstakeModal';
import { useStakeAccounts } from '../hooks/useStakeAccounts';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

type StakeTab = 'solana' | 'usdc';

export function StakingPanel() {
  const { connected, publicKey, connectWallet, isConnecting } = useWallet();
  const { data: balanceData } = useWalletBalance(publicKey ?? undefined);

  const [activeTab, setActiveTab] = useState<StakeTab>('solana');
  const [stakeOpen, setStakeOpen] = useState(false);
  const [unstakeOpen, setUnstakeOpen] = useState(false);

  const solBalance = balanceData ?? 0;

  const { accounts: stakeAccounts, totalStakedLamports, isLoading: stakesLoading } =
    useStakeAccounts(connected ? (publicKey ?? undefined) : undefined);

  const stakedSol = totalStakedLamports / LAMPORTS_PER_SOL;

  return (
    <div className="w-full">

      {/* ── Tabs ──────────────────────────────────────────────── */}
      <div className="flex rounded-2xl bg-white/5 border border-white/8 p-1 mb-4 backdrop-blur-sm">
        {(['solana', 'usdc'] as StakeTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold tracking-wide transition-all duration-200 ${
              activeTab === tab
                ? 'bg-gradient-to-r from-purple-600/80 to-blue-600/80 text-white shadow-lg shadow-purple-500/20'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab === 'solana' ? '◎ Solana' : '$ USDC'}
          </button>
        ))}
      </div>

      {/* ── SOL card ──────────────────────────────────────────── */}
      {activeTab === 'solana' ? (
        <div
          className="rounded-3xl border border-white/10 p-6 space-y-5 backdrop-blur-md"
          style={{ background: 'linear-gradient(145deg, rgba(20,10,40,0.95) 0%, rgba(10,8,30,0.98) 100%)' }}
        >
          {/* Header row */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
                alt="SOL"
                className="w-14 h-14 rounded-full ring-2 ring-purple-500/40 shadow-lg shadow-purple-500/20"
              />
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 ring-2 ring-[#0a0818] text-[9px] font-bold text-white">✓</span>
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <h2 className="text-2xl font-extrabold text-white tracking-tight">Solana</h2>
                <span className="text-base font-bold text-gray-500">SOL</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <TrendingUp className="h-3.5 w-3.5 text-green-400" />
                <span className="text-green-400 font-bold text-sm">~6–7% APY</span>
                <span className="text-gray-600 text-xs">· 0% commission</span>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-1 text-[11px] font-semibold text-green-400">
                <Zap className="h-3 w-3" />
                Live
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Balances */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-purple-400/70 mb-1">Staked</p>
              <p className="text-xl font-extrabold text-white leading-none">
                {stakesLoading ? (
                  <span className="inline-block h-6 w-20 animate-pulse rounded-lg bg-white/10" />
                ) : (
                  <>{stakedSol.toFixed(4)}</>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stakeAccounts.length} account{stakeAccounts.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-400/70 mb-1">Available</p>
              <p className="text-xl font-extrabold text-white leading-none">
                {solBalance.toFixed(4)}
              </p>
              <p className="text-xs text-gray-500 mt-1">SOL in wallet</p>
            </div>
          </div>

          {/* Earn banner */}
          <div className="flex gap-3 rounded-2xl border border-indigo-500/25 bg-gradient-to-r from-indigo-500/8 to-purple-500/8 p-4">
            <TrendingUp className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-bold text-white">Earn native staking yield</p>
              <p className="text-[12px] text-gray-400 mt-0.5 leading-relaxed">
                Delegated to the <strong className="text-indigo-300">Helius validator</strong> at 0% commission.
                Rewards auto-compound every epoch.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          {!connected ? (
            <button
              className="w-full rounded-2xl py-4 text-[15px] font-bold text-white tracking-wide transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)', boxShadow: '0 4px 24px rgba(139,92,246,0.35)' }}
              onClick={() => connectWallet()}
              disabled={isConnecting}
            >
              <Wallet className="inline h-4 w-4 mr-2 -mt-0.5" />
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                className="flex-1 rounded-2xl border border-white/15 py-3.5 text-[14px] font-semibold text-gray-300 backdrop-blur-sm transition-all duration-200 hover:border-orange-500/50 hover:text-orange-300 disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
                onClick={() => setUnstakeOpen(true)}
                disabled={stakeAccounts.length === 0}
              >
                Unstake
              </button>
              <button
                className="flex-1 rounded-2xl py-3.5 text-[14px] font-bold text-white tracking-wide transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)', boxShadow: '0 4px 20px rgba(139,92,246,0.30)' }}
                onClick={() => setStakeOpen(true)}
              >
                Stake SOL
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          className="rounded-3xl border border-white/10 p-10 flex flex-col items-center justify-center gap-3 min-h-48 text-center backdrop-blur-md"
          style={{ background: 'linear-gradient(145deg, rgba(20,10,40,0.95) 0%, rgba(10,8,30,0.98) 100%)' }}
        >
          <span className="text-3xl">🚧</span>
          <p className="text-white font-semibold">USDC Staking</p>
          <p className="text-gray-500 text-xs">Coming soon</p>
        </div>
      )}

      <StakeModal
        open={stakeOpen}
        onClose={() => setStakeOpen(false)}
        walletPubkey={publicKey}
        solBalance={solBalance}
      />
      <UnstakeModal
        open={unstakeOpen}
        onClose={() => setUnstakeOpen(false)}
        walletPubkey={publicKey}
        stakeAccounts={stakeAccounts}
      />
    </div>
  );
}
