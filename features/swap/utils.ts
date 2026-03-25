import { COMMON_TOKENS } from "@/lib/constants";
import type { RouteHopToken } from "./types";

type RouteStep = {
    swapInfo?: {
        inputMint?: string;
        outputMint?: string;
        label?: string;
        ammKey?: string;
        programId?: string;
    };
};

export function isValidAmount(value: string): boolean {
    const trimmed = value.replace(/,/g, "").trim();
    if (!trimmed) return false;
    const numeric = Number(trimmed);
    return Number.isFinite(numeric) && numeric > 0;
}

export function sanitizeInput(value: string, decimals: number): string {
    const cleaned = value.replace(/,/g, "").replace(/[^\d.]/g, "");
    const parts = cleaned.split(".");
    const whole = parts[0] ?? "";
    const fraction = parts[1] ?? "";
    const normalizedWhole = whole.replace(/^0+(?=\d)/, "");
    if (parts.length === 1) {
        return normalizedWhole;
    }
    const clippedFraction = fraction.slice(0, decimals);
    return `${normalizedWhole || "0"}.${clippedFraction}`;
}

export function formatInputValue(value: string, decimals: number): string {
    if (!value) return "";
    const numeric = Number(value.replace(/,/g, ""));
    if (!Number.isFinite(numeric)) return "";
    const maxDecimals = Math.min(decimals, 6);
    const normalized = numeric.toFixed(maxDecimals).replace(/\.?0+$/, "");
    return new Intl.NumberFormat("en-US", {
        maximumFractionDigits: maxDecimals
    }).format(Number(normalized));
}

export function formatDisplay(value: string, decimals: number): string {
    if (!value) return "--";
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return "--";
    const maxDecimals = Math.min(decimals, 6);
    return new Intl.NumberFormat("en-US", {
        maximumFractionDigits: maxDecimals
    }).format(numeric);
}

export function toBaseUnits(value: string, decimals: number): string | null {
    const normalized = value.replace(/,/g, "").trim();
    if (!/^\d*\.?\d*$/.test(normalized)) return null;
    if (normalized === "" || normalized === ".") return null;

    const [whole, fraction = ""] = normalized.split(".");
    const paddedFraction = fraction.padEnd(decimals, "0").slice(0, decimals);
    const combined = `${whole || "0"}${paddedFraction}`;
    const trimmed = combined.replace(/^0+/, "") || "0";
    return trimmed;
}

export function formatFromBaseUnits(value: string, decimals: number): string {
    if (!value) return "";
    const padded = value.padStart(decimals + 1, "0");
    const whole = padded.slice(0, -decimals);
    const fraction = padded.slice(-decimals).replace(/0+$/, "");
    return fraction ? `${whole}.${fraction}` : whole;
}

export function parseInputNumber(value: string): number {
    if (!value) return 0;
    const normalized = value.replace(/,/g, "");
    const numeric = Number(normalized);
    return Number.isFinite(numeric) ? numeric : 0;
}

export function shortenMint(mint: string): string {
    if (mint.length <= 8) return mint;
    return `${mint.slice(0, 4)}...${mint.slice(-4)}`;
}

export function buildRoutePathTokens(
    routePlan: unknown,
    inputMint: string,
    outputMint: string,
    payTokenSymbol: string,
    receiveTokenSymbol: string
): RouteHopToken[] {
    if (!Array.isArray(routePlan) || routePlan.length === 0) return [];

    const tokens: RouteHopToken[] = [];
    for (const step of routePlan) {
        const input = (step as RouteStep)?.swapInfo?.inputMint;
        const output = (step as RouteStep)?.swapInfo?.outputMint;
        if (typeof input === "string") {
            tokens.push(mapMintToToken(input, inputMint, outputMint, payTokenSymbol, receiveTokenSymbol));
        }
        if (typeof output === "string") {
            tokens.push(mapMintToToken(output, inputMint, outputMint, payTokenSymbol, receiveTokenSymbol));
        }
    }

    return tokens.filter((item, idx) => item.display !== tokens[idx - 1]?.display);
}

export function getRouteDetails(routePlan: unknown): string[] {
    if (!Array.isArray(routePlan)) return [];

    const details = routePlan
        .map((item) => (item as RouteStep)?.swapInfo?.label || (item as RouteStep)?.swapInfo?.ammKey || (item as RouteStep)?.swapInfo?.programId)
        .filter((label: unknown): label is string => typeof label === "string" && label.trim().length > 0)
        .map((label) => label.trim());

    return [...new Set(details)];
}

function mapMintToToken(mint: string, inputMint: string, outputMint: string, payTokenSymbol: string, receiveTokenSymbol: string): RouteHopToken {
    if (mint === inputMint) return { display: payTokenSymbol, full: mint };
    if (mint === outputMint) return { display: receiveTokenSymbol, full: mint };
    if (mint === COMMON_TOKENS.SOL.mint) return { display: "SOL", full: mint };
    return { display: shortenMint(mint), full: mint };
}
