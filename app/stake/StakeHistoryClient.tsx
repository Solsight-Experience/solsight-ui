"use client";

import { StakeHistory } from "@/features/staking/components";
import { useActionableWallet } from "@/features/wallets/hooks/useActionableWallet";

export function StakeHistoryClient() {
    const { actionablePublicKey } = useActionableWallet();

    return <StakeHistory walletPubkey={actionablePublicKey} />;
}
