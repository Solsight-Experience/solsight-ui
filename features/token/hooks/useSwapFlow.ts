import { useState, useEffect } from "react";
import { toast } from "sonner";
import { VersionedTransaction } from "@solana/web3.js";
import { executeJupiterSwap, getSwapApiConfig, parseInputNumber, toBaseUnits, formatInputValue } from "@/features/swap";
import { LimitOrderService } from "@/features/limit-orders";
import { useWallet } from "@/features/wallets/hooks/useWallet";
import type { QuoteState } from "./useQuoteState";

type PhantomProvider = {
    isPhantom?: boolean;
    signTransaction: (tx: unknown) => Promise<{ serialize(): Uint8Array }>;
};

interface UseSwapFlowParams {
    payMint: string;
    receiveMint: string;
    payAmount: string;
    receiveAmount: string;
    payDecimals: number;
    receiveDecimals: number;
    slippageBps: number;
    orderType: "market" | "limit";
    limitPrice: string;
    tradeMode: "buy" | "sell";
    quoteState: QuoteState;
    selectablePayTokensLength: number;
    selectableReceiveTokensLength: number;
    validationError: string | null;
    lastEdited: "pay" | "receive" | null;
    setPayAmount: (v: string) => void;
    setReceiveAmount: (v: string) => void;
    refreshBalancesAfterSwap: () => Promise<void>;
}

export interface SwapFlowState {
    loading: boolean;
    error: string | null;
    signature: string | null;
}

export interface UseSwapFlowResult {
    swapState: SwapFlowState;
    setSwapState: React.Dispatch<React.SetStateAction<SwapFlowState>>;
    solPriceUsd: number | null;
    handleSwap: () => Promise<void>;
    handleLimitOrder: () => Promise<void>;
}

