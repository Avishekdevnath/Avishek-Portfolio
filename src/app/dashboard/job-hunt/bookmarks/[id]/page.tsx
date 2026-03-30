'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import BookmarkDetailHeader from '@/components/dashboard/job-hunt/BookmarkDetailHeader';
import BookmarkOverviewTab from '@/components/dashboard/job-hunt/tabs/BookmarkOverviewTab';
import JobAnalysisTab from '@/components/dashboard/job-hunt/tabs/JobAnalysisTab';
import KeyPeopleTab from '@/components/dashboard/job-hunt/tabs/KeyPeopleTab';
import NotesTab from '@/components/dashboard/job-hunt/tabs/NotesTab';
import CreateBookmarkModal from '@/components/dashboard/CreateBookmarkModal';
import type { BookmarkDetailItem } from '@/types/job-hunt';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'analysis', label: 'Job Analysis' },
  { key: 'people', label: 'Key People' },
  { key: 'notes', label: 'Notes' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default function BookmarkDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const activeTab = (searchParams.get('tab') as TabKey) || 'overview';

  const [bookmark, setBookmark] = useState<BookmarkDetailItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [platformOptions, setPlatformOptions] = useState<Array<{ _id: string; name: string }>>([]);

  const fetchBookmark = useCallback(async () => {
    try {
      const res = await fetch(`/api/job-hunt/bookmarks/${id}`);
      const data = await res.json();
      if (data.success) {
        setBookmark(data.data);
      } else {
        setError(data.error || 'Bookmark not found');
      }
    } catch {
      setError('Failed to load bookmark');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchBookmark(); }, [fetchBookmark]);

  useEffect(() => {
    fetch('/api/job-hunt/platforms')
      .then((r) => r.json())
      .then((d) => { if (d.success) setPlatformOptions(d.data); })
      .catch(() => {});
  }, []);

  const navigate = (tab: TabKey) => {
    router.push(`/dashboard/job-hunt/bookmarks/${id}?tab=${tab}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-[#e8e3db] border-t-[#d4622a] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !bookmark) {
    return (
      <div className="py-16 text-center text-[#8a7a6a] text-sm">
        {error || 'Bookmark not found.'}
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <BookmarkDetailHeader
        bookmark={bookmark}
        onEditClick={() => setEditModalOpen(true)}
      />

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-[#e8e3db]">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => navigate(tab.key)}
            className={`px-4 py-2.5 text-[0.82rem] font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-[#d4622a] text-[#d4622a]'
                : 'border-transparent text-[#8a7a6a] hover:text-[#2a2118]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-2">
        {activeTab === 'overview' && (
          <BookmarkOverviewTab
            bookmark={bookmark}
            onUpdate={(updated) => setBookmark((prev) => prev ? { ...prev, ...updated } : prev)}
          />
        )}
        {activeTab === 'analysis' && (
          <JobAnalysisTab
            bookmarkId={id}
            initialJD={bookmark.jobDescription || ''}
            initialAnalysis={bookmark.aiAnalysis}
          />
        )}
        {activeTab === 'people' && (
          <KeyPeopleTab sourceType="bookmark" sourceId={id} />
        )}
        {activeTab === 'notes' && (
          <NotesTab sourceType="bookmark" sourceId={id} />
        )}
      </div>

      {/* Edit modal */}
      {editModalOpen && (
        <CreateBookmarkModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSuccess={fetchBookmark}
          platforms={platformOptions}
          mode="edit"
          initialData={bookmark}
        />
      )}
    </div>
  );
}
