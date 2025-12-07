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
            const { user } = await callOAuthLoginApi(token);
            document.cookie = `auth_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; SameSite=Lax`;
            login();
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

    return (
        <div className="space-y-3">
            {/* Google Sign-In Button */}
            <div
                ref={googleButtonRef}
                className="w-full flex items-center justify-center"
                style={{ minHeight: '44px' }}
            />

        </div>
    );
}
