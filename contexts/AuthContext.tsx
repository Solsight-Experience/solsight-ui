'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    email: string;
    name: string;
    avatar?: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user?: User | null;
    login: (token: string, user: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    user: null,
    login: () => { },
    logout: () => { },
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Kiểm tra token khi load trang
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        if (token && userData && userData !== 'undefined') {
            try {
                setIsAuthenticated(true);
                setUser(JSON.parse(userData));
            } catch (error) {
                console.error('Failed to parse userData:', error);
                // Clear invalid data
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
            }
        }
    }, []);

    const login = (token: string, user: User) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(user));
        setIsAuthenticated(true);
        setUser(user);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        setIsAuthenticated(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
