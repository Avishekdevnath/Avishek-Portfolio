'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FiPlus } from 'react-icons/fi';
import { Calendar } from 'lucide-react';
import BookmarkCard from '@/components/dashboard/BookmarkCard';
import PlatformStatsWidget from '@/components/dashboard/PlatformStatsWidget';
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

interface EditableBookmark extends Bookmark {
  _id: string;
}

interface FetchResponse {
  success: boolean;
  data: Bookmark[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  platformStats: Record<string, any>;
}

interface PlatformOption {
  _id: string;
  name: string;
  description?: string;
  url?: string;
}

export default function BookmarksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryPlatform = searchParams.get('platform') || '';
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState(queryPlatform);
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [platformStats, setPlatformStats] = useState<Record<string, any>>({});
  const [platformOptions, setPlatformOptions] = useState<PlatformOption[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [convertingBookmark, setConvertingBookmark] = useState<Bookmark | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<EditableBookmark | null>(null);

  const prettifyPlatformName = (name: string) =>
    name
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

  const fetchPlatforms = useCallback(async () => {
    try {
      const response = await fetch('/api/job-hunt/platforms');
      const json = await response.json();
      if (json.success && Array.isArray(json.data)) {
        setPlatformOptions(json.data);
      }
    } catch {
      // keep UI usable even if platform list fails to load
    }
  }, []);

  const fetched = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: perPage.toString(),
      });
      if (search) params.append('q', search);
      if (platform) params.append('platform', platform);
      if (status) params.append('status', status);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);

      const response = await fetch(`/api/job-hunt/bookmarks?${params}`);
      const json = (await response.json()) as FetchResponse;

      if (json.success) {
        setBookmarks(json.data);
        setTotalPages(json.pagination.totalPages);
        setTotalItems(json.pagination.totalItems);
        setPlatformStats(json.platformStats);
        setSelectedIds(new Set());
      } else {
        toast.error('Failed to fetch bookmarks');
      }
    } catch (error) {
      toast.error('Error fetching bookmarks');
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, platform, status, dateFrom, dateTo]);

  useEffect(() => {
    setPage(1);
  }, [search, platform, status, perPage, dateFrom, dateTo]);

  useEffect(() => {
    if (queryPlatform && queryPlatform !== platform) {
      setPlatform(queryPlatform);
      setPage(1);
    }
  }, [queryPlatform, platform]);

  useEffect(() => {
    fetched();
  }, [fetched]);

  useEffect(() => {
    fetchPlatforms();
  }, [fetchPlatforms]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/job-hunt/bookmarks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success('Status updated');
        await fetched();
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('Error updating status');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/job-hunt/bookmarks/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Bookmark deleted');
        await fetched();
      } else {
        toast.error('Failed to delete bookmark');
      }
    } catch (error) {
      toast.error('Error deleting bookmark');
    }
  };

  const handleConvert = (id: string) => {
    const bookmark = bookmarks.find((b) => b._id === id) || null;
    setConvertingBookmark(bookmark);
  };

  const handleConfirmConvert = async (appStatus: string) => {
    if (!convertingBookmark) return;

    try {
      const response = await fetch(`/api/job-hunt/bookmarks/${convertingBookmark._id}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: appStatus }),
      });

      if (response.ok) {
        toast.success('Converted to application');
        await fetched();
      } else {
        toast.error('Failed to convert bookmark');
      }
    } catch (error) {
      toast.error('Error converting bookmark');
    } finally {
      setConvertingBookmark(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    if (!confirm(`Delete ${selectedIds.size} bookmarks?`)) return;

    try {
      const response = await fetch('/api/job-hunt/bookmarks/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          action: 'delete',
        }),
      });

      if (response.ok) {
        toast.success(`Deleted ${selectedIds.size} bookmarks`);
        await fetched();
      } else {
        toast.error('Failed to delete bookmarks');
      }
    } catch (error) {
      toast.error('Error deleting bookmarks');
    }
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedIds.size === 0) return;

    try {
      const response = await fetch('/api/job-hunt/bookmarks/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          action: 'update-status',
          status: newStatus,
        }),
      });

      if (response.ok) {
        toast.success(`Updated ${selectedIds.size} bookmarks`);
        await fetched();
      } else {
        toast.error('Failed to update bookmarks');
      }
    } catch (error) {
      toast.error('Error updating bookmarks');
    }
  };

  const startIndex = (page - 1) * perPage + 1;
  const endIndex = Math.min(page * perPage, totalItems);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Bookmarks</h1>
        <button
          onClick={() => {
            setEditingBookmark(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#d4622a] text-white rounded-md hover:bg-[#2a2118] transition-colors shadow-md hover:shadow-lg"
        >
          <FiPlus size={18} /> Add Bookmark
        </button>
      </div>

      {/* Create Bookmark Modal */}
      <CreateBookmarkModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBookmark(null);
        }}
        onSuccess={fetched}
        platforms={platformOptions}
        mode={editingBookmark ? 'edit' : 'create'}
        initialData={editingBookmark}
      />

      {/* Stats Widget */}
      {Object.keys(platformStats).length > 0 && (
        <PlatformStatsWidget stats={platformStats} />
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, company..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="">All Platforms</option>
              {platformOptions.map((p) => (
                <option key={p._id} value={p.name}>
                  {prettifyPlatformName(p.name)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="">All Status</option>
              <option value="saved">Saved</option>
              <option value="applied">Applied</option>
              <option value="discarded">Discarded</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Calendar size={14} /> From Date
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Calendar size={14} /> To Date
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Per Page</label>
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            {selectedIds.size} selected
          </span>
          <div className="flex gap-2">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkStatusUpdate(e.target.value);
                  e.target.value = '';
                }
              }}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md"
            >
              <option value="">Change Status...</option>
              <option value="saved">Mark as Saved</option>
              <option value="applied">Mark as Applied</option>
              <option value="discarded">Mark as Discarded</option>
            </select>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Bookmarks Grid */}
      {loading ? (
        <div className="text-center py-12">Loading bookmarks...</div>
      ) : bookmarks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">No bookmarks yet</p>
          <button
            onClick={() => router.push('/dashboard/job-hunt/bookmarks/new')}
            className="px-4 py-2 bg-[#d4622a] text-white rounded-md hover:bg-[#2a2118]"
          >
            Create First Bookmark
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {bookmarks.map((bookmark) => (
            <BookmarkCard
              key={bookmark._id}
              bookmark={bookmark}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onConvert={handleConvert}
              onEdit={(id) => {
                const selected = bookmarks.find((item) => item._id === id);
                if (!selected) return;
                setEditingBookmark(selected as EditableBookmark);
                setIsModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-600">
            Showing {startIndex} to {endIndex} of {totalItems} bookmarks
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Convert Dialog */}
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
