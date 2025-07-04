'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  return (
    <>
      {/* {!isDashboard && <Header />} */}
      <main>{children}</main>
      {/* {!isDashboard && <Footer />} */}
    </>
  );
} 