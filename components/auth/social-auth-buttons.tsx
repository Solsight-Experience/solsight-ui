'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { callOAuthLoginApi } from '@/features/auth/authservice';

declare global {
    interface Window {
        google?: any;
    }
}

export default function SocialAuthButtons() {
    const router = useRouter();
    const { login } = useAuth();
    const googleButtonRef = useRef<HTMLDivElement>(null);
    const isInitialized = useRef(false);

    const handleCredentialResponse = async (response: any) => {
        try {
            if (!response || !response.credential) {
                console.error('Google Sign-In did not return a credential', response);
                alert('Google login failed. No credential returned.');
                return;
            }

            console.log("Google credential received:", response.credential);

            const token = response.credential;
            const data = await callOAuthLoginApi(token);

            // Lưu user vào AuthContext và localStorage
            if (data.user) {
                login(data.user);
            }

            // Redirect về trang chủ
            router.push('/');
        } catch (error) {
            console.error('Google login failed:', error);
            alert('Google login failed. Please try again.');
        }
    };

    useEffect(() => {
        if (isInitialized.current) return;

        const initializeGoogleSignIn = () => {
            if (!window.google || !googleButtonRef.current) return;

            const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
            if (!clientId) {
                console.error('NEXT_PUBLIC_GOOGLE_CLIENT_ID not found');
                return;
            }

            try {
                // Initialize Google Sign-In
                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: handleCredentialResponse,
                });

                // Render button
                window.google.accounts.id.renderButton(
                    googleButtonRef.current,
                    {
                        theme: 'outline',
                        size: 'large',
                        width: googleButtonRef.current.offsetWidth,
                        text: 'signin_with',
                        shape: 'rectangular',
                        logo_alignment: 'left',
                    }
                );

                isInitialized.current = true;
                console.log('Google Sign-In initialized');
            } catch (error) {
                console.error('Failed to initialize Google Sign-In:', error);
            }
        };

        // Load Google SDK
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
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

    const handleWalletConnect = () => {
        alert('Wallet connection coming soon!');
    };

    return (
        <div className="space-y-3">
            {/* Google Sign-In Button */}
            <div
                ref={googleButtonRef}
                className="w-full flex items-center justify-center"
                style={{ minHeight: '44px' }}
            />

            <button
                type="button"
                onClick={handleWalletConnect}
                className="w-full flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] border border-slate-700"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 7h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 4h4v3h-4V4zm10 16H4V9h16v11zm-8-9c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
                Connect Wallet
            </button>
        </div>
    );
}
