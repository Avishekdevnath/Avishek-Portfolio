"use client";

import { useEffect } from "react";
import { usePageReady } from "@/context/PageReadyContext";

/** Drop this in any server-rendered or no-data page to signal the NavigationLoader to finish. */
export default function PageReadyOnMount() {
  const { setReady } = usePageReady();
  useEffect(() => {
    setReady();
  }, [setReady]);
  return null;
}
