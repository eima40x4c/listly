import './globals.css';

import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { SessionProvider } from 'next-auth/react';

import { QueryProvider } from '@/components/providers';
import { OfflineIndicator } from '@/components/pwa/OfflineIndicator';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from '@/components/ui/Toaster';

const inter = localFont({
  src: '../../public/fonts/Inter-Variable.woff2',
  variable: '--font-sans',
  display: 'swap',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Listly - Smart Shopping Companion',
  description:
    'Mobile-first PWA for smart shopping list management with real-time collaboration, AI suggestions, and pantry tracking.',

  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Listly',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/icon-192x192.png',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <SessionProvider
          refetchOnWindowFocus={false}
          refetchWhenOffline={false}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              {children}
              <OfflineIndicator />
            </QueryProvider>
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
