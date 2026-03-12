'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePageReady } from '@/context/PageReadyContext';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prevPath = useRef(pathname);
  const { isReady, startNavigation } = usePageReady();
  const [contentVisible, setContentVisible] = useState(true);
  const isFirstRender = useRef(true);

  // On route change, hide content and start navigation loader
  // useLayoutEffect runs BEFORE browser paint — prevents skeleton flash
  useLayoutEffect(() => {
    if (pathname !== prevPath.current) {
      prevPath.current = pathname;
      setContentVisible(false);
      startNavigation();
    }
  }, [pathname, startNavigation]);

  // When page signals ready, wait for the curtain animation, then fade in content
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (isReady && !contentVisible) {
      // Sync with NavigationLoader exit: 200ms pause + 700ms curtain-drop + 650ms curtain-rise
      // Fade content in as the curtain rises so the reveal feels smooth
      const timer = setTimeout(() => {
        setContentVisible(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isReady, contentVisible]);

  return (
    <div
      className={`transition-opacity duration-500 ease-out ${
        contentVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {children}
    </div>
  );
}
