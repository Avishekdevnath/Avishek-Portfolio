'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

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

interface BookmarkItem {
  _id: string;
  jobTitle: string;
  company: string;
  platform: string;
  jobUrl: string;
  notes?: string;
  status: 'saved' | 'applied' | 'discarded';
}

function prettifyPlatformName(value: string) {
  return value
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function PlatformDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [platform, setPlatform] = useState<PlatformItem | null>(null);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const platformId = params?.id;

  const fetchData = useCallback(async () => {
    if (!platformId) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/job-hunt/platforms/${platformId}`);
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to load platform');
      }

      const loadedPlatform = json.data as PlatformItem;
      setPlatform(loadedPlatform);

      const bookmarkResponse = await fetch(
        `/api/job-hunt/bookmarks?platform=${encodeURIComponent(loadedPlatform.name)}&limit=8&page=1`
      );
      const bookmarkJson = await bookmarkResponse.json();
      if (bookmarkJson.success && Array.isArray(bookmarkJson.data)) {
        setBookmarks(bookmarkJson.data as BookmarkItem[]);
      } else {
        setBookmarks([]);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load platform details');
    } finally {
      setLoading(false);
    }
  }, [platformId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!platform?._id) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/job-hunt/platforms/${platform._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: platform.name,
          description: platform.description,
          url: platform.url,
          note: platform.note,
          needsReferral: !!platform.needsReferral,
          isActive: !!platform.isActive,
        }),
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to update platform');
      }

      setPlatform(json.data as PlatformItem);
      toast.success('Platform updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update platform');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlatform = async () => {
    if (!platform?._id) return;
    if (!window.confirm('Delete this platform? This cannot be undone.')) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/job-hunt/platforms/${platform._id}`, {
        method: 'DELETE',
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to delete platform');
      }

      toast.success('Platform deleted');
      router.push('/dashboard/job-hunt/platforms');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete platform');
    } finally {
      setSaving(false);
    }
  };

  const headerName = useMemo(
    () => (platform?.name ? prettifyPlatformName(platform.name) : 'Platform'),
    [platform?.name]
  );

  if (loading) {
    return <div className="rounded-xl border border-[#e8e3db] bg-white p-8 text-sm text-[#6b5c4e]">Loading platform details...</div>;
  }

  if (!platform) {
    return (
      <div className="rounded-xl border border-[#e8e3db] bg-white p-8 text-sm text-[#6b5c4e]">
        Platform not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#8a7a6a] font-mono">Platform Store</p>
          <h1 className="text-2xl font-semibold text-[#2a2118] mt-1">{headerName}</h1>
          <p className="text-sm text-[#6b5c4e] mt-1">Curated jobs in this source: {platform.curatedJobsCount}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/dashboard/job-hunt/bookmarks?platform=${encodeURIComponent(platform.name)}`}
            className="rounded-md bg-[#2a2118] px-4 py-2 text-sm text-white hover:bg-[#1f1812]"
          >
            View Platform-wise Jobs
          </Link>

          {platform.url && (
            <a
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-[#d9cfbf] px-4 py-2 text-sm text-[#4b3a2d] hover:bg-[#f8f4ed]"
            >
              Open Platform Website
            </a>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4 rounded-xl border border-[#e8e3db] bg-white p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#4c3f33] mb-1">Platform name</label>
            <input
              value={platform.name}
              onChange={(e) => setPlatform((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
              placeholder="e.g. linkedin"
              className="w-full rounded-md border border-[#d8d0c5] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#d4622a]/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4c3f33] mb-1">Platform URL</label>
            <input
              value={platform.url || ''}
              onChange={(e) => setPlatform((prev) => (prev ? { ...prev, url: e.target.value } : prev))}
              placeholder="https://example.com/jobs"
              className="w-full rounded-md border border-[#d8d0c5] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#d4622a]/30"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#4c3f33] mb-1">Description</label>
          <textarea
            rows={3}
            value={platform.description || ''}
            onChange={(e) => setPlatform((prev) => (prev ? { ...prev, description: e.target.value } : prev))}
            className="w-full rounded-md border border-[#d8d0c5] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#d4622a]/30"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#4c3f33] mb-1">Referral note</label>
          <textarea
            rows={3}
            value={platform.note || ''}
            onChange={(e) => setPlatform((prev) => (prev ? { ...prev, note: e.target.value } : prev))}
            placeholder="Need referral from alumni / recruiter / friend..."
            className="w-full rounded-md border border-[#d8d0c5] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#d4622a]/30"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-[#4c3f33]">
            <input
              type="checkbox"
              checked={!!platform.needsReferral}
              onChange={(e) => setPlatform((prev) => (prev ? { ...prev, needsReferral: e.target.checked } : prev))}
              className="h-4 w-4 rounded border-[#c9beb0] text-[#d4622a] focus:ring-[#d4622a]/30"
            />
            I need referral for this platform
          </label>
          <label className="flex items-center gap-2 text-sm text-[#4c3f33]">
            <input
              type="checkbox"
              checked={!!platform.isActive}
              onChange={(e) => setPlatform((prev) => (prev ? { ...prev, isActive: e.target.checked } : prev))}
              className="h-4 w-4 rounded border-[#c9beb0] text-[#d4622a] focus:ring-[#d4622a]/30"
            />
            Platform is active
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-[#d4622a] px-4 py-2 text-sm font-medium text-white hover:bg-[#b85424] disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={handleDeletePlatform}
            disabled={saving}
            className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
          >
            Delete Platform
          </button>
        </div>
      </form>

      <div className="rounded-xl border border-[#e8e3db] bg-white p-5">
        <h2 className="text-lg font-semibold text-[#2a2118]">Latest curated jobs</h2>
        {bookmarks.length === 0 ? (
          <p className="text-sm text-[#6b5c4e] mt-3">No jobs bookmarked yet for this platform.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {bookmarks.map((item) => (
              <div
                key={item._id}
                className="block rounded-lg border border-[#eee6db] p-3 hover:bg-[#fbf8f4] transition-colors"
              >
                <p className="text-sm font-medium text-[#2a2118]">{item.jobTitle}</p>
                <p className="text-xs text-[#6b5c4e] mt-0.5">{item.company}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
