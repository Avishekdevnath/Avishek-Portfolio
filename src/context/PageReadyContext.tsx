"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface PageReadyContextType {
  isReady: boolean;
  setReady: () => void;
  startNavigation: () => void;
}

const PageReadyContext = createContext<PageReadyContextType>({
  isReady: true,
  setReady: () => {},
  startNavigation: () => {},
});

export function PageReadyProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(true);

  const setReady = useCallback(() => setIsReady(true), []);
  const startNavigation = useCallback(() => setIsReady(false), []);

  return (
    <PageReadyContext.Provider value={{ isReady, setReady, startNavigation }}>
      {children}
    </PageReadyContext.Provider>
  );
}

export const usePageReady = () => useContext(PageReadyContext);
