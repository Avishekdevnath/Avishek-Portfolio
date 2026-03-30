'use client';

import Link from 'next/link';
import { ArrowLeft, Edit2, ExternalLink } from 'lucide-react';
import type { BookmarkDetailItem } from '@/types/job-hunt';

const STATUS_COLORS: Record<string, string> = {
  saved: 'bg-blue-100 text-blue-700',
  applied: 'bg-green-100 text-green-700',
  discarded: 'bg-red-100 text-red-700',
};

interface Props {
  bookmark: BookmarkDetailItem;
  onEditClick: () => void;
}

export default function BookmarkDetailHeader({ bookmark, onEditClick }: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-[#e8e3db]">
      <div className="flex items-start gap-3">
        <Link
          href="/dashboard/job-hunt/bookmarks"
          className="mt-1 p-1.5 rounded-lg text-[#8a7a6a] hover:bg-[#f3f1ee] hover:text-[#2a2118] transition-colors shrink-0"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <p className="text-[0.65rem] font-mono tracking-[0.15em] uppercase text-[#8a7a6a]">
            {bookmark.platform} · {bookmark.company}
          </p>
          <h1 className="text-lg font-semibold text-[#2a2118] leading-tight">{bookmark.jobTitle}</h1>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[bookmark.status]}`}>
              {bookmark.status.charAt(0).toUpperCase() + bookmark.status.slice(1)}
            </span>
            <a
              href={bookmark.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-[#d4622a] hover:underline font-mono"
            >
              View posting <ExternalLink size={11} />
            </a>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 pl-10 sm:pl-0">
        <button
          onClick={onEditClick}
          className="flex items-center gap-1.5 px-3 py-2 border border-[#e8e3db] text-xs text-[#2a2118] rounded-lg hover:bg-[#f3f1ee] transition-colors"
        >
          <Edit2 size={13} /> Edit
        </button>

        {bookmark.linkedApplicationId ? (
          <Link
            href={`/dashboard/job-hunt/applications/${bookmark.linkedApplicationId}`}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#2a2118] text-white text-xs rounded-lg hover:bg-[#d4622a] transition-colors"
          >
            View Application →
          </Link>
        ) : (
          <span className="text-xs text-[#c0b8ae] italic">Not yet applied</span>
        )}
      </div>
    </div>
  );
}
