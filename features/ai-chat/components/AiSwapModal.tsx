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
import { executeJupiterSwap, fetchJupiterQuote, formatDisplay, formatFromBaseUnits, isValidAmount, parseInputNumber, toBaseUnits } from "@/features/swap";
import type { VersionedTransaction } from "@solana/web3.js";

interface AiSwapModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    inputMint: string;
    outputMint: string;
    amount: string;
    slippageBps?: number;
}

type TokenMeta = {
    symbol: string;
    name: string;
    decimals: number;
    logoUri: string;
};

type PhantomProvider = {
    isPhantom?: boolean;
    signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>;
};

const AI_SWAP_SLIPPAGE_FORMATTER = new DecimalFormatter({ locale: "en-US", maximumFractionDigits: 0 });

export function AiSwapModal({ open, onOpenChange, inputMint, outputMint, amount, slippageBps: initialSlippageBps }: AiSwapModalProps) {
    const { connectWallet, isConnecting, connected, publicKey } = useWallet();
    const [slippageBps, setSlippageBps] = useState(initialSlippageBps ?? 50);
    const [debouncedSlippageBps, setDebouncedSlippageBps] = useState(initialSlippageBps ?? 50);

    const [inputMeta, setInputMeta] = useState<TokenMeta | null>(null);
    const [outputMeta, setOutputMeta] = useState<TokenMeta | null>(null);
    const [metaLoading, setMetaLoading] = useState(false);
    const [metaError, setMetaError] = useState<string | null>(null);

    const [quoteLoading, setQuoteLoading] = useState(false);
    const [quoteError, setQuoteError] = useState<string | null>(null);
    const [swapLoading, setSwapLoading] = useState(false);
    const [swapError, setSwapError] = useState<string | null>(null);
    const [signature, setSignature] = useState<string | null>(null);
    const [quote, setQuote] = useState<Awaited<ReturnType<typeof fetchJupiterQuote>> | null>(null);
    const quoteRequestIdRef = useRef(0);

    // Sync slippageBps when prop changes
    useEffect(() => {
        if (initialSlippageBps !== undefined) {
            setSlippageBps(initialSlippageBps);
            setDebouncedSlippageBps(initialSlippageBps);
        }
    }, [initialSlippageBps]);

    // Debounce slippage changes for quoting
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

    // Load Token Metadata
    useEffect(() => {
        if (!open || !inputMint || !outputMint) return;

        let mounted = true;
        setMetaLoading(true);
        setMetaError(null);

        const fetchMeta = async () => {
            try {
                // Fetch Input Meta
                let resolvedInput: TokenMeta;
                if (inputMint.toLowerCase() === COMMON_TOKENS.SOL.mint.toLowerCase()) {
                    resolvedInput = {
                        symbol: "SOL",
                        name: "Solana",
                        decimals: 9,
                        logoUri: "/icons/sol.png"
                    };
                } else {
                    const detail = await tokenApi.getTokenDetail(inputMint);
                    resolvedInput = {
                        symbol: detail.symbol || "Unknown",
                        name: detail.name || "Unknown Token",
                        decimals: detail.decimals ?? 9,
                        logoUri: detail.logo_uri || "/icons/sol.png"
                    };
                }

                // Fetch Output Meta
                let resolvedOutput: TokenMeta;
                if (outputMint.toLowerCase() === COMMON_TOKENS.SOL.mint.toLowerCase()) {
                    resolvedOutput = {
                        symbol: "SOL",
                        name: "Solana",
                        decimals: 9,
                        logoUri: "/icons/sol.png"
                    };
                } else {
                    const detail = await tokenApi.getTokenDetail(outputMint);
                    resolvedOutput = {
                        symbol: detail.symbol || "Unknown",
                        name: detail.name || "Unknown Token",
                        decimals: detail.decimals ?? 9,
                        logoUri: detail.logo_uri || "/icons/sol.png"
                    };
                }

                if (mounted) {
                    setInputMeta(resolvedInput);
                    setOutputMeta(resolvedOutput);
                }
            } catch {
                if (mounted) {
                    setMetaError("Failed to fetch token metadata.");
                    setInputMeta(null);
                    setOutputMeta(null);
                }
            } finally {
                if (mounted) {
                    setMetaLoading(false);
                }
            }
        };

        fetchMeta();

        return () => {
            mounted = false;
        };
    }, [open, inputMint, outputMint]);

    // Fetch Quote
    useEffect(() => {
        if (!open || !inputMeta || !outputMeta || !inputMint || !outputMint) return;

        if (!isValidAmount(amount)) {
            setQuote(null);
            setQuoteError("Invalid amount.");
            return;
        }

        const amountBaseUnits = toBaseUnits(amount, inputMeta.decimals);
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
                inputMint,
                outputMint,
                amount: amountBaseUnits,
                swapMode: "ExactIn",
                slippageBps: debouncedSlippageBps
            },
            {
                signal: controller.signal,
                payTokenSymbol: inputMeta.symbol,
                receiveTokenSymbol: outputMeta.symbol
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
    }, [open, inputMint, outputMint, inputMeta, outputMeta, amount, debouncedSlippageBps]);

    const receiveAmount = useMemo(() => {
        if (!quote?.outAmount || !outputMeta) return "--";
        return formatDisplay(formatFromBaseUnits(quote.outAmount, outputMeta.decimals), outputMeta.decimals);
    }, [quote?.outAmount, outputMeta]);

    const minReceived = useMemo(() => {
        if (!quote?.otherAmountThreshold || !outputMeta) return "--";
        return formatDisplay(formatFromBaseUnits(quote.otherAmountThreshold, outputMeta.decimals), outputMeta.decimals);
    }, [quote?.otherAmountThreshold, outputMeta]);

    const showInitialQuoteLoading = (quoteLoading || metaLoading) && !quote;
    const statusMessage = metaError
        ? metaError
        : quoteError
          ? quoteError
          : swapError
            ? swapError
            : signature
              ? `Swap submitted: ${signature.slice(0, 4)}...${signature.slice(-4)}`
              : showInitialQuoteLoading
                ? "Fetching quote..."
                : null;
    const statusClassName = metaError || quoteError || swapError ? "text-red-500" : signature ? "text-green-500" : "text-muted-foreground";
    const canConfirm = !!quote?.rawQuote && !quoteLoading && !metaLoading && !swapLoading && !quoteError && !metaError && parseInputNumber(amount) > 0;

    const handleConfirm = async () => {
        if (!quote?.rawQuote || !inputMeta || !outputMeta) return;

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
                    <DialogTitle>Swap Review</DialogTitle>
                    <DialogDescription>Review quote and confirm swap.</DialogDescription>
                </DialogHeader>

                {metaLoading ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="text-xs text-muted-foreground">Fetching token metadata...</span>
                    </div>
                ) : inputMeta && outputMeta ? (
                    <div className="space-y-4 text-sm">
                        <div className="rounded-lg border border-border p-3">
                            <div className="text-muted-foreground mb-2">Token</div>
                            <div className="flex items-center gap-2">
                                <Image src={outputMeta.logoUri} alt={outputMeta.symbol} width={20} height={20} className="h-5 w-5 rounded-full" unoptimized />
                                <span className="font-semibold">{outputMeta.symbol}</span>
                                <span className="text-muted-foreground">{outputMeta.name}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-lg border border-border p-3">
                                <div className="text-muted-foreground">Pay</div>
                                <div className="font-semibold">
                                    {amount || "0"} {inputMeta.symbol}
                                </div>
                            </div>
                            <div className="rounded-lg border border-border p-3">
                                <div className="text-muted-foreground">Estimated Receive</div>
                                <div className="font-semibold">
                                    {receiveAmount} {outputMeta.symbol}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 rounded-lg border border-border p-3">
                            <div className="flex items-center justify-between">
                                <span>Minimum Received</span>
                                <span>
                                    {minReceived} {outputMeta.symbol}
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
                            <Label htmlFor="swap-slippage" className="text-xs text-muted-foreground">
                                Slippage (bps)
                            </Label>
                            <NumbericInput
                                id="swap-slippage"
                                formatter={AI_SWAP_SLIPPAGE_FORMATTER}
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
                    <div className="text-sm text-muted-foreground py-4 text-center">No token details loaded.</div>
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
                            "Confirm Swap"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
