"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import type { LoginResponse } from "@/features/auth/authservice";
import { callOAuthLoginApi } from "@/features/auth/authservice";
import { useWalletLogin } from "@/features/wallets/hooks/useWalletLogin";
import { SUPPORTED_WALLETS } from "@/features/wallets/lib/wallet-registry";

interface GoogleCredentialResponse {
    credential?: string;
}

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: { client_id: string; callback: (response: GoogleCredentialResponse) => void }) => void;
                    renderButton: (element: HTMLElement, config: Record<string, unknown>) => void;
                };
            };
        };
    }
}

export default function SocialAuthButtons() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();
    const { loginWithWallet, loading } = useWalletLogin();
    const googleButtonRef = useRef<HTMLDivElement>(null);
    const isInitialized = useRef(false);

    const routerRef = useRef(router);
    const loginRef = useRef(login);
    const redirectToRef = useRef(searchParams.get("redirect") || "/");

    useEffect(() => {
        routerRef.current = router;
    }, [router]);
    useEffect(() => {
        loginRef.current = login;
    }, [login]);
    useEffect(() => {
        redirectToRef.current = searchParams.get("redirect") || "/";
    }, [searchParams]);

    const handleCredentialResponse = async (response: GoogleCredentialResponse) => {
        try {
            if (!response?.credential) {
                toast.error("Google login failed. No credential returned.");
                return;
            }
            const data = await callOAuthLoginApi(response.credential);
            if (!data.user) throw new Error("Invalid login response: missing user data");
            loginRef.current(data.user);
            routerRef.current.push(redirectToRef.current);
        } catch (error) {
            console.error("Google login failed:", error);
            toast.error("Google login failed. Please try again.");
        }
    };

    useEffect(() => {
        if (isInitialized.current) return;

        const initializeGoogleSignIn = () => {
            if (!window.google || !googleButtonRef.current) return;
            const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
            if (!clientId) return;
            try {
                window.google.accounts.id.initialize({ client_id: clientId, callback: handleCredentialResponse });
                window.google.accounts.id.renderButton(googleButtonRef.current, {
                    theme: "outline",
                    size: "large",
                    width: googleButtonRef.current.offsetWidth,
                    text: "signin_with",
                    shape: "rectangular",
                    logo_alignment: "left"
                });
                isInitialized.current = true;
            } catch (error) {
                console.error("Failed to initialize Google Sign-In:", error);
            }
        };

        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => setTimeout(initializeGoogleSignIn, 100);
        document.body.appendChild(script);
        return () => {
            if (document.body.contains(script)) document.body.removeChild(script);
        };
    }, []);

    const handleWalletLogin = async (walletName: string) => {
        try {
            const data: LoginResponse | null = await loginWithWallet(walletName);
            if (!data) return;
            if (!data.user) throw new Error("Invalid login response from server");
            loginRef.current(data.user);
            toast.success("Wallet login successful!");
            routerRef.current.push(redirectToRef.current);
        } catch (error) {
            const msg = error instanceof Error ? error.message : `${walletName} login failed. Please try again.`;
            toast.error(msg);
        }
    };

    const walletStyles: Record<string, string> = {
        Phantom:
            "border-[rgba(171,159,242,0.2)] bg-[rgba(171,159,242,0.1)] hover:bg-[rgba(171,159,242,0.18)] hover:border-[rgba(171,159,242,0.4)] hover:shadow-[0_0_20px_rgba(171,159,242,0.2)] shadow-[0_4px_12px_rgba(171,159,242,0.05)]",
        Solflare:
            "border-[rgba(255,153,0,0.2)] bg-[rgba(255,153,0,0.1)] hover:bg-[rgba(255,153,0,0.18)] hover:border-[rgba(255,153,0,0.4)] hover:shadow-[0_0_20px_rgba(255,153,0,0.2)] shadow-[0_4px_12px_rgba(255,153,0,0.05)]"
    };

    return (
        <div className="space-y-3">
            <div ref={googleButtonRef} className="w-full flex items-center justify-center" style={{ minHeight: "44px" }} />

            {SUPPORTED_WALLETS.map(({ name }) => {
                const isLoading = loading === name;
                return (
                    <Button
                        key={name}
                        type="button"
                        variant="outline"
                        onClick={() => handleWalletLogin(name)}
                        disabled={isLoading}
                        className={`w-full flex items-center justify-center gap-3 h-11 rounded-xl border font-semibold text-sm transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed text-white hover:-translate-y-0.5 active:translate-y-0 cursor-pointer ${walletStyles[name] ?? ""}`}
                    >
                        <div className="relative w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                            <Image src={`/wallet_logo/${name.toLowerCase()}.svg`} alt={`${name} Wallet`} fill className="object-contain" />
                        </div>
                        <span className="font-semibold text-sm tracking-wide">{isLoading ? `Connecting ${name}...` : `Continue with ${name}`}</span>
                    </Button>
                );
            })}
        </div>
    );
}
