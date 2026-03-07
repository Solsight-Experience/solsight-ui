'use client';
import './globals.css';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@/providers/theme-provider';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import QueryProvider from '@/providers/query-provider';
import { SolanaWalletProvider } from '@/providers/wallet-provider';
import Header from '@/components/layout/Header';
import ChatWidget from '@/features/ai-chat/components/ChatWidget';
import { usePathname } from 'next/navigation';
import MockProvider from '@/providers/mock-provider';
const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

function ChatGate() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return null;
  return <ChatWidget />;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showHeader = pathname !== '/authentication';
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <QueryProvider>
            {/* Bọc AuthProvider trước Header */}
            <MockProvider>
              <AuthProvider>
                {showHeader && <Header />}
                <main>{children}</main>
                <ChatGate />
              </AuthProvider>
            </MockProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
