'use client';

import { useQuery } from '@tanstack/react-query';
import { useConnection } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import { HELIUS_VALIDATOR_VOTE_ACCOUNT } from '../constants/validators';

export type StakeAccountState = 'activating' | 'active' | 'deactivating' | 'inactive';

export interface StakeAccountInfo {
  pubkey: string;
  stakeLamports: number;
  state: StakeAccountState;
  validatorVoteAccount: string | null;
}

const MAX_EPOCH = '18446744073709551615';

function parseStakeState(
  activationEpoch: string,
  deactivationEpoch: string
): StakeAccountState {
  if (activationEpoch === MAX_EPOCH) return 'inactive';
  if (deactivationEpoch !== MAX_EPOCH) return 'deactivating';
  return 'active';
}

async function fetchHeliusStakeAccounts(
  connection: Connection,
  walletAddress: string
): Promise<StakeAccountInfo[]> {
  const response = await fetch(connection.rpcEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getProgramAccounts',
      params: [
        'Stake11111111111111111111111111111111111111',
        {
          encoding: 'jsonParsed',
          filters: [
            {
              memcmp: {
                offset: 44,
                bytes: walletAddress,
                encoding: 'base58',
              },
            },
          ],
        },
      ],
    }),
  });

  const json = await response.json();
  const rawAccounts: any[] = json.result ?? [];

  return rawAccounts
    .filter(
      (acc) =>
        acc.account?.data?.parsed?.info?.stake?.delegation?.voter === HELIUS_VALIDATOR_VOTE_ACCOUNT
    )
    .map((acc) => {
      try {
        const info = acc.account.data.parsed.info;
        const delegation = info?.stake?.delegation;
        if (!delegation) return null;

        const stakeLamports = Number(delegation.stake ?? 0);
        const state = parseStakeState(
          String(delegation.activationEpoch),
          String(delegation.deactivationEpoch)
        );

        return {
          pubkey: acc.pubkey.toString(),
          stakeLamports,
          state,
          validatorVoteAccount: delegation.voter ?? null,
        } satisfies StakeAccountInfo;
      } catch {
        return null;
      }
    })
    .filter((a: StakeAccountInfo | null): a is StakeAccountInfo => a !== null);
}

export function useStakeAccounts(walletAddress?: string) {
  const { connection } = useConnection();
  const query = useQuery({
    queryKey: ['staking', 'helius-accounts', walletAddress],
    queryFn: () => fetchHeliusStakeAccounts(connection, walletAddress!),
    enabled: !!walletAddress,
    staleTime: 30_000,
  });

  const accounts = query.data ?? [];
  const totalStakedLamports = accounts.reduce((sum, a) => sum + a.stakeLamports, 0);

  return {
    accounts,
    totalStakedLamports,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
