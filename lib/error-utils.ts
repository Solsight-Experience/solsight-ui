/**
 * Extracts a user-friendly message from an unknown error.
 * Use this in catch blocks to safely handle errors of any type.
 */
export function getErrorMessage(error: unknown, fallback = "An unexpected error occurred"): string {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === "string") {
        return error;
    }
    if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
        return error.message;
    }
    return fallback;
}

/**
 * Type guard to check if an error has a specific status code (e.g., from API responses)
 */
export function isErrorWithStatus(error: unknown): error is { status: number; message: string } {
    return error !== null && typeof error === "object" && "status" in error && typeof (error as Record<string, unknown>).status === "number";
}
