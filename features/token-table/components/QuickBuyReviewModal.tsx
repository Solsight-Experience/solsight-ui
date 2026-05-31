"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { COMMON_TOKENS } from "@/lib/constants";
import { useWallet } from "@/features/wallets/hooks/useWallet";
import { useConnection } from "@solana/wallet-adapter-react";
import { tokenApi } from "@/features/token/services/token.services";
import type { TokenTableData } from "../config/types";
import { executeJupiterSwap, fetchJupiterQuote, formatDisplay, formatFromBaseUnits, isValidAmount, parseInputNumber, toBaseUnits } from "@/features/swap";

interface QuickBuyReviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    token: TokenTableData | null;
    amountSol: string;
}

type PhantomProvider = {
    isPhantom?: boolean;
    signTransaction: (tx: unknown) => Promise<{ serialize(): Uint8Array }>;
};

export function QuickBuyReviewModal({ open, onOpenChange, token, amountSol }: QuickBuyReviewModalProps) {
    const { connectWallet, isConnecting, connected, publicKey } = useWallet();
    const { connection } = useConnection();
    const [slippageBps, setSlippageBps] = useState(50);
    const [decimals, setDecimals] = useState(9);
    const [quoteLoading, setQuoteLoading] = useState(false);
    const [quoteError, setQuoteError] = useState<string | null>(null);
    const [swapLoading, setSwapLoading] = useState(false);
    const [swapError, setSwapError] = useState<string | null>(null);
    const [signature, setSignature] = useState<string | null>(null);
    const [quote, setQuote] = useState<Awaited<ReturnType<typeof fetchJupiterQuote>> | null>(null);

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
                slippageBps
            },
            {
                signal: controller.signal,
                payTokenSymbol: "SOL",
                receiveTokenSymbol: token.token.ticker
            }
        )
            .then((result) => {
                setQuote(result);
            })
            .catch((error) => {
                if ((error as Error).name === "AbortError") return;
                setQuote(null);
                setQuoteError(error instanceof Error ? error.message : "Quote failed.");
            })
            .finally(() => {
                setQuoteLoading(false);
            });

        return () => {
            controller.abort();
        };
    }, [open, token, amountSol, slippageBps]);

    const receiveAmount = useMemo(() => {
        if (!quote?.outAmount) return "--";
        return formatDisplay(formatFromBaseUnits(quote.outAmount, decimals), decimals);
    }, [quote?.outAmount, decimals]);

    const minReceived = useMemo(() => {
        if (!quote?.otherAmountThreshold) return "--";
        return formatDisplay(formatFromBaseUnits(quote.otherAmountThreshold, decimals), decimals);
    }, [quote?.otherAmountThreshold, decimals]);

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
                signTransaction: (tx) => provider.signTransaction(tx),
                connection
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
                                <img src={token.token.iconUrl || "/icons/sol.png"} alt={token.token.ticker} className="h-5 w-5 rounded-full" />
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
                            {quote?.routeDetails && quote.routeDetails.length > 0 && (
                                <div className="text-xs text-muted-foreground">{quote.routeDetails.join(" -> ")}</div>
                            )}
                        </div>

                        <div className="rounded-lg border border-border p-3">
                            <Label htmlFor="quick-buy-slippage" className="text-xs text-muted-foreground">
                                Slippage (bps)
                            </Label>
                            <input
                                id="quick-buy-slippage"
                                type="number"
                                min="1"
                                step="1"
                                value={slippageBps}
                                onChange={(e) => setSlippageBps(Number(e.target.value))}
                                className="mt-2 w-full rounded-md border border-border bg-transparent p-2"
                            />
                        </div>

                        {quoteLoading && <div className="text-muted-foreground text-xs">Fetching quote...</div>}
                        {quoteError && <div className="text-red-500 text-xs">{quoteError}</div>}
                        {swapError && <div className="text-red-500 text-xs">{swapError}</div>}
                        {signature && (
                            <div className="text-green-500 text-xs">
                                Swap submitted: {signature.slice(0, 4)}...{signature.slice(-4)}
                            </div>
                        )}
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
