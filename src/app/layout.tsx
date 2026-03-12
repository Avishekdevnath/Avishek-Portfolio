// /src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter, Cormorant_Garamond, DM_Sans, DM_Mono } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/context/ToastContext';
import { PageReadyProvider } from '@/context/PageReadyContext';
import MainLayout from '@/components/shared/MainLayout';
import IntroLoader from '@/components/IntroLoader';
import NavigationLoader from '@/components/NavigationLoader';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-heading',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-body',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'),
  title: 'Avishek Portfolio',
  description: 'Welcome to my portfolio website',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${cormorant.variable} ${dmSans.variable} ${dmMono.variable} ${dmSans.className}`}>
        <ToastProvider>
          <PageReadyProvider>
            <IntroLoader />
            <NavigationLoader />
            <MainLayout>
              {children}
            </MainLayout>
          </PageReadyProvider>
        </ToastProvider>
      </body>
    </html>
  );
}