"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import SocialAuthButtons from "./social-auth-buttons";
import ForgotPasswordForm from "./forgot-password-form";
import { loginApi, resendVerificationApi } from "../../features/auth/authservice";
import { getErrorMessage } from "@/lib/error-utils";

interface SignInFormProps {
    onToggle?: () => void;
}

export default function SignInForm({ onToggle }: SignInFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirect") || "/";
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [isUnverified, setIsUnverified] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    if (showForgotPassword) {
        return <ForgotPasswordForm initialEmail={email} onBack={() => setShowForgotPassword(false)} />;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setIsUnverified(false);

        try {
            const data = await loginApi({ email, password });
            if (!data.user) {
                throw new Error("Invalid login response: missing user data");
            }
            login(data.user);
            router.push(redirectTo);
        } catch (err: unknown) {
            const e = err as { response?: { status?: number; data?: { message?: string } } };
            if (e.response?.status === 401 && e.response?.data?.message === "Please verify your email before logging in") {
                setIsUnverified(true);
                setError(e.response.data.message!);
            } else {
                setError(getErrorMessage(err, "Login Failed"));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        try {
            await resendVerificationApi(email);
            toast.success("Verification email sent. Please check your inbox.");
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            toast.error(e.response?.data?.message || "Failed to resend email");
        } finally {
            setIsResending(false);
        }
    };

    const inputStyle = (field: string) => ({
        background: focusedField === field ? "rgba(139,92,246,0.06)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${focusedField === field ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.08)"}`,
        boxShadow: focusedField === field ? "0 0 0 3px rgba(139,92,246,0.1), 0 0 20px rgba(139,92,246,0.08)" : "none",
        transition: "all 0.2s ease"
    });

    return (
        <div
            className="w-full rounded-2xl p-7"
            style={{
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(255,255,255,0.08)"
            }}
        >
            {/* Header */}
            <div className="mb-7">
                <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
                <p className="text-white/40 text-sm">Sign in to access your trading dashboard</p>
            </div>

            {/* Error */}
            {error && (
                <div
                    className="mb-5 p-3.5 rounded-xl text-sm"
                    style={{
                        background: "rgba(239,68,68,0.08)",
                        border: "1px solid rgba(239,68,68,0.25)",
                        color: "#fca5a5"
                    }}
                >
                    <div className="flex items-start gap-2.5">
                        <span className="mt-0.5 shrink-0">⚠</span>
                        {error}
                    </div>
                    {isUnverified && (
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={isResending}
                            className="mt-2.5 w-full rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer"
                            style={{
                                background: isResending ? "rgba(139,92,246,0.2)" : "rgba(139,92,246,0.15)",
                                border: "1px solid rgba(139,92,246,0.35)",
                                color: "#c4b5fd"
                            }}
                        >
                            {isResending ? "Sending..." : "Resend verification email"}
                        </button>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                    <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                        <Mail
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors"
                            style={{ color: focusedField === "email" ? "#a78bfa" : "rgba(255,255,255,0.25)" }}
                        />
                        <input
                            id="signin-email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={() => setFocusedField("email")}
                            onBlur={() => setFocusedField(null)}
                            required
                            className="w-full rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/20 outline-none text-sm"
                            style={inputStyle("email")}
                        />
                    </div>
                </div>

                {/* Password */}
                <div>
                    <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">Password</label>
                    <div className="relative">
                        <Lock
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors"
                            style={{ color: focusedField === "password" ? "#a78bfa" : "rgba(255,255,255,0.25)" }}
                        />
                        <input
                            id="signin-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setFocusedField("password")}
                            onBlur={() => setFocusedField(null)}
                            required
                            className="w-full rounded-xl py-3 pl-10 pr-11 text-white placeholder:text-white/20 outline-none text-sm"
                            style={inputStyle("password")}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                            style={{ color: "rgba(255,255,255,0.3)" }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#a78bfa")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Remember me / Forgot */}
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative w-4 h-4">
                            <input type="checkbox" id="remember" className="peer sr-only" />
                            <div className="w-4 h-4 rounded peer-checked:bg-purple-600 border border-white/20 peer-checked:border-purple-500 transition-all" />
                        </div>
                        <span className="text-white/40 text-xs group-hover:text-white/60 transition-colors">Remember me</span>
                    </label>
                    <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-purple-400 text-xs hover:text-purple-300 transition-colors font-medium"
                    >
                        Forgot password?
                    </button>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    id="signin-submit"
                    disabled={isLoading}
                    className="w-full relative overflow-hidden rounded-xl py-3.5 font-semibold text-sm text-white transition-all group"
                    style={{
                        background: isLoading ? "rgba(139,92,246,0.3)" : "linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4f46e5 100%)",
                        boxShadow: isLoading ? "none" : "0 0 30px rgba(139,92,246,0.35), 0 4px 15px rgba(139,92,246,0.2)"
                    }}
                    onMouseEnter={(e) => {
                        if (!isLoading) {
                            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 50px rgba(139,92,246,0.55), 0 8px 25px rgba(139,92,246,0.35)";
                            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px) scale(1.01)";
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isLoading) {
                            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 30px rgba(139,92,246,0.35), 0 4px 15px rgba(139,92,246,0.2)";
                            (e.currentTarget as HTMLButtonElement).style.transform = "none";
                        }
                    }}
                >
                    <span className="relative flex items-center justify-center gap-2">
                        {isLoading ? (
                            <>
                                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Signing in...
                            </>
                        ) : (
                            <>
                                Sign In
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </>
                        )}
                    </span>
                </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                <span className="text-white/25 text-xs">or continue with</span>
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
            </div>

            <SocialAuthButtons />

            {/* Toggle to sign up */}
            <p className="text-center text-white/30 text-xs mt-5">
                Don&apos;t have an account?{" "}
                <button onClick={onToggle} className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                    Create one free
                </button>
            </p>
        </div>
    );
}
