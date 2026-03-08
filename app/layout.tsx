'use client';
import './globals.css';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@/providers/theme-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import QueryProvider from '@/providers/query-provider';
import Header from '@/components/layout/Header';
import { usePathname } from 'next/navigation';
import MockProvider from '@/providers/mock-provider';
import { Toaster } from 'sonner';
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
              <AuthProvider>
                {showHeader && <Header />}
                <main>{children}</main>
                <Toaster
                  position="top-right"
                  theme="dark"
                  toastOptions={{
                    unstyled: true,
                    classNames: {
                      toast:
                        'group rounded-xl border border-gray-700 bg-gray-900/95 text-gray-100 shadow-lg shadow-black/40 px-4 py-3 backdrop-blur',
                      title: 'text-sm font-semibold text-gray-100',
                      description: 'text-xs text-gray-300',
                      success: 'border-emerald-500/40',
                      error: 'border-red-500/40',
                      warning: 'border-amber-500/40',
                      info: 'border-cyan-500/40',
                      closeButton:
                        'rounded-md border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white',
                      actionButton:
                        'rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-900 hover:bg-white',
                      cancelButton:
                        'rounded-md border border-gray-700 bg-gray-800 px-2 py-1 text-xs font-medium text-gray-200 hover:bg-gray-700',
                    },
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
