"use client";

import { useEffect } from "react";
import { usePageReady } from "@/context/PageReadyContext";
import { useSettings, useSkills, useProjects } from "@/lib/swr";

/**
 * Signals the NavigationLoader to finish only after all critical home-page
 * data fetches have resolved (or errored). Prevents the loader from hiding
 * before content is ready.
 */
export default function HomePageReady() {
  const { setReady } = usePageReady();
  const { isLoading: settingsLoading } = useSettings();
  const { isLoading: skillsLoading } = useSkills();
  const { isLoading: projectsLoading } = useProjects("published");

  const allDone = !settingsLoading && !skillsLoading && !projectsLoading;

  useEffect(() => {
    if (allDone) {
      setReady();
    }
  }, [allDone, setReady]);

  return null;
}
