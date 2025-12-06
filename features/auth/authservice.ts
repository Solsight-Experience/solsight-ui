export interface LoginPayload {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: any;
    message?: string;
}
export async function loginApi(payload: LoginPayload): Promise<LoginResponse> {
    const response = await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại');
    }

    return data; // ← QUAN TRỌNG: Phải có return
}

export async function logout(): Promise<boolean> {
    const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
    });

    if (!res.ok) {
        throw new Error("Logout failed");
    }

    window.location.href = '/login';
    return true;
}