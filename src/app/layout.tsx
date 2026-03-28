// /src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter, Cormorant_Garamond, DM_Sans, DM_Mono } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/context/ToastContext';
import { PageReadyProvider } from '@/context/PageReadyContext';
import MainLayout from '@/components/shared/MainLayout';
import IntroLoader from '@/components/IntroLoader';
import NavigationLoader from '@/components/NavigationLoader';
import { getSiteUrl } from '@/lib/url';
import PageViewTracker from '@/components/PageViewTracker';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-heading',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-body',
  display: 'swap',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: 'Avishek Devnath | Software Engineer',
  description: 'Software Engineer specializing in backend systems, API design, and system architecture. Portfolio of Avishek Devnath.',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    url: '/',
    title: 'Avishek Devnath | Software Engineer',
    description: 'Software Engineer specializing in backend systems, API design, and system architecture. Portfolio of Avishek Devnath.',
    siteName: 'Avishek Devnath Portfolio',
    images: [
      {
        url: '/assets/home/profile-img.jpg',
        width: 1200,
        height: 630,
        alt: 'Avishek Devnath',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Avishek Devnath | Software Engineer',
    description: 'Software Engineer specializing in backend systems, API design, and system architecture. Portfolio of Avishek Devnath.',
    images: ['/assets/home/profile-img.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f0f0f" />
        <link rel="apple-touch-icon" href="/icons/icon-180.png" />
      </head>
      <body suppressHydrationWarning className={`${inter.variable} ${cormorant.variable} ${dmSans.variable} ${dmMono.variable} ${dmSans.className}`}>
        <ToastProvider>
          <PageReadyProvider>
            <PageViewTracker />
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