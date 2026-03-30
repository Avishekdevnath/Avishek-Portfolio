'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiExternalLink, FiTrash2, FiArrowRight } from 'react-icons/fi';
import PlatformBadge from './PlatformBadge';

interface BookmarkCardProps {
  bookmark: {
    _id: string;
    jobTitle: string;
    company: string;
    platform: string;
    jobUrl: string;
    notes?: string;
    status: 'saved' | 'applied' | 'discarded';
    bookmarkedDate: string;
    daysBookmarked?: number;
  };
  onStatusChange: (id: string, status: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onConvert: (id: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  saved: 'bg-blue-100 text-blue-700',
  applied: 'bg-green-100 text-green-700',
  discarded: 'bg-red-100 text-red-700',
};

export default function BookmarkCard({
  bookmark,
  onStatusChange,
  onDelete,
  onConvert,
}: BookmarkCardProps) {
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    setLoading(true);
    try {
      await onStatusChange(bookmark._id, e.target.value);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Delete this bookmark?')) {
      setLoading(true);
      try {
        await onDelete(bookmark._id);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleConvert = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onConvert(bookmark._id);
  };

  const date = new Date(bookmark.bookmarkedDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Link
      href={`/dashboard/job-hunt/bookmarks/${bookmark._id}`}
      className="block border border-[#e8e3db] rounded-lg px-4 py-2.5 bg-white hover:shadow-md hover:border-[#d4622a]/30 transition-all group"
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Left: title + company */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-semibold text-sm text-gray-900 group-hover:text-[#d4622a] transition-colors truncate">
              {bookmark.jobTitle}
            </span>
            <span className="text-xs text-gray-500 shrink-0">@ {bookmark.company}</span>
          </div>
          {bookmark.notes && (
            <p className="text-xs text-gray-400 truncate mt-0.5 italic">{bookmark.notes}</p>
          )}
        </div>

        {/* Middle: platform + status + date */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <PlatformBadge platform={bookmark.platform} />
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[bookmark.status]}`}>
            {bookmark.status.charAt(0).toUpperCase() + bookmark.status.slice(1)}
          </span>
          <span className="text-xs text-gray-400 whitespace-nowrap">{date}</span>
        </div>

        {/* Right: actions — all stop propagation */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.preventDefault()}>
          <select
            value={bookmark.status}
            onChange={handleStatusChange}
            disabled={loading}
            onClick={(e) => e.preventDefault()}
            className="text-xs px-1.5 py-1 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#d4622a] hidden sm:block"
          >
            <option value="saved">Saved</option>
            <option value="applied">Applied</option>
            <option value="discarded">Discarded</option>
          </select>

          <button
            type="button"
            title="View Job"
            onClick={(e) => {
              e.stopPropagation();
              window.open(bookmark.jobUrl, '_blank', 'noopener,noreferrer');
            }}
            className="p-1.5 text-gray-400 hover:text-[#d4622a] transition-colors"
          >
            <FiExternalLink size={14} />
          </button>

          <button
            onClick={handleConvert}
            disabled={loading}
            title="Convert to application"
            className="p-1.5 text-gray-400 hover:text-[#d4622a] transition-colors disabled:opacity-50"
          >
            <FiArrowRight size={14} />
          </button>

          <button
            onClick={handleDelete}
            disabled={loading}
            title="Delete"
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>

      {/* Mobile badges */}
      <div className="flex sm:hidden items-center gap-2 mt-1.5 flex-wrap">
        <PlatformBadge platform={bookmark.platform} />
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[bookmark.status]}`}>
          {bookmark.status.charAt(0).toUpperCase() + bookmark.status.slice(1)}
        </span>
        <span className="text-xs text-gray-400">{date}</span>
      </div>
    </Link>
  );
}
