'use client';

import { useState, useCallback } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import {
  LAMPORTS_PER_SOL,
  StakeProgram,
  Authorized,
  Keypair,
  PublicKey,
} from '@solana/web3.js';
import { toast } from 'sonner';
import { HELIUS_VALIDATOR_VOTE_ACCOUNT, MINIMUM_STAKE_SOL } from '../constants/validators';

export type StakeStatus = 'idle' | 'creating' | 'signing' | 'confirming' | 'done' | 'error';

interface StakeState {
  status: StakeStatus;
  signature: string | null;
  stakeAccountPubkey: string | null;
  error: string | null;
}

const INIT_STATE: StakeState = {
  status: 'idle',
  signature: null,
  stakeAccountPubkey: null,
  error: null,
};

function getPhantomProvider() {
  const provider = (window as any).phantom?.solana ?? (window as any).solana;
  if (!provider?.isPhantom) {
    throw new Error('Phantom wallet not found. Please install it first.');
  }
  return provider;
}

export function useStaking() {
  const { connection } = useConnection();
  const [stakeState, setStakeState] = useState<StakeState>(INIT_STATE);
  const [unstakeState, setUnstakeState] = useState<StakeState>(INIT_STATE);

  // ─── Stake: SOL → Helius validator (native staking) ──────────────────────
  const handleStake = useCallback(
    async (amountSol: number, walletPubkeyStr: string) => {
      setStakeState(INIT_STATE);

      let provider: any;
      try {
        provider = getPhantomProvider();
      } catch (e) {
        toast.error((e as Error).message);
        return;
      }
      if (!walletPubkeyStr) {
        toast.error('Connect your wallet first.');
        return;
      }
      if (amountSol < MINIMUM_STAKE_SOL) {
        toast.error(`Minimum stake is ${MINIMUM_STAKE_SOL} SOL.`);
        return;
      }

      try {
        setStakeState({ ...INIT_STATE, status: 'creating' });

        const ownerPubkey = new PublicKey(walletPubkeyStr);
        const stakeKeypair = Keypair.generate();

        const rent = await connection.getMinimumBalanceForRentExemption(StakeProgram.space);
        const lamports = rent + Math.round(amountSol * LAMPORTS_PER_SOL);

        // Build: createAccount (system) + initializeStakeAccount + delegate
        const transaction = StakeProgram.createAccount({
          fromPubkey: ownerPubkey,
          stakePubkey: stakeKeypair.publicKey,
          authorized: new Authorized(ownerPubkey, ownerPubkey),
          lamports,
        });
        transaction.add(
          StakeProgram.delegate({
            stakePubkey: stakeKeypair.publicKey,
            authorizedPubkey: ownerPubkey,
            votePubkey: new PublicKey(HELIUS_VALIDATOR_VOTE_ACCOUNT),
          })
        );

        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = ownerPubkey;

        // Stake account keypair must co-sign as the newly created account
        transaction.partialSign(stakeKeypair);

        // Phantom signs as fee-payer
        setStakeState((s) => ({ ...s, status: 'signing' }));
        const signedTx = await provider.signTransaction(transaction);

        // Broadcast via our Helius RPC
        setStakeState((s) => ({ ...s, status: 'confirming' }));
        const signature = await connection.sendRawTransaction(signedTx.serialize(), {
          skipPreflight: false,
          maxRetries: 3,
        });

        await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed');

        const stakeAccountPubkey = stakeKeypair.publicKey.toBase58();
        setStakeState({ status: 'done', signature, stakeAccountPubkey, error: null });

        toast.success(`Staked ${amountSol} SOL with Helius! Active next epoch (~2 days).`, {
          duration: 8000,
          action: {
            label: 'Solscan',
            onClick: () => window.open(`https://solscan.io/tx/${signature}`, '_blank'),
          },
        });

        recordStakeTransaction({
          walletAddress: walletPubkeyStr,
          stakeAccountAddress: stakeAccountPubkey,
          amountSol,
          validatorVoteAccount: HELIUS_VALIDATOR_VOTE_ACCOUNT,
          signature,
          type: 'stake',
        }).catch(() => {});
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Staking failed';
        const isRejected =
          msg.toLowerCase().includes('rejected') ||
          msg.toLowerCase().includes('user rejected') ||
          msg.toLowerCase().includes('cancelled');
        setStakeState({
          status: 'error',
          signature: null,
          stakeAccountPubkey: null,
          error: isRejected ? null : msg,
        });
        if (isRejected) toast.info('Transaction cancelled.');
        else toast.error(msg);
      }
    },
    [connection]
  );

  // ─── Unstake: deactivate a Helius stake account ───────────────────────────
  const handleUnstake = useCallback(
    async (stakeAccountPubkeyStr: string, walletPubkeyStr: string) => {
      setUnstakeState(INIT_STATE);

      let provider: any;
      try {
        provider = getPhantomProvider();
      } catch (e) {
        toast.error((e as Error).message);
        return;
      }
      if (!walletPubkeyStr) {
        toast.error('Connect your wallet first.');
        return;
      }

      try {
        setUnstakeState({ ...INIT_STATE, status: 'creating' });

        const ownerPubkey = new PublicKey(walletPubkeyStr);
        const stakePubkey = new PublicKey(stakeAccountPubkeyStr);

        const transaction = StakeProgram.deactivate({
          stakePubkey,
          authorizedPubkey: ownerPubkey,
        });

        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = ownerPubkey;

        // Phantom signs
        setUnstakeState((s) => ({ ...s, status: 'signing' }));
        const signedTx = await provider.signTransaction(transaction);

        // Broadcast
        setUnstakeState((s) => ({ ...s, status: 'confirming' }));
        const signature = await connection.sendRawTransaction(signedTx.serialize(), {
          skipPreflight: false,
          maxRetries: 3,
        });

        await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed');

        setUnstakeState({
          status: 'done',
          signature,
          stakeAccountPubkey: stakeAccountPubkeyStr,
          error: null,
        });

        toast.success('Deactivation started. SOL withdrawable after ~2 epochs (~2-4 days).', {
          duration: 8000,
          action: {
            label: 'Solscan',
            onClick: () => window.open(`https://solscan.io/tx/${signature}`, '_blank'),
          },
        });

        recordStakeTransaction({
          walletAddress: walletPubkeyStr,
          stakeAccountAddress: stakeAccountPubkeyStr,
          amountSol: 0,
          validatorVoteAccount: HELIUS_VALIDATOR_VOTE_ACCOUNT,
          signature,
          type: 'unstake',
        }).catch(() => {});
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unstake failed';
        const isRejected =
          msg.toLowerCase().includes('rejected') || msg.toLowerCase().includes('cancelled');
        setUnstakeState({
          status: 'error',
          signature: null,
          stakeAccountPubkey: null,
          error: isRejected ? null : msg,
        });
        if (isRejected) toast.info('Transaction cancelled.');
        else toast.error(msg);
      }
    },
    [connection]
  );

  return { stakeState, unstakeState, handleStake, handleUnstake };
}

// ─── Backend record helper ────────────────────────────────────────────────────
async function recordStakeTransaction(payload: {
  walletAddress: string;
  stakeAccountAddress: string;
  amountSol: number;
  validatorVoteAccount: string;
  signature: string;
  type: 'stake' | 'unstake';
}) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  await fetch(`${apiBase}/staking/record`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
}
