// contexts/AuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api-client";

interface User {
    id: string;
    name?: string;
    email: string;
    avatar?: string;
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

    // Load user từ localStorage khi component mount
    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
                setIsAuthenticated(true);
            } catch (error) {
                console.error("Failed to parse saved user:", error);
                localStorage.removeItem("user");
            }
        }
        setIsLoading(false);
    }, []);

    const login = (user: User) => {
        setUser(user);
        setIsAuthenticated(true);
        // Lưu user vào localStorage
        localStorage.setItem("user", JSON.stringify(user));
    };

    const logout = async () => {
        try {
            await apiClient.post("/auth/logout");
        } catch (err) {
            console.error("Logout API error:", err);
        }

        // Xóa state và localStorage
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem("user");

        // Điều hướng
        router.push("/");
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                isLoading,
                user,
                login,
                logout,
                setUser
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
