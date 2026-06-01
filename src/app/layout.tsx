import type { Metadata, Viewport } from 'next';
import './globals.css';
import { cn } from '@/shared/utils';
import { Header } from '@/components/layout/header';
import { Toaster as OldToaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { LocaleProvider } from '@/i18n';
import { Footer } from '@/components/layout/footer';
import { CookieConsent } from '@/components/cookie-consent';
import { SupportChatbot } from '@/components/support-chatbot';
import { PwaInstallPrompt } from '@/components/pwa-install-prompt';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#040b16',
};

export const metadata: Metadata = {
  title: 'Niche Finder',
  description: 'The AI Operating System for Venture Creation. Discover, validate, and build your next investor-ready business.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Niche Finder',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="https://picsum.photos/seed/niche-apple-icon/180/180" />
      </head>
      <body className={cn('font-body antialiased h-full dark')} suppressHydrationWarning>
        <FirebaseClientProvider>
          <LocaleProvider>
              <div className="flex min-h-full flex-col">
                <Header />
                <main className="flex-1 pb-safe">{children}</main>
                <Footer />
              </div>
              <OldToaster />
              <SonnerToaster richColors />
              <FirebaseErrorListener />
              <CookieConsent />
              <SupportChatbot />
              <PwaInstallPrompt />
          </LocaleProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}