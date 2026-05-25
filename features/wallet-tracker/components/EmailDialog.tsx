"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Mail, Unlink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEmailSubscription, useSubmitEmail, useEmailStatus, useDisconnectEmail } from "../hooks/useEmailSubscription";

type Step = "idle" | "entering" | "pending" | "verified";

interface EmailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EmailDialog({ open, onOpenChange }: EmailDialogProps) {
    const { data: subscription, isLoading: loadingSubscription } = useEmailSubscription();
    const { mutateAsync: submitEmail, isPending: submitting } = useSubmitEmail();
    const { mutateAsync: disconnect, isPending: disconnecting } = useDisconnectEmail();
    const [inputEmail, setInputEmail] = useState("");

    const step: Step = (() => {
        if (!subscription) return "idle";
        if (subscription.isVerified) return "verified";
        if (subscription.email) return "pending";
        return "idle";
    })();

    const isPolling = open && step === "pending";
    useEmailStatus(isPolling);

    async function handleSubmit() {
        if (!inputEmail.trim()) return;
        try {
            await submitEmail(inputEmail.trim());
        } catch {
            // error handled by toast elsewhere
        }
    }

    async function handleResend() {
        const email = subscription?.email ?? inputEmail.trim();
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
            setInputEmail("");
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
                        <EnteringState email={inputEmail} onEmailChange={setInputEmail} onSubmit={handleSubmit} submitting={submitting} />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function EnteringState({
    email,
    onEmailChange,
    onSubmit,
    submitting
}: {
    email: string;
    onEmailChange: (v: string) => void;
    onSubmit: () => void;
    submitting: boolean;
}) {
    return (
        <div className="flex flex-col gap-4">
            <p className="text-[12px] text-white/50 leading-relaxed">
                Enter your email address to receive wallet alert notifications. We&apos;ll send a verification link to confirm.
            </p>
            <input
                type="email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSubmit()}
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.10]
                           text-[13px] text-white placeholder:text-white/25
                           focus:outline-none focus:border-violet-500/50 transition-colors"
            />
            <button
                onClick={onSubmit}
                disabled={submitting || !email.trim()}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
                           bg-violet-500/15 border border-violet-500/25 text-violet-300
                           hover:bg-violet-500/25 hover:border-violet-500/40
                           disabled:opacity-50 disabled:cursor-not-allowed
                           text-[13px] font-semibold transition-all duration-150"
            >
                {submitting ? <Loader2 className="size-3.5 animate-spin" /> : <Mail className="size-3.5" />}
                {submitting ? "Sending..." : "Send verification email"}
            </button>
        </div>
    );
}

function PendingState({ email, onResend, resending }: { email: string; onResend: () => void; resending: boolean }) {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center gap-3 py-6 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <Mail className="size-8 text-violet-400/60" />
                <div className="text-center">
                    <p className="text-[13px] font-semibold text-white/80">Check your inbox</p>
                    <p className="text-[11px] text-white/40 mt-1">
                        Verification email sent to
                        <br />
                        <span className="text-white/60 font-medium">{email}</span>
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
                className="text-[11px] text-white/30 hover:text-white/60 transition-colors disabled:opacity-50 text-left"
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
                <CheckCircle2 className="size-10 text-emerald-400" />
                <div className="text-center">
                    <p className="text-[13px] font-semibold text-emerald-300">Email Connected</p>
                    <p className="text-[11px] text-white/40 mt-0.5">{email}</p>
                    <p className="text-[11px] text-white/30 mt-0.5">Connected on {date}</p>
                </div>
            </div>

            <p className="text-[12px] text-white/40 text-center">Wallet alert notifications will be sent to your email.</p>

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
