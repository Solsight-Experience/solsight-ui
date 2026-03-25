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
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

function ChatGate() {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return null;
    return <ChatWidget />;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const showHeader = pathname !== "/authentication";
    return (
        <html lang="en" suppressHydrationWarning>
            <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
                    <QueryProvider>
                        {/* Bọc AuthProvider trước Header */}
                        <MockProvider>
                            <AuthProvider>
                                {showHeader && <Header />}
                                <main>{children}</main>
                                <ChatGate />
                                <Toaster
                                    position="top-center"
                                    theme="dark"
                                    toastOptions={{
                                        classNames: {
                                            toast: "!bg-card !text-card-foreground !border-border !rounded-lg",
                                            title: "!text-card-foreground !font-semibold",
                                            description: "!text-muted-foreground",
                                            actionButton: "!bg-primary !text-primary-foreground !font-medium hover:!opacity-90"
                                        }
                                    }}
                                />
                            </AuthProvider>
                        </MockProvider>
                    </QueryProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
