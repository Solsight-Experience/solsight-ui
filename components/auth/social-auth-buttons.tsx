"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { callOAuthLoginApi, loginWithSolanaApi } from "@/features/auth/authservice";

interface PhantomSolanaProvider {
    isPhantom?: boolean;
    connect: () => Promise<{ publicKey: { toString: () => string } }>;
    signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
}

interface PhantomWindow {
    phantom?: {
        solana?: PhantomSolanaProvider;
    };
    solana?: PhantomSolanaProvider;
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

interface GoogleCredentialResponse {
    credential?: string;
}

export default function SocialAuthButtons() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();
    const { wallet, wallets, select, connect } = useWallet();
    const googleButtonRef = useRef<HTMLDivElement>(null);
    const isInitialized = useRef(false);

    // Pin các giá trị vào ref để tránh stale closure trong Google GSI callback
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
            if (!response || !response.credential) {
                console.error("Google Sign-In did not return a credential", response);
                toast.error("Google login failed. No credential returned.");
                return;
            }

            const token = response.credential;
            const data = await callOAuthLoginApi(token);

            if (!data.user) {
                throw new Error("Invalid login response: missing user data");
            }

            // Dùng ref để đảm bảo luôn lấy giá trị mới nhất
            loginRef.current(data.user);

            const finalRedirectTo = redirectToRef.current;
            routerRef.current.push(finalRedirectTo);
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
            if (!clientId) {
                console.error("NEXT_PUBLIC_GOOGLE_CLIENT_ID not found");
                return;
            }

