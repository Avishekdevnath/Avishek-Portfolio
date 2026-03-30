'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Plus } from 'lucide-react';
import BookmarkCard from '@/components/dashboard/BookmarkCard';
import BookmarkConvertDialog from '@/components/dashboard/BookmarkConvertDialog';
import CreateBookmarkModal from '@/components/dashboard/CreateBookmarkModal';

interface Bookmark {
  _id: string;
  jobTitle: string;
  company: string;
  platform: string;
  jobUrl: string;
  notes?: string;
  status: 'saved' | 'applied' | 'discarded';
  bookmarkedDate: string;
  daysBookmarked?: number;
}

interface FetchResponse {
  success: boolean;
  data: Bookmark[];
  pagination: { currentPage: number; totalPages: number; totalItems: number; itemsPerPage: number };
  platformStats: Record<string, any>;
}

interface PlatformOption { _id: string; name: string }

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'saved', label: 'Saved' },
  { value: 'applied', label: 'Applied' },
  { value: 'discarded', label: 'Discarded' },
];

export default function BookmarksPage() {
  const searchParams = useSearchParams();
  const queryPlatform = searchParams.get('platform') || '';

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState(queryPlatform);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [platformOptions, setPlatformOptions] = useState<PlatformOption[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [convertingBookmark, setConvertingBookmark] = useState<Bookmark | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPlatforms = useCallback(async () => {
    try {
      const res = await fetch('/api/job-hunt/platforms');
      const json = await res.json();
      if (json.success) setPlatformOptions(json.data);
    } catch {}
  }, []);

  const fetched = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: perPage.toString() });
      if (search) params.append('q', search);
      if (platform) params.append('platform', platform);
      if (status) params.append('status', status);
      const res = await fetch(`/api/job-hunt/bookmarks?${params}`);
      const json = (await res.json()) as FetchResponse;
      if (json.success) {
        setBookmarks(json.data);
        setTotalPages(json.pagination.totalPages);
        setTotalItems(json.pagination.totalItems);
        setSelectedIds(new Set());
      } else {
        toast.error('Failed to fetch bookmarks');
      }
    } catch {
      toast.error('Error fetching bookmarks');
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, platform, status]);

  useEffect(() => { setPage(1); }, [search, platform, status, perPage]);
  useEffect(() => { fetched(); }, [fetched]);
  useEffect(() => { fetchPlatforms(); }, [fetchPlatforms]);
  useEffect(() => {
    if (queryPlatform && queryPlatform !== platform) { setPlatform(queryPlatform); setPage(1); }
  }, [queryPlatform, platform]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/job-hunt/bookmarks/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) { toast.success('Status updated'); await fetched(); }
      else toast.error('Failed to update status');
    } catch { toast.error('Error updating status'); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/job-hunt/bookmarks/${id}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Bookmark deleted'); await fetched(); }
      else toast.error('Failed to delete bookmark');
    } catch { toast.error('Error deleting bookmark'); }
  };

  const handleConvert = (id: string) => {
    setConvertingBookmark(bookmarks.find((b) => b._id === id) || null);
  };

  const handleConfirmConvert = async (appStatus: string) => {
    if (!convertingBookmark) return;
    try {
      const res = await fetch(`/api/job-hunt/bookmarks/${convertingBookmark._id}/convert`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: appStatus }),
      });
      if (res.ok) { toast.success('Converted to application'); await fetched(); }
      else toast.error('Failed to convert bookmark');
    } catch { toast.error('Error converting bookmark'); }
    finally { setConvertingBookmark(null); }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} bookmarks?`)) return;
    try {
      const res = await fetch('/api/job-hunt/bookmarks/bulk', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds), action: 'delete' }),
      });
      if (res.ok) { toast.success(`Deleted ${selectedIds.size} bookmarks`); await fetched(); }
      else toast.error('Failed to delete bookmarks');
    } catch { toast.error('Error deleting bookmarks'); }
  };

  const handleBulkStatus = async (newStatus: string) => {
    if (!newStatus || selectedIds.size === 0) return;
    try {
      const res = await fetch('/api/job-hunt/bookmarks/bulk', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds), action: 'update-status', status: newStatus }),
      });
      if (res.ok) { toast.success(`Updated ${selectedIds.size} bookmarks`); await fetched(); }
      else toast.error('Failed to update bookmarks');
    } catch { toast.error('Error updating bookmarks'); }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[0.6rem] font-mono tracking-[0.18em] uppercase text-[#8a7a6a]">
            {totalItems} bookmark{totalItems === 1 ? '' : 's'}
          </p>
          <h1 className="text-[1rem] font-semibold text-[#2a2118]">Bookmarks</h1>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#2a2118] text-[#f0ece3] rounded-lg text-[0.78rem] font-medium hover:bg-[#d4622a] transition-colors"
        >
          <Plus size={13} /> Add Bookmark
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#e8e3db] rounded-xl px-4 py-3 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-[0.6rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a] mb-1">Search</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Title, company…"
              className="w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-1.5 text-[0.82rem] focus:outline-none focus:ring-1 focus:ring-[#d4622a]"
            />
          </div>
          <div className="min-w-[130px]">
            <label className="block text-[0.6rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a] mb-1">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-1.5 text-[0.82rem] focus:outline-none focus:ring-1 focus:ring-[#d4622a]"
            >
              <option value="">All</option>
              {platformOptions.map((p) => <option key={p._id} value={p.name}>{p.name}</option>)}
            </select>
          </div>
          <div className="min-w-[110px]">
            <label className="block text-[0.6rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a] mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-1.5 text-[0.82rem] focus:outline-none focus:ring-1 focus:ring-[#d4622a]"
            >
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="min-w-[90px]">
            <label className="block text-[0.6rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a] mb-1">Per page</label>
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-1.5 text-[0.82rem] focus:outline-none focus:ring-1 focus:ring-[#d4622a]"
            >
              {[10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#f3f1ee]">
            <span className="text-[0.68rem] text-[#6b5c4e]">{selectedIds.size} selected</span>
            <select
              onChange={(e) => { handleBulkStatus(e.target.value); e.target.value = ''; }}
              className="bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-2 py-1 text-[0.72rem]"
            >
              <option value="">Change status…</option>
              <option value="saved">Saved</option>
              <option value="applied">Applied</option>
              <option value="discarded">Discarded</option>
            </select>
            <button onClick={handleBulkDelete}
              className="px-2.5 py-1 rounded-lg border border-red-200 text-[0.72rem] text-red-700">
              Delete
            </button>
          </div>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-5 h-5 border-2 border-[#e8e3db] border-t-[#d4622a] rounded-full animate-spin" />
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="py-16 text-center bg-white border border-[#e8e3db] rounded-xl">
          <p className="text-[#8a7a6a] text-sm mb-1">No bookmarks yet</p>
          <p className="text-[#c0b8ae] text-xs mb-4">Save jobs you want to track or apply to</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-[#d4622a] text-white text-sm rounded-lg hover:bg-[#c04d1a]"
          >
            Add First Bookmark
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {bookmarks.map((bookmark) => (
            <BookmarkCard
              key={bookmark._id}
              bookmark={bookmark}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onConvert={handleConvert}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white border border-[#e8e3db] rounded-xl flex items-center justify-between px-4 py-3">
          <span className="font-mono text-[0.68rem] text-[#8a7a6a]">
            {(page - 1) * perPage + 1}–{Math.min(page * perPage, totalItems)} of {totalItems}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="px-2.5 py-1 rounded-lg border border-[#ddd5c5] text-[0.72rem] text-[#4a3728] disabled:opacity-40">
              Previous
            </button>
            <span className="font-mono text-[0.68rem] text-[#8a7a6a]">{page} / {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-2.5 py-1 rounded-lg border border-[#ddd5c5] text-[0.72rem] text-[#4a3728] disabled:opacity-40">
              Next
            </button>
          </div>
        </div>
      )}

      <CreateBookmarkModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetched}
        platforms={platformOptions}
        mode="create"
        initialData={null}
      />

      {convertingBookmark && (
        <BookmarkConvertDialog
          bookmark={convertingBookmark}
          onConfirm={handleConfirmConvert}
          onCancel={() => setConvertingBookmark(null)}
        />
      )}
    </div>
  );
}
