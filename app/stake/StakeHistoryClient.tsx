"use client";

import { StakeHistory } from "@/features/staking/components";
import { useLinkedWallet } from "@/features/wallets/hooks/useLinkedWallet";

export function StakeHistoryClient() {
    const { actionablePublicKey } = useLinkedWallet();

    return <StakeHistory walletPubkey={actionablePublicKey} />;
}
