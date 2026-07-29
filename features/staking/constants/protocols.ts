export type StakingProtocolId = "jito" | "blaze";

export interface StakingProtocolMeta {
    id: StakingProtocolId;
    label: string;
    lstSymbol: string;
    docsUrl: string;
}

export const STAKING_PROTOCOLS: StakingProtocolMeta[] = [
    {
        id: "jito",
        label: "Jito",
        lstSymbol: "jitoSOL",
        docsUrl: "https://www.jito.network/docs/jitosol/jitosol-liquid-staking/liquid-staking-basics/"
    },
    {
        id: "blaze",
        label: "Blaze",
        lstSymbol: "bSOL",
        docsUrl: "https://stake-docs.solblaze.org/"
    }
];

export const DEFAULT_STAKING_PROTOCOL: StakingProtocolId = "jito";

export function getStakingProtocolMeta(id: StakingProtocolId): StakingProtocolMeta {
    return STAKING_PROTOCOLS.find((protocol) => protocol.id === id) ?? STAKING_PROTOCOLS[0];
}
