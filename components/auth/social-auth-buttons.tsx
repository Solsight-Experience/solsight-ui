'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useWalletAuth } from './useWalletAuth';

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
    const { handleWalletConnect } = useWalletAuth();

    const handleCredentialResponse = async (response: any) => {
        try {
            if (!response || !response.credential) {
                console.error('Google Sign-In did not return a credential', response);
                alert('Google login failed. No credential returned.');
                return;
            }

            console.log("Google credential received:", response.credential);

            const token = response.credential;

            // Decode JWT an toàn
            const base64Url = token.split('.')[1];
            if (!base64Url) {
                console.error('Invalid token format', token);
                return;
            }

            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const userData = JSON.parse(
                decodeURIComponent(
                    atob(base64)
                        .split('')
                        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                        .join('')
                )
            );

            console.log("User info:", userData);

            // Lưu token và thông tin user vào localStorage
            localStorage.setItem('authToken', token);
            localStorage.setItem('userData', JSON.stringify(userData));

            // Cập nhật state login
            login();

            // Redirect về home
            router.push('/');
        } catch (error) {
            console.error('Google login failed:', error);
            alert('Google login failed. Please try again.');
        }
    };

    useEffect(() => {
        // Tránh initialize nhiều lần
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
            // Đợi một chút để đảm bảo SDK loaded hoàn toàn
            setTimeout(initializeGoogleSignIn, 100);
        };
        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    const wallets = [
        {
            name: 'Phantom',
            icon: '/wallet_logo/phantom.svg',
            label: 'Connect Phantom'
        },
        {
            name: 'MetaMask',
            icon: '/wallet_logo/metamask.svg',
            label: 'Connect MetaMask'
        },
        {
            name: 'WalletConnect',
            icon: '/wallet_logo/walletconnect.svg',
            label: 'Connect WalletConnect'
        }
    ];

    return (
        <div className="space-y-3">
            {/* Google Sign-In Button - SDK sẽ render vào đây */}
            <div
                ref={googleButtonRef}
                className="w-full flex items-center justify-center"
                style={{ minHeight: '44px' }}
            />

            {wallets.map((wallet) => (
                <button
                    key={wallet.name}
                    type="button"
                    onClick={() => handleWalletConnect(wallet.name)}
                    className="relative w-full flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] border border-slate-700"
                >
                    <img 
                        src={wallet.icon} 
                        alt={wallet.name} 
                        className="absolute left-[20px] w-5 h-5 object-contain"
                    />
                    {wallet.label}
                </button>
            ))}
        </div>
    );
}