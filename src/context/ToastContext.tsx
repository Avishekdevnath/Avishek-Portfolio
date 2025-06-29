'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '@/components/shared/Toast';

export type ToastStatus = 'success' | 'error' | 'info';

export interface ToastProps {
  title: string;
  description?: string;
  status: ToastStatus;
  duration?: number;
}

interface ToastContextType {
  showToast: (props: ToastProps) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastProps | null>(null);

  const showToast = useCallback((props: ToastProps) => {
    setToast(props);
    
    // Auto-hide toast after duration
    if (props.duration !== 0) {
      const duration = props.duration || 5000;
      setTimeout(() => {
        setToast(null);
      }, duration);
    }
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast
          {...toast}
          onClose={() => setToast(null)}
          isClosable={true}
        />
      )}
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