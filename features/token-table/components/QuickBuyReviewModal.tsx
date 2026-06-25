"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumbericInput } from "@/components/ui/NumbericInput";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { COMMON_TOKENS } from "@/lib/constants";
import { DecimalFormatter } from "@/lib/number-formatters";
import { useWallet } from "@/features/wallets/hooks/useWallet";
import { tokenApi } from "@/features/token/services/token.services";
import type { TokenTableData } from "../config/types";
import { executeJupiterSwap, fetchJupiterQuote, formatDisplay, formatFromBaseUnits, isValidAmount, parseInputNumber, toBaseUnits } from "@/features/swap";
import type { VersionedTransaction } from "@solana/web3.js";

interface QuickBuyReviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    token: TokenTableData | null;
    amountSol: string;
}

type PhantomProvider = {
    isPhantom?: boolean;
    signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>;
};

const QUICK_BUY_SLIPPAGE_FORMATTER = new DecimalFormatter({ locale: "en-US", maximumFractionDigits: 0 });

export function QuickBuyReviewModal({ open, onOpenChange, token, amountSol }: QuickBuyReviewModalProps) {
    const { connectWallet, isConnecting, connected, publicKey } = useWallet();
    const [slippageBps, setSlippageBps] = useState(50);
    const [debouncedSlippageBps, setDebouncedSlippageBps] = useState(50);
    const [decimals, setDecimals] = useState(9);
    const [quoteLoading, setQuoteLoading] = useState(false);
    const [quoteError, setQuoteError] = useState<string | null>(null);
    const [swapLoading, setSwapLoading] = useState(false);
    const [swapError, setSwapError] = useState<string | null>(null);
    const [signature, setSignature] = useState<string | null>(null);
    const [quote, setQuote] = useState<Awaited<ReturnType<typeof fetchJupiterQuote>> | null>(null);
    const quoteRequestIdRef = useRef(0);

    useEffect(() => {
        if (!open) {
            setDebouncedSlippageBps(slippageBps);
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setDebouncedSlippageBps(slippageBps);
        }, 250);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [open, slippageBps]);

    useEffect(() => {
        if (!open || !token) return;

        let mounted = true;
        tokenApi
            .getTokenDetail(token.id)
            .then((detail) => {
                if (!mounted) return;
                setDecimals(detail.decimals ?? 9);
            })
            .catch(() => {
                if (!mounted) return;
                setDecimals(9);
            });

        return () => {
            mounted = false;
        };
    }, [open, token]);

    useEffect(() => {
        if (!open || !token) return;

        if (!isValidAmount(amountSol)) {
            setQuote(null);
            setQuoteError("Invalid amount.");
            return;
        }

        const amountBaseUnits = toBaseUnits(amountSol, COMMON_TOKENS.SOL.decimals);
        if (!amountBaseUnits) {
            setQuote(null);
            setQuoteError("Invalid amount.");
            return;
        }

        const controller = new AbortController();
        const requestId = quoteRequestIdRef.current + 1;
        quoteRequestIdRef.current = requestId;

        setQuoteLoading(true);
        setQuoteError(null);
        setSwapError(null);
        setSignature(null);

        fetchJupiterQuote(
            {
                inputMint: COMMON_TOKENS.SOL.mint,
                outputMint: token.id,
                amount: amountBaseUnits,
                swapMode: "ExactIn",
                slippageBps: debouncedSlippageBps
            },
            {
                signal: controller.signal,
                payTokenSymbol: "SOL",
                receiveTokenSymbol: token.token.ticker
            }
        )
            .then((result) => {
                if (quoteRequestIdRef.current !== requestId) return;
                setQuote(result);
            })
            .catch((error) => {
                if ((error as Error).name === "AbortError") return;
                if (quoteRequestIdRef.current !== requestId) return;
                setQuote(null);
                setQuoteError(error instanceof Error ? error.message : "Quote failed.");
            })
            .finally(() => {
                if (quoteRequestIdRef.current !== requestId) return;
                setQuoteLoading(false);
            });

        return () => {
            controller.abort();
        };
    }, [open, token, amountSol, debouncedSlippageBps]);

    const receiveAmount = useMemo(() => {
        if (!quote?.outAmount) return "--";
        return formatDisplay(formatFromBaseUnits(quote.outAmount, decimals), decimals);
    }, [quote?.outAmount, decimals]);

    const minReceived = useMemo(() => {
        if (!quote?.otherAmountThreshold) return "--";
        return formatDisplay(formatFromBaseUnits(quote.otherAmountThreshold, decimals), decimals);
    }, [quote?.otherAmountThreshold, decimals]);

    const showInitialQuoteLoading = quoteLoading && !quote;
    const statusMessage = quoteError
        ? quoteError
        : swapError
          ? swapError
          : signature
            ? `Swap submitted: ${signature.slice(0, 4)}...${signature.slice(-4)}`
            : showInitialQuoteLoading
              ? "Fetching quote..."
              : null;
    const statusClassName = quoteError || swapError ? "text-red-500" : signature ? "text-green-500" : "text-muted-foreground";
    const canConfirm = !!quote?.rawQuote && !quoteLoading && !swapLoading && !quoteError && parseInputNumber(amountSol) > 0;

    const handleConfirm = async () => {
        if (!quote?.rawQuote || !token) return;

        const provider = (window as Window & { solana?: PhantomProvider }).solana;
        if (!provider?.isPhantom) {
            toast.error("Phantom wallet not found.");
            return;
        }

        if (!connected || !publicKey) {
            if (isConnecting) return;
            connectWallet();
            toast.info("Please connect your wallet.");
            return;
        }

        setSwapLoading(true);
        setSwapError(null);

        try {
            const result = await executeJupiterSwap({
                quoteResponse: quote.rawQuote,
                userPublicKey: publicKey,
                signTransaction: (tx) => provider.signTransaction(tx)
            });
            setSignature(result.signature);
            toast.success("Swap submitted!");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Swap failed.";
            setSwapError(message);
            toast.error(message);
        } finally {
            setSwapLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Quick Buy Review</DialogTitle>
                    <DialogDescription>Review quote and confirm swap.</DialogDescription>
                </DialogHeader>

                {token ? (
                    <div className="space-y-4 text-sm">
                        <div className="rounded-lg border border-border p-3">
                            <div className="text-muted-foreground mb-2">Token</div>
                            <div className="flex items-center gap-2">
                                <Image
                                    src={token.token.iconUrl || "/icons/sol.png"}
                                    alt={token.token.ticker}
                                    width={20}
                                    height={20}
                                    className="h-5 w-5 rounded-full"
                                    unoptimized
                                />
                                <span className="font-semibold">{token.token.ticker}</span>
                                <span className="text-muted-foreground">{token.token.name}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-lg border border-border p-3">
                                <div className="text-muted-foreground">Pay</div>
                                <div className="font-semibold">{amountSol || "0"} SOL</div>
                            </div>
                            <div className="rounded-lg border border-border p-3">
                                <div className="text-muted-foreground">Estimated Receive</div>
                                <div className="font-semibold">
                                    {receiveAmount} {token.token.ticker}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 rounded-lg border border-border p-3">
                            <div className="flex items-center justify-between">
                                <span>Minimum Received</span>
                                <span>
                                    {minReceived} {token.token.ticker}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Price Impact</span>
                                <span>{quote?.priceImpactPct == null ? "--" : `${(quote.priceImpactPct * 100).toFixed(2)}%`}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Route</span>
                                <span>{quote?.routeLabel ?? "--"}</span>
                            </div>
                            <div
                                className={`text-xs text-muted-foreground truncate transition-none ${!(quote?.routeDetails && quote.routeDetails.length > 0) ? "invisible" : ""}`}
                            >
                                {quote?.routeDetails?.join(" -> ") ?? "\u00A0"}
                            </div>
                        </div>

                        <div className="rounded-lg border border-border p-3">
                            <Label htmlFor="quick-buy-slippage" className="text-xs text-muted-foreground">
                                Slippage (bps)
                            </Label>
                            <NumbericInput
                                id="quick-buy-slippage"
                                formatter={QUICK_BUY_SLIPPAGE_FORMATTER}
                                min={1}
                                max={10000}
                                step={10}
                                showStepper
                                value={slippageBps}
                                onChange={(value) => setSlippageBps(value ?? 0)}
                            />
                        </div>

                        <div className="min-h-[1.25rem]">
                            <p className={`text-xs truncate ${statusClassName}`}>{statusMessage ?? "\u00A0"}</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-muted-foreground">No token selected.</div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                    <Button onClick={handleConfirm} disabled={!canConfirm}>
                        {swapLoading ? (
                            <span className="inline-flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Swapping...
                            </span>
                        ) : (
                            "Confirm Buy"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
