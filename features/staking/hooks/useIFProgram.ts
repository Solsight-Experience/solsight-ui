"use client";

import { useEffect, useState } from "react";
import { Connection } from "@solana/web3.js";
import { IF_CONFIG } from "../constants/program";

let stakingConnection: Connection | null = null;

export function getStakingConnection(): Connection {
    if (stakingConnection) return stakingConnection;

    stakingConnection = new Connection(IF_CONFIG.rpcUrl, "confirmed");
    return stakingConnection;
}

export interface IFProgramState {
    program: null;
    isReady: boolean;
    isLoading: boolean;
    error: string | null;
}

export function useIFProgram(connected: boolean, walletPubkey: string | null): IFProgramState {
    void walletPubkey;

    const [isReady, setIsReady] = useState(connected);

    useEffect(() => {
        setIsReady(connected && IF_CONFIG.isEnabled);
    }, [connected]);

    return {
        program: null,
        isReady,
        isLoading: false,
        error: IF_CONFIG.isEnabled ? null : (IF_CONFIG.unavailableReason ?? null)
    };
}
