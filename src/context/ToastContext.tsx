'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '@/components/shared/Toast';

interface ToastOptions {
  title: string;
  description?: string;
  status: 'success' | 'error' | 'info';
  duration?: number;
  isClosable?: boolean;
}

interface ToastContextType {
  toast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<(ToastOptions & { id: number })[]>([]);

  const toast = useCallback((options: ToastOptions) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { ...options, id }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
} 