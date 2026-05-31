"use client";
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import QueryProvider from "@/providers/query-provider";
import Header from "@/components/layout/Header";
import ChatWidget from "@/features/ai-chat/components/ChatWidget";
import { usePathname } from "next/navigation";
import MockProvider from "@/providers/mock-provider";
import { Toaster } from "sonner";
import { SolanaWalletProvider } from "@/providers/wallet-provider";
import { useTheme } from "next-themes";
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

function ChatGate() {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return null;
    return <ChatWidget />;
}

function ThemedToaster() {
    const { resolvedTheme } = useTheme();
    return (
        <Toaster
            position="top-center"
            theme={resolvedTheme as "light" | "dark"}
            toastOptions={{
                classNames: {
                    toast: "!bg-[var(--surface-card)] !text-[var(--text-primary)] !border-[var(--border-subtle)] !rounded-lg",
                    title: "!text-[var(--text-primary)] !font-semibold",
                    description: "!text-[var(--text-muted)]",
                    actionButton: "!bg-primary !text-primary-foreground !font-medium hover:!opacity-90"
                }
            }}
        />
    );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const showHeader = pathname !== "/authentication";
    return (
        <html lang="en" suppressHydrationWarning>
            <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
                    <QueryProvider>
                        <SolanaWalletProvider>
                            {/* Bọc AuthProvider trước Header */}
                            <MockProvider>
                                <AuthProvider>
                                    {showHeader && <Header />}
                                    <main>{children}</main>
                                    <ChatGate />
                                    <ThemedToaster />
                                </AuthProvider>
                            </MockProvider>
                        </SolanaWalletProvider>
                    </QueryProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
