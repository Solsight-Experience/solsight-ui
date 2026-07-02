"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, KeyRound, Lock, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { requestPasswordResetOtpApi, resetPasswordApi, verifyPasswordResetOtpApi } from "@/features/auth/authservice";
import { getErrorMessage } from "@/lib/error-utils";

type Step = "email" | "otp" | "password" | "success";

interface ForgotPasswordFormProps {
    initialEmail?: string;
    onBack: () => void;
}

const PASSWORD_RULES = [
    { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
    { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
    { label: "One number", test: (p: string) => /\d/.test(p) }
];

const STEPS: { key: Step; label: string }[] = [
    { key: "email", label: "Email" },
    { key: "otp", label: "Verify OTP" },
    { key: "password", label: "Change" }
];

function stepIndex(step: Step) {
    if (step === "success") return 3;
    return STEPS.findIndex((s) => s.key === step);
}

export default function ForgotPasswordForm({ initialEmail = "", onBack }: ForgotPasswordFormProps) {
    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState(initialEmail);
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    const inputStyle = (field: string) => ({
        background: focusedField === field ? "rgba(139,92,246,0.06)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${focusedField === field ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.08)"}`,
        boxShadow: focusedField === field ? "0 0 0 3px rgba(139,92,246,0.1), 0 0 20px rgba(139,92,246,0.08)" : "none",
        transition: "all 0.2s ease"
    });

    const passwordStrength = PASSWORD_RULES.filter((r) => r.test(password)).length;
    const strengthColor = ["#ef4444", "#f59e0b", "#10b981"][Math.min(passwordStrength - 1, 2)] ?? "rgba(255,255,255,0.1)";
    const currentStep = stepIndex(step);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            await requestPasswordResetOtpApi(email.trim());
            toast.success("OTP sent. Check your email inbox.");
            setStep("otp");
        } catch (err: unknown) {
            setError(getErrorMessage(err, "Failed to send OTP. Please try again."));
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        const digit = value.replace(/\D/g, "").slice(-1);
        const chars = otp.padEnd(6, " ").split("");
        chars[index] = digit || " ";
        const joined = chars.join("").replace(/\s/g, "").slice(0, 6);
        setOtp(joined);
        setError("");

        if (digit && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        setOtp(pasted);
        setError("");
        const focusIndex = Math.min(pasted.length, 5);
        otpRefs.current[focusIndex]?.focus();
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError("Please enter the 6-digit OTP code.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            await verifyPasswordResetOtpApi({ email: email.trim(), otp });
            toast.success("OTP verified. You can now set a new password.");
            setStep("password");
        } catch (err: unknown) {
            setError(getErrorMessage(err, "Invalid or expired OTP. Please check and try again."));
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (!PASSWORD_RULES.every((r) => r.test(password))) {
            setError("Password does not meet the security requirements.");
            return;
        }

        setIsLoading(true);

        try {
            await resetPasswordApi({ email: email.trim(), otp, password });
            toast.success("Password updated successfully.");
            setStep("success");
        } catch (err: unknown) {
            setError(getErrorMessage(err, "Failed to reset password. Please try again."));
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setIsLoading(true);
        setError("");
        setOtp("");

        try {
            await requestPasswordResetOtpApi(email.trim());
            toast.success("A new OTP has been sent to your email.");
        } catch (err: unknown) {
            setError(getErrorMessage(err, "Failed to resend OTP."));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="w-full rounded-2xl p-7"
            style={{
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(255,255,255,0.08)"
            }}
        >
            <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-xs mb-5 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to sign in
            </button>

            {step !== "success" && (
                <div className="flex items-center gap-2 mb-7">
                    {STEPS.map((s, i) => {
                        const done = currentStep > i;
                        const active = currentStep === i;
                        return (
                            <div key={s.key} className="flex items-center gap-2 flex-1 min-w-0">
                                <div
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all"
                                    style={{
                                        background: done || active ? "linear-gradient(135deg, #7c3aed, #a855f7)" : "rgba(255,255,255,0.06)",
                                        border: active ? "1px solid rgba(167,139,250,0.8)" : "1px solid rgba(255,255,255,0.1)",
                                        color: done || active ? "#fff" : "rgba(255,255,255,0.35)",
                                        boxShadow: active ? "0 0 16px rgba(124,58,237,0.4)" : "none"
                                    }}
                                >
                                    {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
                                </div>
                                <span className={`text-[10px] font-medium truncate hidden sm:block ${active ? "text-violet-300" : "text-white/30"}`}>
                                    {s.label}
                                </span>
                                {i < STEPS.length - 1 && (
                                    <div className="flex-1 h-px min-w-[8px]" style={{ background: done ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.08)" }} />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {step === "email" && (
                <>
                    <div className="mb-7">
                        <h2 className="text-2xl font-bold text-white mb-1">Forgot password?</h2>
                        <p className="text-white/40 text-sm">Enter your email and we&apos;ll send you a one-time code to reset your password.</p>
                    </div>

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
                        </div>
                    )}

                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <div>
                            <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">Email Address</label>
                            <div className="relative">
                                <Mail
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors"
                                    style={{ color: focusedField === "email" ? "#a78bfa" : "rgba(255,255,255,0.25)" }}
                                />
                                <input
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

                        <SubmitButton isLoading={isLoading} loadingText="Sending OTP..." label="Send OTP" />
                    </form>
                </>
            )}

            {step === "otp" && (
                <>
                    <div className="mb-7">
                        <h2 className="text-2xl font-bold text-white mb-1">Check your email</h2>
                        <p className="text-white/40 text-sm">
                            We sent a 6-digit code to <span className="text-violet-300 font-medium">{email}</span>
                        </p>
                    </div>

                    {error && (
                        <div
                            className="mb-5 p-3.5 rounded-xl text-sm"
                            style={{
                                background: "rgba(245,158,11,0.08)",
                                border: "1px solid rgba(245,158,11,0.35)",
                                color: "#fcd34d"
                            }}
                        >
                            <div className="flex items-start gap-2.5">
                                <span className="mt-0.5 shrink-0">⚠</span>
                                <span>{error}</span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleVerifyOtp} className="space-y-5">
                        <div>
                            <label className="block text-white/60 text-xs font-medium mb-3 uppercase tracking-wider text-center">Enter verification code</label>
                            <div className="flex justify-center gap-2 sm:gap-2.5">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <input
                                        key={i}
                                        ref={(el) => {
                                            otpRefs.current[i] = el;
                                        }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={otp[i] ?? ""}
                                        onChange={(e) => handleOtpChange(i, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                        onPaste={handleOtpPaste}
                                        onFocus={() => setFocusedField(`otp-${i}`)}
                                        onBlur={() => setFocusedField(null)}
                                        className="w-10 h-12 sm:w-11 sm:h-12 rounded-xl text-center text-lg font-bold text-white outline-none"
                                        style={inputStyle(`otp-${i}`)}
                                    />
                                ))}
                            </div>
                        </div>

                        <SubmitButton isLoading={isLoading} loadingText="Verifying..." label="Verify OTP" />

                        <p className="text-center text-white/30 text-xs">
                            Didn&apos;t receive the code?{" "}
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={isLoading}
                                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors disabled:opacity-50"
                            >
                                Resend OTP
                            </button>
                        </p>
                    </form>
                </>
            )}

            {step === "password" && (
                <>
                    <div className="mb-7">
                        <h2 className="text-2xl font-bold text-white mb-1">Set new password</h2>
                        <p className="text-white/40 text-sm">Choose a strong password for your account.</p>
                    </div>

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
                        </div>
                    )}

                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <PasswordField
                            id="new-password"
                            label="New Password"
                            value={password}
                            show={showPassword}
                            onToggle={() => setShowPassword(!showPassword)}
                            onChange={setPassword}
                            focusedField={focusedField}
                            setFocusedField={setFocusedField}
                            inputStyle={inputStyle}
                        />

                        {password.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex gap-1">
                                    {PASSWORD_RULES.map((_, i) => (
                                        <div
                                            key={i}
                                            className="h-1 flex-1 rounded-full transition-all"
                                            style={{ background: i < passwordStrength ? strengthColor : "rgba(255,255,255,0.08)" }}
                                        />
                                    ))}
                                </div>
                                <div className="space-y-1">
                                    {PASSWORD_RULES.map((rule) => (
                                        <div key={rule.label} className="flex items-center gap-2 text-xs">
                                            <span style={{ color: rule.test(password) ? "#34d399" : "rgba(255,255,255,0.25)" }}>
                                                {rule.test(password) ? "✓" : "○"}
                                            </span>
                                            <span style={{ color: rule.test(password) ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.25)" }}>
                                                {rule.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <PasswordField
                            id="confirm-password"
                            label="Confirm Password"
                            value={confirmPassword}
                            show={showConfirmPassword}
                            onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                            onChange={setConfirmPassword}
                            focusedField={focusedField}
                            setFocusedField={setFocusedField}
                            inputStyle={inputStyle}
                        />

                        <SubmitButton isLoading={isLoading} loadingText="Updating..." label="Update password" icon={KeyRound} />
                    </form>
                </>
            )}

            {step === "success" && (
                <div className="flex flex-col items-center text-center py-4">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                        style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)" }}
                    >
                        <ShieldCheck className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Password updated</h2>
                    <p className="text-white/40 text-sm mb-7">Your password has been reset. You can now sign in with your new credentials.</p>
                    <button
                        type="button"
                        onClick={onBack}
                        className="w-full rounded-xl py-3.5 font-semibold text-sm text-white transition-all"
                        style={{
                            background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4f46e5 100%)",
                            boxShadow: "0 0 30px rgba(139,92,246,0.35)"
                        }}
                    >
                        Back to sign in
                    </button>
                </div>
            )}
        </div>
    );
}

function SubmitButton({ isLoading, loadingText, label, icon: Icon }: { isLoading: boolean; loadingText: string; label: string; icon?: typeof ArrowRight }) {
    return (
        <button
            type="submit"
            disabled={isLoading}
            className="w-full relative overflow-hidden rounded-xl py-3.5 font-semibold text-sm text-white transition-all group"
            style={{
                background: isLoading ? "rgba(139,92,246,0.3)" : "linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4f46e5 100%)",
                boxShadow: isLoading ? "none" : "0 0 30px rgba(139,92,246,0.35), 0 4px 15px rgba(139,92,246,0.2)"
            }}
        >
            <span className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                    <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {loadingText}
                    </>
                ) : (
                    <>
                        {label}
                        {Icon ? <Icon className="w-4 h-4" /> : <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
                    </>
                )}
            </span>
        </button>
    );
}

function PasswordField({
    id,
    label,
    value,
    show,
    onToggle,
    onChange,
    focusedField,
    setFocusedField,
    inputStyle
}: {
    id: string;
    label: string;
    value: string;
    show: boolean;
    onToggle: () => void;
    onChange: (v: string) => void;
    focusedField: string | null;
    setFocusedField: (v: string | null) => void;
    inputStyle: (field: string) => React.CSSProperties;
}) {
    return (
        <div>
            <label htmlFor={id} className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
                {label}
            </label>
            <div className="relative">
                <Lock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors"
                    style={{ color: focusedField === id ? "#a78bfa" : "rgba(255,255,255,0.25)" }}
                />
                <input
                    id={id}
                    type={show ? "text" : "password"}
                    placeholder="••••••••••"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setFocusedField(id)}
                    onBlur={() => setFocusedField(null)}
                    required
                    className="w-full rounded-xl py-3 pl-10 pr-11 text-white placeholder:text-white/20 outline-none text-sm"
                    style={inputStyle(id)}
                />
                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#a78bfa")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
                >
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
}
