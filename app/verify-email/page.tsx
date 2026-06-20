"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Mail, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { verifyEmailApi, resendVerificationApi } from "@/features/auth/authservice";

type PageState = "loading" | "success" | "error" | "no-token";

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [state, setState] = useState<PageState>(token ? "loading" : "no-token");
    const [errorMsg, setErrorMsg] = useState("");
    const [resendEmail, setResendEmail] = useState("");
    const [isResending, setIsResending] = useState(false);
    const [focusedField, setFocusedField] = useState(false);
    const called = useRef(false);

    useEffect(() => {
        if (!token || called.current) return;
        called.current = true;

        verifyEmailApi(token)
            .then(() => {
                setState("success");
                setTimeout(() => router.push("/authentication"), 2500);
            })
            .catch((err: unknown) => {
                const e = err as { response?: { data?: { message?: string } } };
                setErrorMsg(e.response?.data?.message || "Verification failed. Please try again.");
                setState("error");
            });
    }, [token, router]);

    const handleResend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resendEmail.trim()) return;
        setIsResending(true);
        try {
            await resendVerificationApi(resendEmail.trim());
            toast.success("Verification email sent. Please check your inbox.");
            setResendEmail("");
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            toast.error(e.response?.data?.message || "Failed to resend email");
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.12) 0%, transparent 70%)" }}
        >
            <div
                className="w-full max-w-md rounded-2xl p-8 flex flex-col items-center text-center"
                style={{
                    background: "rgba(255,255,255,0.04)",
                    backdropFilter: "blur(24px)",
                    border: "1px solid rgba(255,255,255,0.08)"
                }}
            >
                {state === "loading" && (
                    <>
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                            style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)" }}
                        >
                            <svg className="animate-spin w-8 h-8 text-violet-400" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Verifying your email</h2>
                        <p className="text-white/40 text-sm">Please wait a moment...</p>
                    </>
                )}

                {state === "success" && (
                    <>
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                            style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)" }}
                        >
                            <CheckCircle className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Email verified!</h2>
                        <p className="text-white/40 text-sm">Redirecting you to sign in...</p>
                    </>
                )}

                {state === "error" && (
                    <>
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}
                        >
                            <XCircle className="w-8 h-8 text-red-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Verification failed</h2>
                        <p className="text-sm mb-7" style={{ color: "#fca5a5" }}>
                            {errorMsg}
                        </p>

                        <form onSubmit={handleResend} className="w-full space-y-3">
                            <p className="text-white/40 text-xs mb-3">Enter your email to receive a new verification link</p>
                            <div className="relative">
                                <Mail
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors"
                                    style={{ color: focusedField ? "#a78bfa" : "rgba(255,255,255,0.25)" }}
                                />
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={resendEmail}
                                    onChange={(e) => setResendEmail(e.target.value)}
                                    onFocus={() => setFocusedField(true)}
                                    onBlur={() => setFocusedField(false)}
                                    required
                                    className="w-full rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/20 outline-none text-sm"
                                    style={{
                                        background: focusedField ? "rgba(139,92,246,0.06)" : "rgba(255,255,255,0.03)",
                                        border: `1px solid ${focusedField ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.08)"}`,
                                        boxShadow: focusedField ? "0 0 0 3px rgba(139,92,246,0.1)" : "none",
                                        transition: "all 0.2s ease"
                                    }}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isResending || !resendEmail.trim()}
                                className="w-full rounded-xl py-3 font-semibold text-sm text-white transition-all cursor-pointer"
                                style={{
                                    background:
                                        isResending || !resendEmail.trim()
                                            ? "rgba(139,92,246,0.3)"
                                            : "linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4f46e5 100%)",
                                    boxShadow: isResending || !resendEmail.trim() ? "none" : "0 0 30px rgba(139,92,246,0.35)"
                                }}
                            >
                                {isResending ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Sending...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        Resend verification email
                                        <ArrowRight className="w-4 h-4" />
                                    </span>
                                )}
                            </button>
                        </form>
                    </>
                )}

                {state === "no-token" && (
                    <>
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}
                        >
                            <XCircle className="w-8 h-8 text-red-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Invalid link</h2>
                        <p className="text-white/40 text-sm mb-7">This verification link is missing or malformed.</p>
                        <button
                            onClick={() => router.push("/authentication")}
                            className="text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors cursor-pointer"
                        >
                            Back to sign in
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
