"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { usePageReady } from "@/context/PageReadyContext";

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  coverImage?: string;
  author: {
    name: string;
    avatar?: string;
  };
  publishedAt: string;
  readTime: number;
  featured: boolean;
  stats?: {
    views?: { total: number };
    likes?: { total: number };
    comments?: { total: number };
  };
}

interface CategoryCount {
  category: string;
  count: number;
}

interface BlogsResponse {
  success: boolean;
  data: {
    blogs: Blog[];
    metadata: { categories: string[]; tags: string[] };
    pagination: { total: number; page: number; limit: number; pages: number };
  };
  error?: string;
}

/* ── Accent color cycling by category ── */
const ACCENT_CLASSES = [
  "bg-gradient-to-r from-accent-orange to-[#f5a87a]",
  "bg-gradient-to-r from-accent-teal to-[#6ab8ae]",
  "bg-gradient-to-r from-accent-blue to-[#6a9fd8]",
  "bg-gradient-to-r from-deep-brown to-warm-brown",
];
const accentCache = new Map<string, number>();
let accentIdx = 0;
function getAccent(category: string) {
  if (!accentCache.has(category)) {
    accentCache.set(category, accentIdx % ACCENT_CLASSES.length);
    accentIdx++;
  }
  return ACCENT_CLASSES[accentCache.get(category)!];
}

