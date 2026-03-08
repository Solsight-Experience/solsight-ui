import type { Metadata } from 'next';
import { StakingPage } from './StakingPage';

export const metadata: Metadata = {
  title: 'Stake SOL | SolSight',
  description: 'Stake SOL with high-performance validators and earn ~6-7% APY on SolSight.',
};

export default function Page() {
  return <StakingPage />;
}