            try {
                // Initialize Google Sign-In
                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: handleCredentialResponse
                });

                // Render button
                window.google.accounts.id.renderButton(googleButtonRef.current, {
                    theme: "outline",
                    size: "large",
                    width: googleButtonRef.current.offsetWidth,
                    text: "signin_with",
                    shape: "rectangular",
                    logo_alignment: "left"
                });

                isInitialized.current = true;
                console.log("Google Sign-In initialized");
            } catch (error) {
                console.error("Failed to initialize Google Sign-In:", error);
            }
        };

        // Load Google SDK
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => {
            // Đảm bảo SDK đã tải xong
            setTimeout(initializeGoogleSignIn, 100);
        };
        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    const [isPhantomLoading, setIsPhantomLoading] = useState(false);
    const [isSolflareLoading, setIsSolflareLoading] = useState(false);

    const handlePhantomLogin = async () => {
        setIsPhantomLoading(true);
        try {
            if (typeof window === "undefined") return;
            const phantomWindow = window as unknown as PhantomWindow;
            const provider = phantomWindow.phantom?.solana || phantomWindow.solana;
            if (!provider || !provider.isPhantom) {
                window.open("https://phantom.app/", "_blank");
                toast.error("Phantom Wallet not found. Please install the Phantom extension.");
                return;
            }

            const connectionResp = await provider.connect();
            const walletAddress = connectionResp.publicKey.toString();

            const data = await loginWithSolanaApi({
                walletAddress,
                walletIcon: "phantom",
                signMessage: async (messageBytes) => {
                    const { signature } = await provider.signMessage(messageBytes);

                    return signature;
                }
            });

            if (!data.user) {
                throw new Error("Invalid login response from server");
            }

            loginRef.current(data.user);
            toast.success("Wallet login successful!");
            const finalRedirectTo = redirectToRef.current;
            routerRef.current.push(finalRedirectTo);
        } catch (error) {
            console.error("Phantom login failed:", error);
            const errorMessage = error instanceof Error ? error.message : "Phantom login failed. Please try again.";
            toast.error(errorMessage);
        } finally {
            setIsPhantomLoading(false);
        }
    };

    const handleSolflareLogin = async () => {
        setIsSolflareLoading(true);
        try {
            const solflare = wallets.find((candidate) => candidate.adapter.name === "Solflare");
            if (!solflare) {
                window.open("https://solflare.com/", "_blank");
                toast.error("Solflare Wallet not found. Please install the Solflare extension.");
                return;
            }

            // Select the Solflare adapter (if not already) and ensure it is connected.
            if (wallet?.adapter.name !== "Solflare") {
                select(solflare.adapter.name);
                // Wait briefly for the adapter to become the active wallet.
                const startedAt = Date.now();
                while (Date.now() - startedAt < 1000) {
                    if (wallets.find((c) => c.adapter.name === "Solflare")?.adapter) break;
                    await new Promise((resolve) => window.setTimeout(resolve, 25));
                }
            }
            if (!solflare.adapter.connected) {
                await connect();
            }

            const walletAddress = solflare.adapter.publicKey?.toBase58();
            if (!walletAddress) throw new Error("Failed to get public key from Solflare");

            const signer = solflare.adapter as unknown as { signMessage?: (message: Uint8Array) => Promise<Uint8Array> };
            if (!signer.signMessage) throw new Error("Solflare does not support message signing");

            const data = await loginWithSolanaApi({
                walletAddress,
                walletIcon: "solflare",
                signMessage: (messageBytes) => signer.signMessage!(messageBytes)
            });

            if (!data.user) {
                throw new Error("Invalid login response from server");
            }

            loginRef.current(data.user);
            toast.success("Wallet login successful!");
            const finalRedirectTo = redirectToRef.current;
            routerRef.current.push(finalRedirectTo);
        } catch (error) {
            console.error("Solflare login failed:", error);
            const errorMessage = error instanceof Error ? error.message : "Solflare login failed. Please try again.";
            toast.error(errorMessage);
        } finally {
            setIsSolflareLoading(false);
        }
    };

    return (
        <div className="space-y-3">
            {/* Google Sign-In Button */}
            <div ref={googleButtonRef} className="w-full flex items-center justify-center" style={{ minHeight: "44px" }} />

            {/* Phantom Sign-In Button */}
            <Button
                type="button"
                variant="outline"
                onClick={handlePhantomLogin}
                disabled={isPhantomLoading}
                className="w-full flex items-center justify-center gap-3 h-11 rounded-xl border font-semibold text-sm transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed border-[rgba(171,159,242,0.2)] bg-[rgba(171,159,242,0.1)] text-white hover:bg-[rgba(171,159,242,0.18)] hover:border-[rgba(171,159,242,0.4)] hover:shadow-[0_0_20px_rgba(171,159,242,0.2)] hover:-translate-y-0.5 active:translate-y-0 shadow-[0_4px_12px_rgba(171,159,242,0.05)] cursor-pointer"
            >
                <div className="relative w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                    <Image src="/wallet_logo/phantom.svg" alt="Phantom Wallet" fill className="object-contain" />
                </div>
                <span className="font-semibold text-sm tracking-wide">{isPhantomLoading ? "Connecting Phantom..." : "Continue with Phantom"}</span>
            </Button>

            {/* Solflare Sign-In Button */}
            <Button
                type="button"
                variant="outline"
                onClick={handleSolflareLogin}
                disabled={isSolflareLoading}
                className="w-full flex items-center justify-center gap-3 h-11 rounded-xl border font-semibold text-sm transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed border-[rgba(255,153,0,0.2)] bg-[rgba(255,153,0,0.1)] text-white hover:bg-[rgba(255,153,0,0.18)] hover:border-[rgba(255,153,0,0.4)] hover:shadow-[0_0_20px_rgba(255,153,0,0.2)] hover:-translate-y-0.5 active:translate-y-0 shadow-[0_4px_12px_rgba(255,153,0,0.05)] cursor-pointer"
            >
                <div className="relative w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                    <Image src="/wallet_logo/solflare.svg" alt="Solflare Wallet" fill className="object-contain" />
                </div>
                <span className="font-semibold text-sm tracking-wide">{isSolflareLoading ? "Connecting Solflare..." : "Continue with Solflare"}</span>
            </Button>
        </div>
    );
}
