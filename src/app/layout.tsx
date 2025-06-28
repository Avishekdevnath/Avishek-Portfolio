// /src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import LoadingScreen from '@/components/shared/LoadingScreen';
import { ToastProvider } from '@/context/ToastContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Avishek Devnath - Full Stack Developer',
  description: 'Full Stack Developer specializing in React, Node.js, and modern web technologies.',
  keywords: ['Full Stack Developer', 'React Developer', 'Node.js Developer', 'Web Developer', 'Software Engineer'],
  authors: [{ name: 'Avishek Devnath' }],
  creator: 'Avishek Devnath',
  publisher: 'Avishek Devnath',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider>
          <Suspense fallback={
            <LoadingScreen 
              type="global"
              message="Loading your amazing portfolio..."
              className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50"
            />
          }>
            {children}
          </Suspense>
        </ToastProvider>
      </body>
    </html>
  );
}