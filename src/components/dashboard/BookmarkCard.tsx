'use client';

import { useState } from 'react';
import { FiExternalLink, FiEdit2, FiTrash2, FiArrowRight } from 'react-icons/fi';
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
  onEdit: (id: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  saved: 'bg-blue-100 text-blue-800',
  applied: 'bg-green-100 text-green-800',
  discarded: 'bg-red-100 text-red-800',
};

export default function BookmarkCard({
  bookmark,
  onStatusChange,
  onDelete,
  onConvert,
  onEdit,
}: BookmarkCardProps) {
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLoading(true);
    try {
      await onStatusChange(bookmark._id, e.target.value);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Delete this bookmark?')) {
      setLoading(true);
      try {
        await onDelete(bookmark._id);
      } finally {
        setLoading(false);
      }
    }
  };

  const date = new Date(bookmark.bookmarkedDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="border border-[#e8e3db] rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900">{bookmark.jobTitle}</h3>
          <p className="text-sm text-gray-600">{bookmark.company}</p>

          <div className="flex items-center gap-2 mt-2">
            <PlatformBadge platform={bookmark.platform} />
            <span className={`px-2 py-1 text-xs font-semibold rounded ${STATUS_COLORS[bookmark.status]}`}>
              {bookmark.status.charAt(0).toUpperCase() + bookmark.status.slice(1)}
            </span>
          </div>

          {bookmark.notes && <p className="text-xs text-gray-600 mt-2 italic">{bookmark.notes}</p>}

          <div className="flex items-center gap-4 mt-3">
            <a
              href={bookmark.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#d4622a] hover:text-[#2a2118] flex items-center gap-1"
            >
              View Job <FiExternalLink size={14} />
            </a>
            <span className="text-xs text-gray-500">{date}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4 border-t border-gray-200 pt-3">
        <select
          value={bookmark.status}
          onChange={handleStatusChange}
          disabled={loading}
          className="text-xs px-2 py-1 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#d4622a]"
        >
          <option value="saved">Saved</option>
          <option value="applied">Applied</option>
          <option value="discarded">Discarded</option>
        </select>

        <button
          onClick={() => onConvert(bookmark._id)}
          disabled={loading}
          className="text-xs px-3 py-1 bg-[#d4622a] text-white rounded hover:bg-[#2a2118] flex items-center gap-1 disabled:opacity-50"
          title="Convert to application"
        >
          Convert <FiArrowRight size={12} />
        </button>

        <button
          onClick={() => onEdit(bookmark._id)}
          disabled={loading}
          className="text-xs px-3 py-1 border border-[#d4622a] text-[#d4622a] rounded hover:bg-[#f0ece3] flex items-center gap-1 disabled:opacity-50"
        >
          <FiEdit2 size={12} /> Edit
        </button>

        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs px-3 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50 flex items-center gap-1 disabled:opacity-50 ml-auto"
        >
          <FiTrash2 size={12} /> Delete
        </button>
      </div>
    </div>
  );
}
