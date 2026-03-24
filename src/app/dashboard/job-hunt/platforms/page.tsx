'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface PlatformItem {
  _id: string;
  name: string;
  description?: string;
  url?: string;
  note?: string;
  needsReferral?: boolean;
  curatedJobsCount: number;
  isActive?: boolean;
}

interface PlatformResponse {
  success: boolean;
  data: PlatformItem[];
  error?: string;
}

function prettifyPlatformName(value: string) {
  return value
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function PlatformStorePage() {
  const router = useRouter();
  const [platforms, setPlatforms] = useState<PlatformItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const response = await fetch('/api/job-hunt/platforms');
        const json = (await response.json()) as PlatformResponse;

        if (!json.success) {
          throw new Error(json.error || 'Failed to load platforms');
        }

        setPlatforms(Array.isArray(json.data) ? json.data : []);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load platforms');
      } finally {
        setLoading(false);
      }
    };

    fetchPlatforms();
  }, []);

  const totals = useMemo(() => {
    const totalPlatforms = platforms.length;
    const totalCuratedJobs = platforms.reduce((sum, item) => sum + (item.curatedJobsCount || 0), 0);
    const referralNeeded = platforms.filter((item) => item.needsReferral).length;

    return {
      totalPlatforms,
      totalCuratedJobs,
      referralNeeded,
    };
  }, [platforms]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#8a7a6a] font-mono">Platform Store</p>
          <h1 className="text-2xl font-semibold text-[#2a2118] mt-1">Curated Job Sources</h1>
          <p className="text-sm text-[#6b5c4e] mt-1">
            Each square card opens a dedicated page where you can manage the platform link and referral notes.
          </p>
        </div>

        <Link
          href="/dashboard/job-hunt/platforms/new"
          className="inline-flex items-center justify-center rounded-lg bg-[#d4622a] px-4 py-2 text-sm font-medium text-white hover:bg-[#b85424] transition-colors"
        >
          + Add Platform
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-[#e8e3db] bg-white p-4">
          <p className="text-xs uppercase tracking-wider text-[#8a7a6a]">Platforms</p>
          <p className="text-2xl font-semibold text-[#2a2118] mt-1">{totals.totalPlatforms}</p>
        </div>
        <div className="rounded-xl border border-[#e8e3db] bg-white p-4">
          <p className="text-xs uppercase tracking-wider text-[#8a7a6a]">Curated Jobs</p>
          <p className="text-2xl font-semibold text-[#2a2118] mt-1">{totals.totalCuratedJobs}</p>
        </div>
        <div className="rounded-xl border border-[#e8e3db] bg-white p-4">
          <p className="text-xs uppercase tracking-wider text-[#8a7a6a]">Need Referral</p>
          <p className="text-2xl font-semibold text-[#2a2118] mt-1">{totals.referralNeeded}</p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-[#e8e3db] bg-white p-8 text-sm text-[#6b5c4e]">Loading platform store...</div>
      ) : platforms.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#d8cfc3] bg-white p-10 text-center">
          <p className="text-[#6b5c4e]">No platform yet. Start by adding one.</p>
          <Link
            href="/dashboard/job-hunt/platforms/new"
            className="mt-4 inline-flex rounded-md bg-[#2a2118] px-4 py-2 text-sm text-white hover:bg-[#1f1812]"
          >
            Create First Platform
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {platforms.map((platform) => (
            <div
              key={platform._id}
              role="button"
              tabIndex={0}
              onClick={() => router.push(`/dashboard/job-hunt/platforms/${platform._id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  router.push(`/dashboard/job-hunt/platforms/${platform._id}`);
                }
              }}
              className="group cursor-pointer rounded-2xl border border-[#e7dfd4] bg-white p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <div className="aspect-square flex flex-col justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[#9a8b7b] font-mono">Platform</p>
                  <h2 className="text-2xl font-semibold text-[#2a2118] mt-2 leading-tight">
                    {prettifyPlatformName(platform.name)}
                  </h2>

                  {platform.description && (
                    <p className="text-sm text-[#6b5c4e] mt-3 line-clamp-3">{platform.description}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#7d6e5f]">Curated jobs</span>
                    <span className="font-semibold text-[#2a2118]">{platform.curatedJobsCount}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        platform.needsReferral
                          ? 'bg-[#fff1e9] text-[#b85424]'
                          : 'bg-[#eef7f1] text-[#2e7d52]'
                      }`}
                    >
                      {platform.needsReferral ? 'Referral needed' : 'Self-apply'}
                    </span>
                    <span className="text-xs text-[#8a7a6a] group-hover:text-[#2a2118]">Details →</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <Link
                      href={`/dashboard/job-hunt/bookmarks?platform=${encodeURIComponent(platform.name)}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center justify-center rounded-md bg-[#2a2118] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1f1812]"
                    >
                      View Platform-wise Jobs
                    </Link>

                    {platform.url ? (
                      <a
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center justify-center rounded-md border border-[#d9cfbf] px-3 py-1.5 text-xs font-medium text-[#4b3a2d] hover:bg-[#f8f4ed]"
                      >
                        Open Platform Website
                      </a>
                    ) : (
                      <span className="inline-flex items-center justify-center rounded-md border border-[#eadfce] bg-[#faf7f2] px-3 py-1.5 text-xs text-[#8a7a6a]">
                        No platform URL added yet
                      </span>
                    )}
                  </div>

                  {platform.note && (
                    <p className="rounded-md bg-[#f8f5f2] px-3 py-2 text-xs text-[#665748] line-clamp-2">
                      Note: {platform.note}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
