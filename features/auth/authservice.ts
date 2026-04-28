import apiClient from "@/lib/api-client";

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
    return apiClient.post<LoginResponse>("/api/auth/login", payload);
}

export async function signupApi(payload: SignUpPayload): Promise<SignUpResponse> {
    return apiClient.post<SignUpResponse>("/api/auth/register", payload);
}

export const callOAuthLoginApi = async (token: string) => {
    return apiClient.post("/api/auth/oauth-login", { token, provider: "google" });
};

export async function logout(): Promise<boolean> {
    await apiClient.post("/api/auth/logout");
    window.location.href = "/login";
    return true;
}
