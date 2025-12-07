// contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    login: (user: User) => void;
    logout: () => Promise<void>;
    setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await fetch('/api/auth/verify', {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    const login = (user: User) => {
        setUser(user);
        setIsAuthenticated(true);

        const urlParams = new URLSearchParams(window.location.search);
        const redirectTo = urlParams.get('redirect') || '/';
        router.push(redirectTo);
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include', // để gửi cookie lên BE
            });
        } catch (err) {
            console.error("Logout API error:", err);
        }

        // FE xoá state
        setUser(null);
        setIsAuthenticated(false);

        // Điều hướng
        router.push('/');
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                isLoading,
                user,
                login,
                logout,
                setUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
