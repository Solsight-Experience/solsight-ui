"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { UserResponseDto } from "@/types/dto";
import apiClient from "@/lib/network-requests/api-client";
import { API_ENDPOINTS } from "@/lib/constants";
import Cookies from "js-cookie";

interface AuthContextType {
    user: UserResponseDto | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    register: (email: string, password: string, publicKey: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserResponseDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = !!user;

    // Check for existing auth on mount
    useEffect(() => {
        const token = Cookies.get("auth_token");
        if (token) {
            // Verify token and get user profile
            fetchUserProfile();
        } else {
            setIsLoading(false);
        }
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await apiClient.get<UserResponseDto>(API_ENDPOINTS.AUTH.PROFILE);
            setUser(response);
        } catch {
            // Token is invalid, remove it
            Cookies.remove("auth_token");
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await apiClient.post<{ accessToken: string; user: UserResponseDto }>(API_ENDPOINTS.AUTH.LOGIN, {
                email,
                password
            });

            Cookies.set("auth_token", response.accessToken, {
                expires: 7, // 7 days
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production"
            });
            setUser(response.user);
        } catch (error) {
            throw error;
        }
    };

    const register = async (email: string, password: string, publicKey: string) => {
        try {
            const response = await apiClient.post<{ accessToken: string; user: UserResponseDto }>(API_ENDPOINTS.AUTH.REGISTER, {
                email,
                password,
                publicKey
            });

            Cookies.set("auth_token", response.accessToken, {
                expires: 7, // 7 days
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production"
            });
            setUser(response.user);
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        Cookies.remove("auth_token");
        setUser(null);
        // Optionally call backend logout endpoint
        apiClient.post(API_ENDPOINTS.AUTH.LOGOUT).catch(() => {
            // Ignore errors on logout
        });
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated,
                login,
                logout,
                register
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
