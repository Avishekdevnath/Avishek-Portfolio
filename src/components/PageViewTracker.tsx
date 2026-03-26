'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function PageViewTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    // Deduplicate: don't re-fire if pathname hasn't changed
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname;

    fetch('/api/track/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: pathname,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      }),
    }).catch(() => {/* swallow — never affects the user */});
  }, [pathname]);

  return null;
}
