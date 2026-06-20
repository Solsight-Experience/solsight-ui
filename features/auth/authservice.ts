import bs58 from "bs58";

import apiClient from "@/lib/network-requests/api-client";

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

export interface VerifyEmailResponse {
    message: string;
}

export interface ResendVerificationResponse {
    message: string;
}

export interface SolanaLoginPayload {
    walletAddress: string;
    signature: string;
    walletIcon: string;
}

export interface SolanaWalletLoginPayload {
    walletAddress: string;
    walletIcon: string;
    signMessage: (message: Uint8Array) => Promise<Uint8Array>;
}

export async function loginApi(payload: LoginPayload): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>("/auth/login", payload);
}
export async function signupApi(payload: SignUpPayload): Promise<SignUpResponse> {
    return apiClient.post<SignUpResponse>("/auth/register", payload);
}
export async function verifyEmailApi(token: string): Promise<VerifyEmailResponse> {
    return apiClient.post<VerifyEmailResponse>("/auth/verify-email", { token });
}
export async function resendVerificationApi(email: string): Promise<ResendVerificationResponse> {
    return apiClient.post<ResendVerificationResponse>("/auth/resend-verification", { email });
}
export const callOAuthLoginApi = async (token: string) => {
    return apiClient.post<LoginResponse>("/auth/oauth-login", { token, provider: "google" });
};
export async function logout(): Promise<boolean> {
    await apiClient.post("/auth/logout");
    window.location.href = "/login";
    return true;
}

export async function getSolanaNonceMessage(walletAddress: string): Promise<Uint8Array> {
    const { nonce } = await apiClient.get<{ nonce: string }>("/auth/solana/nonce", {
        params: { walletAddress }
    });

    return new TextEncoder().encode(nonce);
}

export async function signSolanaNonce(walletAddress: string, signMessage: (message: Uint8Array) => Promise<Uint8Array>): Promise<string> {
    const messageBytes = await getSolanaNonceMessage(walletAddress);
    const signature = await signMessage(messageBytes);

    return bs58.encode(signature);
}

export async function loginWithSolanaApi(payload: SolanaLoginPayload | SolanaWalletLoginPayload): Promise<LoginResponse> {
    const signature = "signature" in payload ? payload.signature : await signSolanaNonce(payload.walletAddress, payload.signMessage);

    return apiClient.post<LoginResponse>("/auth/solana/login", {
        walletAddress: payload.walletAddress,
        signature,
        walletIcon: payload.walletIcon
    });
}
