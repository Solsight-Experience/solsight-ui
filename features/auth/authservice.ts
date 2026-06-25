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
    nonce?: string;
    message?: string;
}

export interface SolanaWalletLoginPayload {
    walletAddress: string;
    walletIcon: string;
    signMessage: (message: Uint8Array) => Promise<Uint8Array>;
}

export interface SolanaSignInPayload {
    nonce: string;
    message: string;
    messageBytes: Uint8Array;
}

export interface SolanaSignedMessagePayload {
    nonce: string;
    message: string;
    signature: string;
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

export function buildSolanaSignInMessage(nonce: string): string {
    return ["Sign in to SolSight", "", `Nonce: ${nonce}`, "", "By signing, you agree to SolSight's Terms of Use & Privacy Policy"].join("\n");
}

export async function getSolanaSignInPayload(walletAddress: string): Promise<SolanaSignInPayload> {
    const { nonce } = await apiClient.get<{ nonce: string }>("/auth/solana/nonce", {
        params: { walletAddress }
    });

    const message = buildSolanaSignInMessage(nonce);
    return {
        nonce,
        message,
        messageBytes: new TextEncoder().encode(message)
    };
}

export async function getSolanaNonceMessage(walletAddress: string): Promise<Uint8Array> {
    const { messageBytes } = await getSolanaSignInPayload(walletAddress);
    return messageBytes;
}

export async function signSolanaNonce(walletAddress: string, signMessage: (message: Uint8Array) => Promise<Uint8Array>): Promise<SolanaSignedMessagePayload> {
    const { nonce, message, messageBytes } = await getSolanaSignInPayload(walletAddress);
    const signature = await signMessage(messageBytes);

    return {
        nonce,
        message,
        signature: bs58.encode(signature)
    };
}

export async function loginWithSolanaApi(payload: SolanaLoginPayload | SolanaWalletLoginPayload): Promise<LoginResponse> {
    const signedPayload =
        "signature" in payload
            ? {
                  signature: payload.signature,
                  nonce: payload.nonce,
                  message: payload.message
              }
            : await signSolanaNonce(payload.walletAddress, payload.signMessage);

    return apiClient.post<LoginResponse>("/auth/solana/login", {
        walletAddress: payload.walletAddress,
        signature: signedPayload.signature,
        walletIcon: payload.walletIcon,
        nonce: signedPayload.nonce,
        message: signedPayload.message
    });
}
