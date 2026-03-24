import { z } from "zod";

// Validation schemas for forms and API requests
export const transferFormSchema = z.object({
    recipientAddress: z
        .string()
        .min(32, "Invalid Solana address")
        .max(44, "Invalid Solana address")
        .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "Invalid Solana address format"),
    amount: z.number().positive("Amount must be greater than 0").max(1000000, "Amount too large"),
    tokenMint: z.string().optional(),
    memo: z.string().max(200, "Memo too long").optional()
});

export const walletConnectionSchema = z.object({
    publicKey: z.string().min(32, "Invalid public key"),
    walletType: z.enum(["phantom", "solflare", "other"])
});

export const authLoginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters")
});

export const authRegisterSchema = z
    .object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
        publicKey: z.string().min(32, "Invalid public key")
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"]
    });

// Type exports
export type TransferFormData = z.infer<typeof transferFormSchema>;
export type WalletConnectionData = z.infer<typeof walletConnectionSchema>;
export type AuthLoginData = z.infer<typeof authLoginSchema>;
export type AuthRegisterData = z.infer<typeof authRegisterSchema>;