export function useSwapFlow(params: UseSwapFlowParams): UseSwapFlowResult {
    const {
        payMint,
        receiveMint,
        payAmount,
        receiveAmount,
        payDecimals,
        receiveDecimals,
        slippageBps,
        orderType,
        limitPrice,
        tradeMode,
        quoteState,
        selectablePayTokensLength,
        selectableReceiveTokensLength,
        validationError,
        lastEdited,
        setPayAmount,
        setReceiveAmount,
        refreshBalancesAfterSwap
    } = params;

    const { connectWallet, isConnecting, connected, publicKey } = useWallet();
    const swapConfig = getSwapApiConfig();

    const [swapState, setSwapState] = useState<SwapFlowState>({
        loading: false,
        error: null,
        signature: null
    });

    const [solPriceUsd, setSolPriceUsd] = useState<number | null>(null);

    // Fetch SOL price for limit order calculations
    useEffect(() => {
        fetch("/api/v1/tokens/prices/sol")
            .then((r) => r.json())
            .then((data) => {
                if (data?.price) setSolPriceUsd(data.price);
            })
            .catch(() => {});
    }, []);

    // Limit order amount calculation
    useEffect(() => {
        if (orderType !== "limit" || !limitPrice || !solPriceUsd) return;
        const priceUsd = parseInputNumber(limitPrice);
        if (priceUsd <= 0) return;
        const effectiveSolPrice = solPriceUsd || 1;
        if (lastEdited === "receive") {
            const amountReceive = parseInputNumber(receiveAmount);
            if (amountReceive > 0) {
                const calc = tradeMode === "buy" ? (amountReceive * priceUsd) / effectiveSolPrice : (amountReceive * effectiveSolPrice) / priceUsd;
                const newPay = formatInputValue(calc.toString(), payDecimals);
                if (newPay !== payAmount) setPayAmount(newPay);
            } else {
                if (payAmount !== "") setPayAmount("");
            }
        } else {
            const amountPay = parseInputNumber(payAmount);
            if (amountPay > 0) {
                const calc = tradeMode === "buy" ? (amountPay * effectiveSolPrice) / priceUsd : (amountPay * priceUsd) / effectiveSolPrice;
                const newReceive = formatInputValue(calc.toString(), receiveDecimals);
                if (newReceive !== receiveAmount) setReceiveAmount(newReceive);
            } else {
                if (receiveAmount !== "") setReceiveAmount("");
            }
        }
    }, [
        limitPrice,
        payAmount,
        receiveAmount,
        orderType,
        receiveDecimals,
        payDecimals,
        lastEdited,
        setPayAmount,
        setReceiveAmount,
        solPriceUsd,
        tradeMode,
        payMint,
        receiveMint
    ]);

    const handleSwap = async () => {
        if ((tradeMode === "buy" && selectablePayTokensLength === 0) || (tradeMode === "sell" && selectableReceiveTokensLength === 0)) {
            toast.error("You cannot swap because you have insufficient funds.");
            return;
        }

        if (validationError) {
            toast.error(validationError);
            return;
        }

        if (quoteState.loading && !quoteState.rawQuote) {
            toast.info("Fetching quote, please try again in a moment.");
            return;
        }

        if (!quoteState.rawQuote) {
            toast.error("No quote available.");
            return;
        }

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

        setSwapState({ loading: true, error: null, signature: null });

        try {
            const { signature } = await executeJupiterSwap(
                {
                    quoteResponse: quoteState.rawQuote,
                    userPublicKey: publicKey,
                    signTransaction: (tx) => provider.signTransaction(tx)
                },
                { config: swapConfig }
            );

            setSwapState({ loading: false, error: null, signature });
            await refreshBalancesAfterSwap();
            toast.success("Swap submitted!");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Swap failed";
            const isUserRejected = /user rejected|rejected the request|denied|cancelled/i.test(message);
            if (isUserRejected) {
                setSwapState({ loading: false, error: null, signature: null });
                toast.info("Transaction was cancelled in wallet.");
                return;
            }
            setSwapState({ loading: false, error: message, signature: null });
            toast.error(message);
        }
    };

    const handleLimitOrder = async () => {
        if (validationError) {
            toast.error(validationError);
            return;
        }

        if (!limitPrice || parseInputNumber(limitPrice) <= 0) {
            toast.error("Enter a valid limit price.");
            return;
        }

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

        if (!payAmount || !receiveAmount) {
            toast.error("Enter amounts.");
            return;
        }

        setSwapState({ loading: true, error: null, signature: null });

        try {
            const makingAmount = toBaseUnits(payAmount, payDecimals);
            const takingAmount = toBaseUnits(receiveAmount, receiveDecimals);

            if (!makingAmount || !takingAmount) {
                throw new Error("Invalid amounts");
            }

            const walletAddress = typeof publicKey === "string" ? publicKey : (publicKey as { toBase58(): string }).toBase58();

            const createResponse = await LimitOrderService.createOrder({
                inputMint: payMint,
                outputMint: receiveMint,
                maker: walletAddress,
                payer: walletAddress,
                params: {
                    makingAmount,
                    takingAmount,
                    slippageBps: slippageBps.toString()
                },
                computeUnitPrice: "auto",
                wrapAndUnwrapSol: true
            });

            const txBuffer = Buffer.from(createResponse.transaction, "base64");
            const transaction = VersionedTransaction.deserialize(txBuffer);
            const signedTx = await provider.signTransaction(transaction);
            const signedTxBase64 = Buffer.from(signedTx.serialize()).toString("base64");

            const executeResponse = await LimitOrderService.executeOrder({
                requestId: createResponse.requestId,
                signedTransaction: signedTxBase64
            });

            setSwapState({ loading: false, error: null, signature: executeResponse.signature });
            toast.success("Limit order created!");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to create limit order";
            setSwapState({ loading: false, error: message, signature: null });
            toast.error(message);
        }
    };

    return { swapState, setSwapState, solPriceUsd, handleSwap, handleLimitOrder };
}
