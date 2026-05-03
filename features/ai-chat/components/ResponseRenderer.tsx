"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChatResponseDto } from "@/types/dto";
import { TokenBriefCard } from "./cards/TokenBriefCard";
import { PortfolioSummaryCard } from "./cards/PortfolioSummaryCard";
import { NavigationCard } from "./cards/NavigationCard";
import { useTokenUIStore } from "@/features/token/stores/token.stores";

export type ResponseRenderable = Pick<ChatResponseDto, "type" | "content" | "data">;

type TokenBriefData = Parameters<typeof TokenBriefCard>[0]["data"];
type PortfolioSummaryData = Parameters<typeof PortfolioSummaryCard>[0]["data"];
type NavigationData = Parameters<typeof NavigationCard>[0]["data"];

type TradeIntentData = {
    inputMint: string;
    outputMint: string;
    amount: string;
    mode?: "buy" | "sell";
    targetMint?: string;
    timestamp?: number;
};

const IS_RECENT_THRESHOLD = 3000;
const TradeAutoAction: React.FC<{ data: TradeIntentData }> = ({ data }) => {
    const router = useRouter();

    useEffect(() => {
        const targetMint = data.targetMint || data.outputMint;
        if (!targetMint) return;

        const isRecent = data.timestamp && Date.now() - data.timestamp < IS_RECENT_THRESHOLD;
        if (!isRecent) return;

        useTokenUIStore.getState().setPendingTradeAction({
            mint: targetMint,
            amount: String(data.amount ?? ""),
            mode: data.mode || "buy"
        });

        router.push(`/token/${targetMint}`);
    }, [data.outputMint, data.targetMint, data.amount, data.mode, data.timestamp, router]);

    return (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-violet-500/25 bg-violet-500/5 text-sm text-violet-300 animate-pulse">
            <span className="text-base">⚡</span>
            <span>Taking you to the swap page…</span>
        </div>
    );
};

export const ResponseRenderer: React.FC<{ response: ResponseRenderable; timestamp?: number }> = ({ response, timestamp }) => {
    switch (response.type) {
        case "text":
            return <p>{response.content}</p>;
        case "token_brief":
            return <TokenBriefCard data={response.data as TokenBriefData} />;
        case "portfolio_summary":
            return <PortfolioSummaryCard data={response.data as PortfolioSummaryData} />;
        case "navigation":
            return <NavigationCard data={response.data as NavigationData} />;
        case "trade_intent":
            return <TradeAutoAction data={{ ...(response.data as TradeIntentData), timestamp }} />;
        default:
            return <p>Unknown response type</p>;
    }
};

export default ResponseRenderer;