/* ── Shared SVG icons ── */
const ClockIcon = () => (
  <svg className="w-[11px] h-[11px] opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
  </svg>
);
const EyeIcon = () => (
  <svg className="w-3 h-3 opacity-55" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
const ArrowIcon = () => (
  <svg className="w-[13px] h-[13px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);
const SearchIcon = () => (
  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

export default function Blogs() {
  const { setReady } = usePageReady();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false); // true after first successful load
  const [error, setError] = useState<string | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [featuredPost, setFeaturedPost] = useState<Blog | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCategoryCounts = async () => {
    try {
      const res = await fetch("/api/blogs?limit=1000");
      const data: BlogsResponse = await res.json();
      if (data.success) {
        const map = new Map<string, number>();
        data.data.blogs.forEach((b) => map.set(b.category, (map.get(b.category) || 0) + 1));
        setCategories([
          { category: "All", count: data.data.blogs.length },
          ...Array.from(map.entries())
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count),
        ]);
      }
    } catch (e) {
      console.error("Error fetching category counts:", e);
    }
  };

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "9",
        sortBy: "publishedAt",
        sortOrder: "desc",
        status: "published",
      });
      if (searchTerm) params.set("search", searchTerm);
      if (selectedCategory !== "All") params.set("category", selectedCategory);

      const res = await fetch(`/api/blogs?${params}`);
      const data: BlogsResponse = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to fetch blogs");

      setBlogs(data.data.blogs);
      setTotalPages(data.data.pagination.pages);

      if (!featuredPost) {
        const fRes = await fetch("/api/blogs?featured=true&limit=1");
        const fData: BlogsResponse = await fRes.json();
        if (fData.success && fData.data.blogs.length > 0) setFeaturedPost(fData.data.blogs[0]);
      }
    } catch (e) {
      console.error("Error fetching blogs:", e);
      setError(e instanceof Error ? e.message : "Failed to fetch blogs");
    } finally {
      setLoading(false);
      setHasLoaded(true);
      setReady();
    }
  }, [searchTerm, selectedCategory, currentPage, featuredPost, setReady]);

  useEffect(() => { fetchCategoryCounts(); }, []);
  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

  const clearFilters = () => { setSearchTerm(""); setSelectedCategory("All"); setCurrentPage(1); };
  const hasActiveFilters = searchTerm !== "" || selectedCategory !== "All";

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const formatNumber = (num: number) => (num >= 1000 ? (num / 1000).toFixed(1) + "k" : num.toString());

  /* ── LOADING (subsequent filter/page changes only — initial load is handled by NavigationLoader) ── */
  if (loading && hasLoaded) {
    return (
      <div className="min-h-screen bg-cream font-body">
        <div className="pt-6"><Header /></div>
        <main className="max-w-[1100px] mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="h-4 w-32 bg-cream-dark rounded mx-auto mb-3 animate-pulse" />
            <div className="h-10 w-48 bg-cream-dark rounded mx-auto mb-4 animate-pulse" />
            <div className="h-4 w-80 bg-cream-dark rounded mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-off-white border border-cream-deeper rounded-[.85rem] overflow-hidden animate-pulse">
                <div className="h-3 bg-cream-dark" />
                <div className="p-6 space-y-3">
                  <div className="h-3 bg-cream-dark rounded w-20" />
                  <div className="h-5 bg-cream-dark rounded w-3/4" />
                  <div className="h-4 bg-cream-dark rounded w-full" />
                  <div className="h-4 bg-cream-dark rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  /* ── ERROR ── */
  if (error && hasLoaded) {
    return (
      <div className="min-h-screen bg-cream font-body">
        <div className="pt-6"><Header /></div>
        <main className="max-w-[1100px] mx-auto px-4 py-16">
          <div className="bg-off-white border border-cream-deeper text-ink px-6 py-4 rounded-[.85rem]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold">Error loading articles</p>
                <p className="text-sm mt-1 text-warm-brown">{error}</p>
              </div>
              <button
                onClick={() => { setError(null); fetchBlogs(); }}
                className="shrink-0 text-sm px-4 py-2 bg-cream-dark text-ink rounded-full hover:bg-cream-deeper transition-all duration-200 border border-cream-deeper"
              >
                Try again
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream font-body">
      <div className="pt-6"><Header /></div>

      <main className="max-w-[1100px] mx-auto px-4 py-16">

        {/* ── HEADER ── */}
        <div className="text-center mb-12">
          <p className="font-mono text-[.68rem] tracking-[.25em] uppercase text-accent-orange mb-3 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-accent-orange opacity-50" />
            Browse My Recent
            <span className="w-8 h-px bg-accent-orange opacity-50" />
          </p>
          <h1 className="font-heading text-[clamp(2.2rem,5vw,3.6rem)] font-light leading-[1.05] text-ink mb-4">
            My <em className="italic text-warm-brown">Blog</em>
          </h1>
          <p className="text-[.9rem] text-text-muted max-w-[54ch] mx-auto leading-[1.75] font-light">
            Thoughts, tutorials, and insights on backend engineering, system
            design, and software development.
          </p>
        </div>

        {/* ── CONTROLS ── */}
        <div className="flex items-center justify-between gap-4 flex-wrap mb-9">
          {/* Filter pills */}
          {categories.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat.category}
                  onClick={() => { setSelectedCategory(cat.category); setCurrentPage(1); }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[.82rem] font-medium border-[1.5px] transition-all duration-200 whitespace-nowrap font-body ${
                    selectedCategory === cat.category
                      ? "bg-ink text-off-white border-ink"
                      : "bg-off-white text-text-muted border-cream-deeper hover:border-sand hover:text-ink"
                  }`}
                >
                  {cat.category}
                  <span className="font-mono text-[.62rem] opacity-60">{cat.count}</span>
                </button>
              ))}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-3.5 py-1.5 rounded-full text-[.82rem] font-medium text-accent-orange bg-[rgba(212,98,42,.06)] border-[1.5px] border-[rgba(212,98,42,.25)] hover:bg-[rgba(212,98,42,.12)] transition-all duration-200"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {/* Search */}
          <div className="relative flex-1 max-w-[320px]">
            <input
              type="text"
              placeholder="Search articles…"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full py-2 px-4 border-[1.5px] border-cream-deeper rounded-full bg-off-white font-body text-[.84rem] text-ink outline-none transition-all duration-200 placeholder:text-text-muted focus:border-sand focus:shadow-[0_0_0_3px_rgba(201,185,154,.2)]"
            />
          </div>
        </div>

        {/* ── BLOG GRID ── */}
        {blogs.length === 0 ? (
          <div className="text-center py-16 text-text-muted">
            <p className="font-heading text-[2.5rem] opacity-20 mb-2">📝</p>
            <p className="text-[.9rem] font-light">
              {hasActiveFilters
                ? "No articles match your filter. Try adjusting your search."
                : "No articles published yet. Check back soon!"}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 px-5 py-2 bg-off-white text-ink rounded-full border border-cream-deeper hover:border-sand transition-all duration-200 text-[.84rem] font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
            {/* Featured post — full width */}
            {featuredPost && !hasActiveFilters && (
              <Link
                href={`/blogs/${featuredPost.slug}`}
                className="group col-span-full block"
              >
                <article className="bg-off-white border border-cream-deeper rounded-[.85rem] overflow-hidden flex flex-col transition-all duration-300 hover:border-sand hover:shadow-[0_8px_28px_rgba(74,55,40,.1)] hover:-translate-y-[3px]">
                  <div className={`h-[3px] w-full ${getAccent(featuredPost.category)}`} />
                  <div className="p-6 flex-1 flex flex-col sm:flex-row gap-8 items-start">
                    {/* Left */}
                    <div className="flex-1">
                      <p className="font-mono text-[.58rem] tracking-[.18em] uppercase text-accent-orange mb-2 flex items-center gap-1.5 before:content-['★'] before:text-[.55rem]">
                        Featured
                      </p>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="font-mono text-[.6rem] tracking-[.1em] uppercase px-3 py-1 rounded-full border border-cream-deeper bg-cream-dark text-warm-brown">
                          {featuredPost.category}
                        </span>
                        <span className="font-mono text-[.6rem] text-text-muted flex items-center gap-1">
                          <ClockIcon />
                          {featuredPost.readTime} min read
                        </span>
                      </div>
                      <h3 className="font-heading text-[1.5rem] font-semibold leading-[1.25] text-ink mb-2 transition-colors duration-200 group-hover:text-accent-orange">
                        {featuredPost.title}
                      </h3>
                      <p className="text-[.82rem] leading-[1.7] text-text-muted font-light line-clamp-3 mb-3">
                        {featuredPost.excerpt}
                      </p>
                      {featuredPost.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {featuredPost.tags.slice(0, 4).map((tag) => (
                            <span key={tag} className="font-mono text-[.6rem] tracking-[.04em] text-accent-orange">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Right */}
                    <div className="w-full sm:w-[220px] flex-shrink-0 flex sm:flex-col justify-between gap-4 sm:pt-1">
                      <div>
                        <div className="font-mono text-[.65rem] text-text-muted">
                          {formatDate(featuredPost.publishedAt)}
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="font-mono text-[.62rem] text-text-muted flex items-center gap-1">
                            <EyeIcon />
                            {formatNumber(featuredPost.stats?.views?.total || 0)} views
                          </span>
                        </div>
                      </div>
                      <span className="flex items-center gap-1.5 text-[.78rem] font-medium text-accent-orange opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">
                        Read article
                        <ArrowIcon />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            )}

            {/* Regular cards */}
            {blogs.map((post) => (
              <Link
                key={post._id}
                href={`/blogs/${post.slug}`}
                className="group block"
              >
                <article className="bg-off-white border border-cream-deeper rounded-[.85rem] overflow-hidden flex flex-col h-full transition-all duration-300 hover:border-sand hover:shadow-[0_8px_28px_rgba(74,55,40,.1)] hover:-translate-y-[3px]">
                  <div className={`h-[3px] w-full ${getAccent(post.category)}`} />
                  <div className="p-5 flex-1 flex flex-col gap-3">
                    {/* Meta top */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[.6rem] tracking-[.1em] uppercase px-3 py-1 rounded-full border border-cream-deeper bg-cream-dark text-warm-brown">
                        {post.category}
                      </span>
                      <span className="font-mono text-[.6rem] text-text-muted flex items-center gap-1">
                        <ClockIcon />
                        {post.readTime} min read
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-heading text-[1.25rem] font-semibold leading-[1.25] text-ink transition-colors duration-200 group-hover:text-accent-orange">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-[.82rem] leading-[1.7] text-text-muted font-light line-clamp-2">
                      {post.excerpt}
                    </p>

                    {/* Tags */}
                    {post.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-0.5">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="font-mono text-[.6rem] tracking-[.04em] text-accent-orange">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between px-5 py-4 border-t border-cream-deeper bg-[rgba(240,236,227,.35)]">
                    <span className="font-mono text-[.65rem] text-text-muted">
                      {formatDate(post.publishedAt)}
                    </span>
                    <div className="flex items-center gap-3.5">
                      <span className="font-mono text-[.62rem] text-text-muted flex items-center gap-1">
                        <EyeIcon />
                        {formatNumber(post.stats?.views?.total || 0)}
                      </span>
                      <span className="flex items-center gap-1.5 text-[.78rem] font-medium text-accent-orange opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">
                        Read
                        <ArrowIcon />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}

        {/* ── PAGINATION ── */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-cream-deeper rounded-lg bg-off-white disabled:opacity-40 disabled:cursor-not-allowed hover:border-sand transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-lg text-[.84rem] font-medium transition-all duration-200 ${
                      page === currentPage
                        ? "bg-ink text-off-white"
                        : "border border-cream-deeper bg-off-white text-ink hover:border-sand"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-cream-deeper rounded-lg bg-off-white disabled:opacity-40 disabled:cursor-not-allowed hover:border-sand transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
