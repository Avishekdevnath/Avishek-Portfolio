import useSWR from "swr";

// ── Shared fetcher ──
export const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    return res.json();
  });

// ── Shared SWR config ──
export const swrConfig = {
  revalidateOnFocus: false,
  dedupingInterval: 60_000, // dedup identical requests within 60s
};

// ── /api/settings hook (deduped across all components) ──
export function useSettings() {
  const { data, error, isLoading } = useSWR("/api/settings", fetcher, {
    ...swrConfig,
    revalidateOnMount: true,
  });
  return {
    settings: data?.success ? data.data : null,
    profileImage: data?.success ? data.data?.profileImage : null,
    isLoading,
    error,
  };
}

// ── /api/skills hook ──
export function useSkills() {
  const { data, error, isLoading } = useSWR("/api/skills", fetcher, swrConfig);
  return {
    grouped: data?.success ? (data.data as Record<string, any[]>) : {},
    isLoading,
    error,
  };
}

// ── /api/experience hook ──
export function useExperience(status = "published") {
  const { data, error, isLoading } = useSWR(
    `/api/experience?status=${status}`,
    fetcher,
    swrConfig
  );
  const inner = data?.data || data;
  return {
    work: inner?.work || inner?.experiences?.filter?.((e: any) => e.type === "work") || [],
    education: inner?.education || inner?.experiences?.filter?.((e: any) => e.type === "education") || [],
    raw: data,
    isLoading,
    error,
  };
}

// ── /api/projects hook ──
export function useProjects(status = "published") {
  const { data, error, isLoading } = useSWR(
    `/api/projects?status=${status}`,
    fetcher,
    swrConfig
  );
  return {
    projects: data?.data?.projects || [],
    isLoading,
    error,
  };
}
