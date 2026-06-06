"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { callOAuthLoginApi } from "@/features/auth/authservice";

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

    return (
        <div className="space-y-3">
            {/* Google Sign-In Button */}
            <div ref={googleButtonRef} className="w-full flex items-center justify-center" style={{ minHeight: "44px" }} />
        </div>
    );
}
