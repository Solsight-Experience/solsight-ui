"use client";

import { useState, useEffect } from "react";
import { Copy, Check, CheckCircle2, Loader2, MessageCircle, Unlink } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    useZaloSubscription,
    useGenerateZaloToken,
    useZaloStatus,
    useDisconnectZalo,
} from "../hooks/useZaloSubscription";

type Step = "idle" | "pending" | "verified";

function CopyButton({ value }: { value: string }) {
    const [copied, setCopied] = useState(false);
    function handleCopy() {
        navigator.clipboard.writeText(value).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    }
    return (
        <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium
                       text-white/50 hover:text-white/80 hover:bg-white/[0.06]
                       border border-white/[0.08] transition-all duration-150"
        >
            {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
            {copied ? "Copied" : "Copy code"}
        </button>
    );
}

function TokenExpiry({ expiresAt }: { expiresAt: string }) {
    const [remaining, setRemaining] = useState("");

    useEffect(() => {
        function update() {
            const diff = new Date(expiresAt).getTime() - Date.now();
            if (diff <= 0) { setRemaining("Expired"); return; }
            const m = Math.floor(diff / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setRemaining(`${m}:${s.toString().padStart(2, "0")}`);
        }
        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, [expiresAt]);

    return (
        <span className={`text-[11px] tabular-nums ${remaining === "Expired" ? "text-red-400" : "text-white/30"}`}>
            Expires in {remaining}
        </span>
    );
}

interface ZaloBotDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ZaloBotDialog({ open, onOpenChange }: ZaloBotDialogProps) {
    const { data: subscription, isLoading: loadingSubscription } = useZaloSubscription();
    const { mutateAsync: generateToken, isPending: generating } = useGenerateZaloToken();
    const { mutateAsync: disconnect, isPending: disconnecting } = useDisconnectZalo();

    const step: Step = (() => {
        if (!subscription) return "idle";
        if (subscription.isVerified) return "verified";
        if (subscription.verificationToken) return "pending";
        return "idle";
    })();

    const isPolling = open && step === "pending";
    const { data: statusPoll } = useZaloStatus(isPolling);

    // Transition to verified when poll detects it
    useEffect(() => {
        if (statusPoll?.isVerified) {
            // React Query will update the subscription query cache via invalidation in the hook
            // Just trigger a refetch by invalidating — handled by onSuccess in useZaloStatus
        }
    }, [statusPoll?.isVerified]);

    async function handleGenerate() {
        try {
            await generateToken();
        } catch {
            // error handled by toast elsewhere
        }
    }

    async function handleDisconnect() {
        try {
            await disconnect();
        } catch {
            // error handled by toast elsewhere
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#0c1018] border border-white/[0.08] rounded-2xl w-[420px] max-w-[95vw]
                                      shadow-[0_24px_60px_rgba(0,0,0,0.7)]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2.5 text-[14px] font-semibold text-white/90">
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-500/15 ring-1 ring-blue-500/25">
                            <MessageCircle size={13} className="text-blue-400" />
                        </div>
                        Zalo Bot Notifications
                    </DialogTitle>
                </DialogHeader>

                <div className="mt-2">
                    {loadingSubscription ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="size-5 text-white/30 animate-spin" />
                        </div>
                    ) : step === "verified" ? (
                        <VerifiedState
                            verifiedAt={subscription!.verifiedAt!}
                            onDisconnect={handleDisconnect}
                            disconnecting={disconnecting}
                        />
                    ) : step === "pending" ? (
                        <PendingState
                            token={subscription!.verificationToken!}
                            expiresAt={subscription!.tokenExpiresAt!}
                            onRefresh={handleGenerate}
                            refreshing={generating}
                        />
                    ) : (
                        <IdleState onConnect={handleGenerate} connecting={generating} />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function IdleState({ onConnect, connecting }: { onConnect: () => void; connecting: boolean }) {
    return (
        <div className="flex flex-col gap-5">
            <p className="text-[12px] text-white/50 leading-relaxed">
                Connect your Zalo account to receive wallet alert notifications directly in your Zalo chat.
            </p>
            <button
                onClick={onConnect}
                disabled={connecting}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
                           bg-blue-500/15 border border-blue-500/25 text-blue-300
                           hover:bg-blue-500/25 hover:border-blue-500/40
                           disabled:opacity-50 disabled:cursor-not-allowed
                           text-[13px] font-semibold transition-all duration-150"
            >
                {connecting ? <Loader2 className="size-3.5 animate-spin" /> : <MessageCircle className="size-3.5" />}
                {connecting ? "Generating code..." : "Connect Zalo Bot"}
            </button>
        </div>
    );
}

function PendingState({
    token,
    expiresAt,
    onRefresh,
    refreshing,
}: {
    token: string;
    expiresAt: string;
    onRefresh: () => void;
    refreshing: boolean;
}) {
    return (
        <div className="flex flex-col gap-4">
            <p className="text-[12px] text-white/50 leading-relaxed">
                Send this code to the <span className="text-white/80 font-medium">SolSight Zalo OA bot</span> to verify your account.
            </p>

            <div className="flex flex-col items-center gap-3 py-5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-[32px] font-mono font-bold tracking-[0.25em] text-white">
                    {token}
                </span>
                <div className="flex items-center gap-3">
                    <CopyButton value={token} />
                    <TokenExpiry expiresAt={expiresAt} />
                </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-white/30">
                <Loader2 className="size-3 animate-spin shrink-0" />
                Waiting for verification...
            </div>

            <button
                onClick={onRefresh}
                disabled={refreshing}
                className="text-[11px] text-white/30 hover:text-white/60 transition-colors disabled:opacity-50 text-left"
            >
                Code expired? Generate a new one
            </button>
        </div>
    );
}

function VerifiedState({
    verifiedAt,
    onDisconnect,
    disconnecting,
}: {
    verifiedAt: string;
    onDisconnect: () => void;
    disconnecting: boolean;
}) {
    const date = new Date(verifiedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col items-center gap-3 py-6 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/20">
                <CheckCircle2 className="size-10 text-emerald-400" />
                <div className="text-center">
                    <p className="text-[13px] font-semibold text-emerald-300">Zalo Connected</p>
                    <p className="text-[11px] text-white/30 mt-0.5">Connected on {date}</p>
                </div>
            </div>

            <p className="text-[12px] text-white/40 text-center">
                Wallet alert notifications will be sent to your Zalo chat.
            </p>

            <button
                onClick={onDisconnect}
                disabled={disconnecting}
                className="flex items-center justify-center gap-2 w-full py-2 rounded-xl
                           text-[12px] font-medium text-white/40 hover:text-red-400
                           hover:bg-red-500/10 border border-transparent hover:border-red-500/20
                           disabled:opacity-50 transition-all duration-150"
            >
                {disconnecting ? <Loader2 className="size-3.5 animate-spin" /> : <Unlink className="size-3.5" />}
                Disconnect
            </button>
        </div>
    );
}
