import React from "react";
import { ChatResponseDto } from "@/types/dto";
import { TokenBriefCard } from "./cards/TokenBriefCard";
import { PortfolioSummaryCard } from "./cards/PortfolioSummaryCard";
import { NavigationCard } from "./cards/NavigationCard";
import { TradeIntentCard } from "./TradeIntentCard";

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
    priceImpactPct?: number | null;
    priceImpactSeverity?: "safe" | "warning" | "danger" | "critical";
    slippageBps?: number;
};

export const ResponseRenderer: React.FC<{ response: ResponseRenderable }> = ({ response }) => {
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
            return <TradeIntentCard data={response.data as TradeIntentData} />;

        default:
            // Unrecognized types (e.g. portfolio_activities, portfolio_performance) —
            // render the LLM text content if available, otherwise render nothing.
            return response.content ? <p>{response.content}</p> : null;
    }
};

export default ResponseRenderer;
