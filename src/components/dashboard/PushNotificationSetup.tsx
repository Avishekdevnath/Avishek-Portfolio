'use client';

import { useEffect } from 'react';

export default function PushNotificationSetup() {
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      !('PushManager' in window) ||
      Notification.permission === 'granted' ||
      Notification.permission === 'denied'
    ) {
      return;
    }

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        const existing = await registration.pushManager.getSubscription();
        if (existing) return;

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        });

        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription.toJSON()),
        });
      } catch (err) {
        console.error('Push setup failed:', err);
      }
    };

    // Delay to avoid blocking initial render
    const timer = setTimeout(register, 3000);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
