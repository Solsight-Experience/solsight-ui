'use client';
import './globals.css';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@/providers/theme-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import QueryProvider from '@/providers/query-provider';
import { SolanaWalletProvider } from '@/providers/wallet-provider';
import Header from '@/components/layout/Header';
import { usePathname } from 'next/navigation';
import MockProvider from '@/providers/mock-provider';
const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showHeader = pathname !== '/authentication';
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <QueryProvider>
            {/* Bọc AuthProvider trước Header */}
            <MockProvider>
              <SolanaWalletProvider>
                <AuthProvider>
                  {showHeader && <Header />}
                  <main>{children}</main>
                </AuthProvider>
              </SolanaWalletProvider>
            </MockProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
