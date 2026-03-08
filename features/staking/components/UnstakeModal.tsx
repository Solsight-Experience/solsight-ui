'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Info, Clock } from 'lucide-react';
import { useStaking, StakeStatus } from '../hooks/useStaking';
import { StakeAccountInfo, StakeAccountState } from '../hooks/useStakeAccounts';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

interface UnstakeModalProps {
  open: boolean;
  onClose: () => void;
  walletPubkey: string | null;
  stakeAccounts: StakeAccountInfo[];
}

const STATUS_LABELS: Record<StakeStatus, string> = {
  idle: 'Deactivate Stake',
  creating: 'Building transaction...',
  signing: 'Waiting for Phantom...',
  confirming: 'Confirming on-chain...',
  done: 'Deactivated!',
  error: 'Deactivate Stake',
};

const STATE_BADGE: Record<StakeAccountState, { label: string; dot: string; text: string; bg: string; border: string }> = {
  active:       { label: 'Active',       dot: 'bg-green-400',  text: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/25' },
  activating:   { label: 'Warming up',   dot: 'bg-yellow-400', text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/25' },
  deactivating: { label: 'Cooling down', dot: 'bg-orange-400', text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/25' },
  inactive:     { label: 'Inactive',     dot: 'bg-gray-500',   text: 'text-gray-400',   bg: 'bg-gray-500/10',   border: 'border-gray-500/25'  },
};

function shortenPubkey(pk: string) {
  return pk.slice(0, 5) + '…' + pk.slice(-5);
}

export function UnstakeModal({ open, onClose, walletPubkey, stakeAccounts }: UnstakeModalProps) {
  const [selectedAccount, setSelectedAccount] = useState<StakeAccountInfo | null>(null);
  const { unstakeState, handleUnstake } = useStaking();

  useEffect(() => {
    if (open && stakeAccounts.length > 0) setSelectedAccount(stakeAccounts[0]);
  }, [open, stakeAccounts]);

  const loading =
    unstakeState.status !== 'idle' &&
    unstakeState.status !== 'done' &&
    unstakeState.status !== 'error';

  const handleSubmit = async () => {
    if (!selectedAccount || !walletPubkey) return;
    await handleUnstake(selectedAccount.pubkey, walletPubkey);
  };

  const canSubmit = !!selectedAccount && !!walletPubkey && !loading &&
    selectedAccount.state !== 'deactivating' && selectedAccount.state !== 'inactive';

  return (
    <Dialog open={open} onOpenChange={() => { if (!loading) onClose(); }}>
      <DialogContent
        className="sm:max-w-md border-0 text-white p-0 overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #110d20 0%, #080612 100%)', boxShadow: '0 25px 60px rgba(249,115,22,0.15)' }}
      >
        {/* Header gradient bar */}
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #f97316, #f59e0b, #f97316)', backgroundSize: '200% 100%', animation: 'shimmer-border 3s linear infinite' }} />

        <div className="p-6 space-y-5">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold tracking-tight">
              <span style={{ background: 'linear-gradient(135deg, #fff 40%, #fdba74)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Unstake SOL
              </span>
            </DialogTitle>
          </DialogHeader>

          {stakeAccounts.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <span className="text-4xl">🔍</span>
              <p className="text-gray-400 text-[13px]">No active Helius stake accounts found.</p>
            </div>
          ) : (
            <>
              {/* Stake account selector */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2.5">Select Stake Account</p>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
                  {stakeAccounts.map((acc) => {
                    const badge = STATE_BADGE[acc.state];
                    const selected = selectedAccount?.pubkey === acc.pubkey;
                    return (
                      <button
                        key={acc.pubkey}
                        onClick={() => setSelectedAccount(acc)}
                        disabled={loading}
                        className={`w-full flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all duration-150 ${
                          selected
                            ? 'border-orange-500/50 bg-orange-500/8'
                            : 'border-white/8 bg-white/3 hover:border-white/15'
                        }`}
                      >
                        {/* Radio dot */}
                        <div className={`h-4 w-4 rounded-full border-2 flex-shrink-0 transition-all ${selected ? 'border-orange-400 bg-orange-400' : 'border-white/20'}`} />

                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-mono font-semibold text-white">{shortenPubkey(acc.pubkey)}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {(acc.stakeLamports / LAMPORTS_PER_SOL).toFixed(4)} SOL
                          </p>
                        </div>

                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${badge.text} ${badge.bg} ${badge.border}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                          {badge.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Info */}
              <div className="flex gap-2.5 rounded-2xl border border-yellow-500/20 bg-yellow-500/6 px-3.5 py-3 text-[12px] text-yellow-300">
                <Clock className="h-4 w-4 flex-shrink-0 mt-0.5 text-yellow-400" />
                <span className="leading-relaxed">
                  Deactivating starts a ~2-epoch cool-down (~2–4 days).
                  After that, SOL can be withdrawn to your wallet.
                </span>
              </div>
            </>
          )}

          {unstakeState.error && (
            <p className="text-[12px] text-red-400 rounded-xl bg-red-400/8 px-3.5 py-2.5 border border-red-400/20">
              {unstakeState.error}
            </p>
          )}
          {unstakeState.status === 'done' && unstakeState.signature && (
            <p className="text-[12px] text-green-400 rounded-xl bg-green-400/8 px-3.5 py-2.5 border border-green-400/20">
              Deactivation sent!{' '}
              <a href={`https://solscan.io/tx/${unstakeState.signature}`} target="_blank" rel="noopener noreferrer" className="underline font-semibold">
                View on Solscan ↗
              </a>
            </p>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-1">
            <button
              className="flex-1 rounded-2xl border border-white/10 py-3.5 text-[13px] font-semibold text-gray-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-40"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="flex-1 rounded-2xl py-3.5 text-[13px] font-bold text-white tracking-wide transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: canSubmit ? 'linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)' : 'rgba(255,255,255,0.05)',
                boxShadow: canSubmit ? '0 4px 20px rgba(234,88,12,0.25)' : 'none',
              }}
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {loading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {STATUS_LABELS[unstakeState.status]}
                </span>
              ) : (
                STATUS_LABELS[unstakeState.status]
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface UnstakeModalProps {
  open: boolean;
  onClose: () => void;
  walletPubkey: string | null;
  stakeAccounts: StakeAccountInfo[];
}
