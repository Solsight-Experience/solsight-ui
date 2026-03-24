"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { transferFormSchema, TransferFormData } from "@/lib/validators";
import { useTransfer } from "../hooks/useTransfer";
import { useWallet, useWalletBalance } from "@/features/wallets/hooks/useWallet";
import { Wallet, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatWalletAddress } from "@/lib/formatters";

export default function TransferForm() {
    const { connectWallet, isConnecting, connected, publicKey } = useWallet();
    const { createTransfer, isCreating } = useTransfer();
    const { data: balance, isLoading: balanceLoading } = useWalletBalance(publicKey || undefined);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch
    } = useForm<TransferFormData>({
        resolver: zodResolver(transferFormSchema),
        defaultValues: {
            amount: 0,
            recipientAddress: "",
            memo: ""
        }
    });

    const amount = watch("amount");

    const onSubmit = (data: TransferFormData) => {
        if (!connected || !publicKey) {
            toast.error("Please connect your wallet first");
            return;
        }

        if (balance !== undefined && data.amount > balance) {
            toast.error("Insufficient balance");
            return;
        }

        createTransfer({
            fromAddress: publicKey,
            toAddress: data.recipientAddress,
            amount: data.amount,
            memo: data.memo
        });

        reset();
    };

    const handleConnectWallet = () => {
        connectWallet();
    };

    return (
        <div className="max-w-md mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Send className="h-5 w-5" />
                        Transfer SOL
                    </CardTitle>
                    <CardDescription>Send SOL tokens securely through the Solana network</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Wallet Connection Section */}
                    {!connected ? (
                        <div className="text-center space-y-4">
                            <p className="text-sm text-muted-foreground">Connect your Phantom wallet to start transferring tokens</p>
                            <Button onClick={handleConnectWallet} disabled={isConnecting} className="w-full">
                                {isConnecting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        <Wallet className="mr-2 h-4 w-4" />
                                        Connect Phantom Wallet
                                    </>
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Wallet Info */}
                            <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-green-900 dark:text-green-100">Wallet Connected</p>
                                        <p className="text-xs text-green-700 dark:text-green-300 font-mono">
                                            {publicKey ? formatWalletAddress(publicKey) : ""}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-green-900 dark:text-green-100">Balance</p>
                                        <p className="text-xs text-green-700 dark:text-green-300">
                                            {balanceLoading ? <Loader2 className="h-3 w-3 animate-spin inline" /> : `${balance?.toFixed(4) || "0.0000"} SOL`}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Transfer Form */}
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="recipientAddress">Recipient Address</Label>
                                    <Input
                                        id="recipientAddress"
                                        placeholder="Enter Solana wallet address"
                                        {...register("recipientAddress")}
                                        className={errors.recipientAddress ? "border-red-500" : ""}
                                    />
                                    {errors.recipientAddress && <p className="text-sm text-red-500">{errors.recipientAddress.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="amount">Amount (SOL)</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.000001"
                                        placeholder="0.0"
                                        {...register("amount", { valueAsNumber: true })}
                                        className={errors.amount ? "border-red-500" : ""}
                                    />
                                    {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
                                    {balance !== undefined && amount > balance && (
                                        <p className="text-sm text-red-500">Insufficient balance. Available: {balance.toFixed(4)} SOL</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="memo">Memo (Optional)</Label>
                                    <Input
                                        id="memo"
                                        placeholder="Add a note for this transfer"
                                        {...register("memo")}
                                        className={errors.memo ? "border-red-500" : ""}
                                    />
                                    {errors.memo && <p className="text-sm text-red-500">{errors.memo.message}</p>}
                                </div>

                                <Button type="submit" className="w-full" disabled={isCreating || balanceLoading}>
                                    {isCreating ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processing Transfer...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-2 h-4 w-4" />
                                            Send Transfer
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
