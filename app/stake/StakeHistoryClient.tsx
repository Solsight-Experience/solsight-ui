"use client";

import { StakeHistory } from "@/features/staking/components";
import { useStakingWallet } from "@/features/staking/hooks/useStakingWallet";

export function StakeHistoryClient() {
    const { publicKey } = useStakingWallet();

    return <StakeHistory walletPubkey={publicKey} />;
}
