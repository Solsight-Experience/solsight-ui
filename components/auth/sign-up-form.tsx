"use client";

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import SocialAuthButtons from "./social-auth-buttons";
import { signupApi, resendVerificationApi } from "@/features/auth/authservice";

interface SignUpFormProps {
    onToggle: () => void;
}

const PASSWORD_RULES = [
    { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
    { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
    { label: "One number", test: (p: string) => /\d/.test(p) }
];

export default function SignUpForm({ onToggle }: SignUpFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [successEmail, setSuccessEmail] = useState<string | null>(null);
    const [isResending, setIsResending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        if (!termsAccepted) {
            setError("Please accept the Terms of Service to continue");
            setIsLoading(false);
            return;
        }

        try {
            await signupApi({ email, password });
            setSuccessEmail(email);
        } catch (err: unknown) {
            console.error("Signup failed:", err);
            const error = err as { response?: { data?: { message?: string } } };
            setError(error.response?.data?.message || "Sign up failed");
        } finally {
            setIsLoading(false);
        }
    };

    const inputStyle = (field: string) => ({
        background: focusedField === field ? "rgba(139,92,246,0.06)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${focusedField === field ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.08)"}`,
        boxShadow: focusedField === field ? "0 0 0 3px rgba(139,92,246,0.1), 0 0 20px rgba(139,92,246,0.08)" : "none",
        transition: "all 0.2s ease"
    });

    const handleResend = async () => {
        if (!successEmail) return;
        setIsResending(true);
        try {
            await resendVerificationApi(successEmail);
            toast.success("Verification email sent. Please check your inbox.");
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            toast.error(e.response?.data?.message || "Failed to resend email");
        } finally {
            setIsResending(false);
        }
    };

    const passwordStrength = PASSWORD_RULES.filter((r) => r.test(password)).length;

    const strengthColor = ["#ef4444", "#f59e0b", "#10b981"][Math.min(passwordStrength - 1, 2)] ?? "rgba(255,255,255,0.1)";

    if (successEmail) {
        return (
            <div
                className="w-full rounded-2xl p-7 flex flex-col items-center text-center"
                style={{
                    background: "rgba(255,255,255,0.04)",
                    backdropFilter: "blur(24px)",
                    border: "1px solid rgba(255,255,255,0.08)"
                }}
            >
                <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                    style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)" }}
                >
                    <Mail className="w-8 h-8 text-violet-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Check your inbox</h2>
                <p className="text-white/40 text-sm mb-1">We sent a verification link to</p>
                <p className="text-violet-300 text-sm font-medium mb-7">{successEmail}</p>

                <button
                    onClick={handleResend}
                    disabled={isResending}
                    className="w-full rounded-xl py-3 font-semibold text-sm text-white transition-all mb-4 cursor-pointer"
                    style={{
                        background: isResending ? "rgba(139,92,246,0.3)" : "linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4f46e5 100%)",
                        boxShadow: isResending ? "none" : "0 0 30px rgba(139,92,246,0.35)"
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
                        "Resend verification email"
                    )}
                </button>

                <button onClick={onToggle} className="text-white/30 text-xs hover:text-white/60 transition-colors cursor-pointer">
                    Back to sign in
                </button>
            </div>
        );
    }

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
                <h2 className="text-2xl font-bold text-white mb-1">Create account</h2>
                <p className="text-white/40 text-sm">Start trading with professional-grade tools</p>
            </div>

            {/* Error */}
            {error && (
                <div
                    className="mb-5 p-3.5 rounded-xl flex items-start gap-2.5 text-sm"
                    style={{
                        background: "rgba(239,68,68,0.08)",
                        border: "1px solid rgba(239,68,68,0.25)",
                        color: "#fca5a5"
                    }}
                >
                    <span className="mt-0.5 flex-shrink-0">⚠</span>
                    {error}
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
                            id="signup-email"
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
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a strong password"
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
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* Password strength */}
                    {password.length > 0 && (
                        <div className="mt-2.5">
                            <div className="flex gap-1 mb-2">
                                {[0, 1, 2].map((i) => (
                                    <div
                                        key={i}
                                        className="flex-1 h-1 rounded-full transition-all duration-300"
                                        style={{
                                            background: i < passwordStrength ? strengthColor : "rgba(255,255,255,0.08)"
                                        }}
                                    />
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-x-3 gap-y-1">
                                {PASSWORD_RULES.map((rule) => (
                                    <span
                                        key={rule.label}
                                        className="flex items-center gap-1 text-xs transition-colors"
                                        style={{ color: rule.test(password) ? "#86efac" : "rgba(255,255,255,0.3)" }}
                                    >
                                        <Check className="w-3 h-3" />
                                        {rule.label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Confirm Password */}
                <div>
                    <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">Confirm Password</label>
                    <div className="relative">
                        <Lock
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors"
                            style={{ color: focusedField === "confirm" ? "#a78bfa" : "rgba(255,255,255,0.25)" }}
                        />
                        <input
                            id="signup-confirm"
                            type={showPassword ? "text" : "password"}
                            placeholder="Repeat your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            onFocus={() => setFocusedField("confirm")}
                            onBlur={() => setFocusedField(null)}
                            required
                            className="w-full rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/20 outline-none text-sm"
                            style={{
                                ...inputStyle("confirm"),
                                border:
                                    confirmPassword.length > 0
                                        ? password === confirmPassword
                                            ? "1px solid rgba(52,211,153,0.4)"
                                            : "1px solid rgba(239,68,68,0.4)"
                                        : inputStyle("confirm").border
                            }}
                        />
                        {confirmPassword.length > 0 && (
                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                                {password === confirmPassword ? (
                                    <Check className="w-4 h-4 text-emerald-400" />
                                ) : (
                                    <span className="text-red-400 text-xs">✕</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Terms */}
                <label className="flex items-start gap-2.5 cursor-pointer group">
                    <div
                        className="relative mt-0.5 w-4 h-4 rounded flex-shrink-0 flex items-center justify-center transition-all"
                        style={{
                            background: termsAccepted ? "linear-gradient(135deg, #7c3aed, #4f46e5)" : "rgba(255,255,255,0.05)",
                            border: termsAccepted ? "1px solid rgba(139,92,246,0.8)" : "1px solid rgba(255,255,255,0.15)",
                            boxShadow: termsAccepted ? "0 0 10px rgba(139,92,246,0.3)" : "none"
                        }}
                        onClick={() => setTermsAccepted(!termsAccepted)}
                    >
                        {termsAccepted && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span className="text-white/40 text-xs leading-relaxed group-hover:text-white/60 transition-colors">
                        I agree to the{" "}
                        <a
                            href="#terms"
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById("terms")?.scrollIntoView({ behavior: "smooth", block: "start" });
                                window.history.replaceState(null, "", "#terms");
                            }}
                            className="text-purple-400 hover:text-purple-300 transition-colors"
                        >
                            Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                            href="#privacy"
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById("privacy")?.scrollIntoView({ behavior: "smooth", block: "start" });
                                window.history.replaceState(null, "", "#privacy");
                            }}
                            className="text-purple-400 hover:text-purple-300 transition-colors"
                        >
                            Privacy Policy
                        </a>
                        . DeFi access is provided as-is; trade responsibly.
                    </span>
                </label>

                {/* Submit */}
                <button
                    type="submit"
                    id="signup-submit"
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
                                Creating account...
                            </>
                        ) : (
                            <>
                                Create Account
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </>
                        )}
                    </span>
                </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                <span className="text-white/25 text-xs">or sign up with</span>
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
            </div>

            <SocialAuthButtons />

            {/* Toggle to sign in */}
            <p className="text-center text-white/30 text-xs mt-5">
                Already have an account?{" "}
                <button onClick={onToggle} className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                    Sign in
                </button>
            </p>
        </div>
    );
}
