"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Loader2, Mail, Unlink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEmailSubscription, useSubmitEmail, useEmailStatus, useDisconnectEmail } from "../hooks/useEmailSubscription";
import { useAuth } from "@/contexts/AuthContext";

type Step = "idle" | "pending" | "verified";

interface EmailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EmailDialog({ open, onOpenChange }: EmailDialogProps) {
    const { user } = useAuth();
    const { data: subscription, isLoading: loadingSubscription } = useEmailSubscription();
    const { mutateAsync: submitEmail, isPending: submitting } = useSubmitEmail();
    const { mutateAsync: disconnect, isPending: disconnecting } = useDisconnectEmail();

    const step: Step = (() => {
        if (!subscription) return "idle";
        if (subscription.isVerified) return "verified";
        if (subscription.email) return "pending";
        return "idle";
    })();

    const isPolling = open && step === "pending";
    useEmailStatus(isPolling);

    async function handleSubmit(email: string) {
        if (!email) return;
        try {
            await submitEmail(email);
        } catch {
            // error handled by toast elsewhere
        }
    }

    async function handleResend() {
        const email = subscription?.email ?? user?.email;
        if (!email) return;
        try {
            await submitEmail(email);
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
            <DialogContent
                className="bg-[#0c1018] border border-white/[0.08] rounded-2xl w-[420px] max-w-[95vw]
                                      shadow-[0_24px_60px_rgba(0,0,0,0.7)]"
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2.5 text-[14px] font-semibold text-white/90">
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-violet-500/15 ring-1 ring-violet-500/25">
                            <Mail size={13} className="text-violet-400" />
                        </div>
                        Email Notifications
                    </DialogTitle>
                </DialogHeader>

                <div className="mt-2">
                    {loadingSubscription ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="size-5 text-white/30 animate-spin" />
                        </div>
                    ) : step === "verified" ? (
                        <VerifiedState
                            email={subscription!.email!}
                            verifiedAt={subscription!.verifiedAt!}
                            onDisconnect={handleDisconnect}
                            disconnecting={disconnecting}
                        />
                    ) : step === "pending" ? (
                        <PendingState email={subscription!.email!} onResend={handleResend} resending={submitting} />
                    ) : (
                        <IdleState email={user?.email ?? ""} onSubmit={handleSubmit} submitting={submitting} />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function IdleState({ email, onSubmit, submitting }: { email: string; onSubmit: (email: string) => void; submitting: boolean }) {
    const [inputValue, setInputValue] = useState(email);

    useEffect(() => {
        setInputValue(email);
    }, [email]);

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit(inputValue);
            }}
            className="flex flex-col gap-4"
        >
            <p className="text-[12px] text-white/50 leading-relaxed">
                Receive wallet alert notifications via email. We&apos;ll send a verification link to confirm.
            </p>
            <div className="relative flex items-center min-w-0">
                <Mail className="absolute left-3 size-3.5 text-white/30 pointer-events-none" />
                <Input
                    type="email"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={submitting}
                    placeholder="Enter your email"
                    className="h-10 pl-9 pr-3 rounded-xl bg-white/[0.04] border-white/[0.08] text-[13px] text-white/70 placeholder:text-[var(--text-disabled)] dark:placeholder:text-white/20 focus-visible:ring-violet-500/30 dark:bg-white/[0.04] dark:border-white/[0.08] truncate min-w-0 w-full"
                    required
                />
            </div>
            <Button
                type="submit"
                disabled={submitting || !inputValue}
                className="flex items-center justify-center gap-2 w-full h-10 rounded-xl
                           bg-violet-500/15 border border-violet-500/25 text-violet-600 dark:text-violet-300
                           hover:text-violet-700 dark:hover:text-violet-200
                           hover:bg-violet-500/25 hover:border-violet-500/40
                           disabled:opacity-50 disabled:cursor-not-allowed
                           text-[13px] font-semibold transition-all duration-150"
            >
                {submitting ? <Loader2 className="size-3.5 animate-spin" /> : <Mail className="size-3.5" />}
                {submitting ? "Sending..." : "Send verification email"}
            </Button>
        </form>
    );
}

function PendingState({ email, onResend, resending }: { email: string; onResend: () => void; resending: boolean }) {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center gap-3 py-6 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <Mail className="size-8 text-violet-600/70 dark:text-violet-400/60" />
                <div className="text-center w-full px-4">
                    <p className="text-[13px] font-semibold text-white/80">Check your inbox</p>
                    <p className="text-[11px] text-white/40 mt-1">
                        Verification email sent to
                        <br />
                        <span className="text-white/60 font-medium break-all block mt-1">{email}</span>
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-white/30">
                <Loader2 className="size-3 animate-spin shrink-0" />
                Waiting for verification...
            </div>

            <button
                onClick={onResend}
                disabled={resending}
                className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors disabled:opacity-50 text-left"
            >
                Didn&apos;t receive it? Resend email
            </button>
        </div>
    );
}

function VerifiedState({
    email,
    verifiedAt,
    onDisconnect,
    disconnecting
}: {
    email: string;
    verifiedAt: string;
    onDisconnect: () => void;
    disconnecting: boolean;
}) {
    const date = new Date(verifiedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col items-center gap-3 py-6 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/20">
                <CheckCircle2 className="size-10 text-emerald-600 dark:text-emerald-400" />
                <div className="text-center w-full px-4">
                    <p className="text-[13px] font-semibold text-emerald-600 dark:text-emerald-300">Email Connected</p>
                    <p className="text-[11px] text-white/40 mt-0.5 break-all block">{email}</p>
                    <p className="text-[11px] text-white/30 mt-0.5">Connected on {date}</p>
                </div>
            </div>

            <p className="text-[12px] text-white/40 text-center">Wallet alert notifications will be sent to your email.</p>

            <button
                onClick={onDisconnect}
                disabled={disconnecting}
                className="flex items-center justify-center gap-2 w-full py-2 rounded-xl
                           text-[12px] font-medium text-white/40 hover:text-red-500 dark:hover:text-red-400
                           hover:bg-red-500/10 border border-transparent hover:border-red-500/20
                           disabled:opacity-50 transition-all duration-150"
            >
                {disconnecting ? <Loader2 className="size-3.5 animate-spin" /> : <Unlink className="size-3.5" />}
                Disconnect
            </button>
        </div>
    );
}
