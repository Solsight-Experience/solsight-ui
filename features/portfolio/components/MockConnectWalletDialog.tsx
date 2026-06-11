"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWalletAuth } from "../hooks/useWalletAuth";
import { useAuth } from "@/contexts/AuthContext";
import { AlertTriangle } from "lucide-react";

interface MockConnectWalletDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function MockConnectWalletDialog({ open, onOpenChange }: MockConnectWalletDialogProps) {
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { handleWalletConnect } = useWalletAuth();
    const { user } = useAuth();

    const handleConnect = async (walletName: string) => {
        setIsConnecting(true);
        setConnectingWallet(walletName);
        setError(null);
        try {
            const success = await handleWalletConnect(walletName, user?.id);
            if (success) {
                onOpenChange(false);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to connect wallet");
        } finally {
            setIsConnecting(false);
            setConnectingWallet(null);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!isConnecting) {
            setError(null);
            onOpenChange(open);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Connect Wallet</DialogTitle>
                    <DialogDescription>Choose a wallet to connect to your portfolio</DialogDescription>
                </DialogHeader>

                {error && (
                    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="flex flex-col gap-3 mt-2">
                    <Button
                        variant="outline"
                        className="w-full h-16 justify-start gap-4 border-[var(--border-default)] hover:bg-violet-500/10 hover:border-violet-500/50"
                        onClick={() => handleConnect("Phantom")}
                        disabled={isConnecting}
                    >
                        <Image
                            src="https://cdn.prod.website-files.com/66e480f0e9eccea9c231ce92/688cfdedc848baa5dcb46202_685aaee76364cd101625876d_Phantom-logo.png"
                            alt="Phantom"
                            width={32}
                            height={32}
                            className="h-8 w-8 object-contain"
                            unoptimized
                        />
                        <div className="flex flex-col items-start">
                            <span className="text-base font-medium">Phantom</span>
                            <span className="text-xs text-[var(--text-muted)]">Connect to Phantom Wallet</span>
                        </div>
                        {connectingWallet === "Phantom" && (
                            <span className="ml-auto flex items-center gap-1.5 text-sm text-violet-500 dark:text-violet-400">
                                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Connecting...
                            </span>
                        )}
                    </Button>

                    <Button
                        variant="outline"
                        className="w-full h-16 justify-start gap-4 border-[var(--border-default)] hover:bg-violet-500/10 hover:border-violet-500/50"
                        onClick={() => handleConnect("MetaMask")}
                        disabled={isConnecting}
                    >
                        <Image
                            src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                            alt="MetaMask"
                            width={32}
                            height={32}
                            className="h-8 w-8 object-contain"
                            unoptimized
                        />
                        <div className="flex flex-col items-start">
                            <span className="text-base font-medium">MetaMask</span>
                            <span className="text-xs text-[var(--text-muted)]">Connect to MetaMask</span>
                        </div>
                        {connectingWallet === "MetaMask" && (
                            <span className="ml-auto flex items-center gap-1.5 text-sm text-violet-500 dark:text-violet-400">
                                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Connecting...
                            </span>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
