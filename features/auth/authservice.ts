export interface User {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: User;
    message?: string;
}

export interface SignUpPayload {
    email: string;
    password: string;
}

export interface SignUpResponse {
    message?: string;
}

export async function loginApi(payload: LoginPayload): Promise<LoginResponse> {
    const response = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Login failed");
    }

    return data;
}
export async function signupApi(payload: SignUpPayload): Promise<SignUpResponse> {
    const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // nếu server set cookie
        body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Sign up failed");
    }

    return data;
}
export const callOAuthLoginApi = async (token: string) => {
    const response = await fetch("/api/auth/oauth-login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ token, provider: "google" })
    });

    if (!response.ok) {
        throw new Error("OAuth login failed");
    }

    return response.json();
};
export async function logout(): Promise<boolean> {
    const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
    });

    if (!res.ok) {
        throw new Error("Logout failed");
    }

    window.location.href = "/login";
    return true;
}
