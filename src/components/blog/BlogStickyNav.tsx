"use client";

import { useState } from "react";
import Link from "next/link";

interface BlogStickyNavProps {
  readTime: number;
  slug: string;
}

export default function BlogStickyNav({ readTime, slug }: BlogStickyNavProps) {
  const [bookmarked, setBookmarked] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ url: window.location.href });
      } catch {
        /* cancelled */
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <nav className="sticky top-0 z-[900] bg-[rgba(240,236,227,.88)] backdrop-blur-[12px] border-b border-cream-deeper">
      <div className="max-w-[1200px] mx-auto px-6 py-3 flex items-center justify-between gap-4">
      <Link
        href="/blogs"
        className="flex items-center gap-2 font-mono text-[.7rem] tracking-[.08em] text-text-muted no-underline transition-colors duration-200 hover:text-accent-orange group"
      >
        <svg
          className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-[3px]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Blog
      </Link>

      <div className="flex items-center gap-5">
        <span className="font-mono text-[.65rem] text-text-muted flex items-center gap-1.5">
          <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
          </svg>
          {readTime} min read
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setBookmarked(!bookmarked)}
            title="Bookmark"
            className={`w-8 h-8 rounded-full border-[1.5px] flex items-center justify-center cursor-pointer transition-all duration-200 ${
              bookmarked
                ? "bg-ink border-ink text-off-white"
                : "border-cream-deeper bg-off-white text-text-muted hover:border-sand hover:text-ink hover:bg-cream-dark"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
          <button
            onClick={handleShare}
            title="Share"
            className="w-8 h-8 rounded-full border-[1.5px] border-cream-deeper bg-off-white flex items-center justify-center cursor-pointer transition-all duration-200 text-text-muted hover:border-sand hover:text-ink hover:bg-cream-dark"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>
      </div>
    </nav>
  );
}
