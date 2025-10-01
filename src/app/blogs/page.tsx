"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Search, 
  Tag, 
  X, 
  Filter, 
  Calendar, 
  Clock, 
  Eye, 
  Heart, 
  MessageCircle, 
  TrendingUp,
  BookOpen,
  User,
  ChevronRight,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Hash,
  Bookmark,
  Share2
} from "lucide-react";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import LoadingScreen from '@/components/shared/LoadingScreen';

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
    views?: {
      total: number;
    };
    likes?: {
      total: number;
    };
    comments?: {
      total: number;
    };
  };
}

interface CategoryCount {
  category: string;
  count: number;
}

interface TagCount {
  tag: string;
  count: number;
}

interface BlogsResponse {
  success: boolean;
  data: {
    blogs: Blog[];
    metadata: {
      categories: string[];
      tags: string[];
    };
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
  error?: string;
}

export default function Blogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [tags, setTags] = useState<TagCount[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<Blog[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch category and tag counts
  const fetchCategoryCounts = async () => {
    try {
      const response = await fetch('/api/blogs');
      const data: BlogsResponse = await response.json();
      
      if (data.success) {
        // Count posts by category
        const categoryMap = new Map<string, number>();
        const tagMap = new Map<string, number>();
        
        // Get all blogs to count categories and tags
        const allBlogsResponse = await fetch('/api/blogs?limit=1000');
        const allBlogsData: BlogsResponse = await allBlogsResponse.json();
        
        if (allBlogsData.success) {
          allBlogsData.data.blogs.forEach(blog => {
            // Count categories
            categoryMap.set(blog.category, (categoryMap.get(blog.category) || 0) + 1);
            
            // Count tags
            blog.tags.forEach(tag => {
              tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
            });
          });
        }
        
        // Convert to arrays and sort
        const categoryCounts: CategoryCount[] = [
          { category: "All", count: allBlogsData.data.blogs.length },
          ...Array.from(categoryMap.entries()).map(([category, count]) => ({ category, count }))
        ].sort((a, b) => b.count - a.count);
        
        const tagCounts: TagCount[] = Array.from(tagMap.entries())
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count);
        
        setCategories(categoryCounts);
        setTags(tagCounts);
      }
    } catch (error) {
      console.error('Error fetching category counts:', error);
    }
  };

  // Fetch blogs with filters
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        sortBy: sortBy === 'newest' ? 'publishedAt' : 
                sortBy === 'oldest' ? 'publishedAt' : 
                sortBy === 'popular' ? 'views' :
                'title',
        sortOrder: sortBy === 'oldest' ? 'asc' : 'desc',
        status: 'published'
      });

      if (searchTerm) params.set('search', searchTerm);
      if (selectedCategory !== 'All') params.set('category', selectedCategory);
      if (selectedTags.length > 0) {
        selectedTags.forEach(tag => params.append('tag', tag));
      }

      const response = await fetch(`/api/blogs?${params.toString()}`);
      const data: BlogsResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch blogs');
      }

      setBlogs(data.data.blogs);
      setTotalPages(data.data.pagination.pages);
      setTotalPosts(data.data.pagination.total);

      // Fetch featured posts if not already loaded
      if (featuredPosts.length === 0) {
        const featuredResponse = await fetch('/api/blogs?featured=true&limit=3');
        const featuredData: BlogsResponse = await featuredResponse.json();
        if (featuredData.success) {
          setFeaturedPosts(featuredData.data.blogs);
        }
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  // Initialize data
  useEffect(() => {
    fetchCategoryCounts();
  }, []);

  // Fetch blogs when filters change
  useEffect(() => {
    fetchBlogs();
  }, [searchTerm, selectedCategory, selectedTags, sortBy, currentPage]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedTags([]);
    setSortBy("newest");
    setCurrentPage(1);
  };

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
      setCurrentPage(1);
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm !== "" || selectedCategory !== "All" || selectedTags.length > 0 || sortBy !== "newest";

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-orange-50 font-ui">
        <div className="pt-6">
          <Header />
        </div>
        <main className="relative">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-7xl mx-auto">
              {/* Page Header Skeleton */}
              <div className="text-center mb-12">
                <div className="h-4 w-32 bg-gray-200 rounded mx-auto mb-3 animate-pulse" />
                <div className="h-8 w-48 bg-gray-200 rounded mx-auto mb-6 animate-pulse" />
                <div className="h-4 w-96 bg-gray-200 rounded mx-auto animate-pulse" />
              </div>

              {/* Featured Skeleton */}
              <div className="mb-12">
                <div className="h-6 w-40 bg-gray-200 rounded mb-5 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-300 overflow-hidden animate-pulse" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)'}}>
                      <div className="aspect-video bg-gray-200" />
                      <div className="p-5 space-y-3">
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                        <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grid Skeleton */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-300 overflow-hidden animate-pulse" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)'}}>
                    <div className="h-32 bg-gray-200" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-full" />
                      <div className="h-3 bg-gray-200 rounded w-5/6" />
                      <div className="flex gap-1.5 pt-1.5">
                        <div className="h-5 bg-gray-200 rounded-full w-12" />
                        <div className="h-5 bg-gray-200 rounded-full w-16" />
                        <div className="h-5 bg-gray-200 rounded-full w-14" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-orange-50 font-ui">
        <div className="pt-6">
          <Header />
        </div>
        <main className="relative">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-7xl mx-auto">
              {/* Inline error (non-blocking layout) */}
              <div className="mb-8 bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-2xl shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-red-900">Error loading articles</p>
                    <p className="text-sm mt-1 text-red-700">{error}</p>
                  </div>
                  <button
                    onClick={() => {
                      setError(null);
                      fetchBlogs();
                    }}
                    className="shrink-0 text-sm px-4 py-2 bg-red-100 text-red-800 rounded-xl hover:bg-red-200 transition-all duration-300 border border-red-300"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-orange-50 font-ui">
      <div className="pt-6">
        <Header />
      </div>
      
      <main className="relative">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-7xl mx-auto">
            {/* Page Title */}
            <div className="text-center mb-12">
              <h4 className="text-caption text-gray-500 mb-3 tracking-wider uppercase">Browse My Recent</h4>
              <h1 className="text-h3 md:text-h2 weight-bold text-gray-900 mb-6">
                Blog Posts
              </h1>
              <p className="text-body-sm text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Explore my thoughts, tutorials, and insights on web development, technology, and software engineering. Use search and filters to quickly find articles by category, tags, or topic.
              </p>
            </div>

            {/* Featured Posts */}
            {featuredPosts.length > 0 && (
              <section className="mb-12">
                <h2 className="text-h4 weight-semibold text-gray-900 mb-5">Featured Posts</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {featuredPosts.map((post) => (
                    <Link
                      key={post._id}
                      href={`/blogs/${post.slug}`}
                      className="group block"
                    >
                      <article className="bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-300 overflow-hidden shadow-inner" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)'}}>
                        {post.coverImage && (
                          <div className="aspect-video overflow-hidden">
                            <img
                              src={post.coverImage}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="p-5">
                          <div className="flex items-center gap-2 mb-2.5 text-xs">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-caption rounded-full">
                              {post.category}
                            </span>
                            {post.featured && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-caption rounded-full">
                                ⭐ Featured
                              </span>
                            )}
                          </div>
                          <h3 className="text-h5 weight-semibold text-gray-900 mb-1.5 line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-gray-600 text-body-sm mb-3 line-clamp-3">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center justify-between text-caption text-gray-500">
                            <div className="flex items-center gap-1.5">
                              <User className="w-4 h-4" />
                              <span>{post.author.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              <span>{post.readTime} min read</span>
                            </div>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Filters and Search */}
            <div className="mb-8 space-y-4 text-sm font-ui">
              {/* Search and View Toggle */}
              <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-2 items-start lg:items-center justify-between">
                  {/* Search Section */}
                  <div className="flex-1 w-full lg:w-auto">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search articles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full !pl-8 pr-8 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 transition-all duration-300"
                      />
                      {searchTerm && (
                        <button 
                          className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400 hover:text-gray-600 transition-colors"
                          onClick={() => setSearchTerm('')}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Controls Section */}
                  <div className="flex items-center gap-3 w-full lg:w-auto">
                    {/* Filter Toggle */}
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border transition-all duration-300 ${
                        showFilters
                          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg ring-2 ring-blue-200'
                          : hasActiveFilters
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Filter className={`w-3.5 h-3.5 transition-all duration-300 ${
                        showFilters ? 'text-blue-600 drop-shadow-sm' : ''
                      }`} />
                      {hasActiveFilters && (
                        <span className="inline-flex items-center justify-center w-4 h-4 text-xs font-bold rounded-full bg-blue-500 text-white">
                          {[searchTerm, selectedCategory !== 'All', selectedTags.length > 0, sortBy !== 'newest'].filter(Boolean).length}
                        </span>
                      )}
                    </button>
                    
                    {/* View Toggle */}
                    <div className="flex rounded-md border border-gray-300 overflow-hidden bg-white">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 transition-all duration-300 ${
                          viewMode === 'grid'
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        aria-label="Grid view"
                      >
                        <Grid className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 transition-all duration-300 ${
                          viewMode === 'list'
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        aria-label="List view"
                      >
                        <List className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Filters */}
              {showFilters && (
                <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 items-end">
                    {/* Category Filter */}
                    <div className="w-full">
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                          <Tag className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className={`block w-full pl-8 pr-6 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none text-gray-900 transition-all duration-300 ${
                            selectedCategory !== 'All' 
                              ? 'bg-blue-50 border-blue-300 text-blue-900' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <option value="All">All Categories</option>
                          {categories.map((cat) => (
                            <option key={cat.category} value={cat.category}>
                              {cat.category} ({cat.count})
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 pr-3 flex items-center">
                          <svg className="h-3.5 w-3.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Sort Options */}
                    <div className="w-full">
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                          <SortAsc className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className={`block w-full pl-8 pr-6 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none text-gray-900 transition-all duration-300 ${
                            sortBy !== 'newest' 
                              ? 'bg-blue-50 border-blue-300 text-blue-900' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <option value="newest">Newest First</option>
                          <option value="oldest">Oldest First</option>
                          <option value="popular">Most Popular</option>
                          <option value="trending">Trending</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 pr-3 flex items-center">
                          <svg className="h-3.5 w-3.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                      <div className="w-full flex justify-end">
                        <button
                          onClick={clearFilters}
                          className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-all duration-300"
                        >
                          Clear all filters
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Tag Pills */}
                  {tags.length > 0 && (
                    <div className="mt-3 col-span-full">
                      <div className="flex flex-wrap gap-1">
                        {tags.slice(0, 20).map(tag => (
                          <button
                            key={tag.tag}
                            onClick={() => {
                              if (selectedTags.includes(tag.tag)) {
                                removeTag(tag.tag);
                              } else {
                                addTag(tag.tag);
                              }
                            }}
                            className={`px-2 py-1 rounded-sm text-xs font-medium transition-all duration-300 ${
                              selectedTags.includes(tag.tag)
                                ? 'bg-blue-500 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                            }`}
                          >
                            #{tag.tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Results Count */}
            <div className="flex justify-between items-center -mt-2 mb-6">
              <p className="text-caption text-gray-700 font-medium">
                Showing {blogs.length} {blogs.length === 1 ? 'article' : 'articles'}
                {hasActiveFilters ? ' with filters applied' : ''}
              </p>
            </div>

            {/* Blog Grid/List */}
            {blogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="bg-gray-100 rounded-full p-6 mb-6 shadow-sm">
                  <BookOpen className="h-10 w-10 text-gray-500" />
                </div>
                <h3 className="text-h5 weight-semibold text-gray-900 mb-3">No articles found</h3>
                <p className="text-body-sm text-gray-600 max-w-md leading-relaxed">
                  {hasActiveFilters 
                    ? 'Try adjusting your filters or search term to find what you\'re looking for.'
                    : 'There are no articles available at the moment.'}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-6 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 text-button font-semibold border border-gray-300"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <div className={viewMode === "grid" ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr" : "space-y-4"}>
                {blogs.map((post) => (
                  <div 
                    key={post._id} 
                    className={`transition-all duration-500 animate-fadeIn ${
                      viewMode === 'list' ? 'max-w-full' : ''
                    }`}
                  >
                    <Link
                      href={`/blogs/${post.slug}`}
                      className="group block h-full"
                    >
                      <article className={`bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-300 overflow-hidden shadow-inner h-full flex flex-col ${
                        viewMode === "list" ? "flex-row" : ""
                      }`} style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)'}}>
                        {post.coverImage && (
                          <div className={`overflow-hidden flex-shrink-0 ${viewMode === "list" ? "w-48" : "h-32"}`}>
                            <img
                              src={post.coverImage}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className={`p-4 flex flex-col flex-grow ${viewMode === "list" ? "flex-1" : ""}`}>
                          <div className="flex items-center gap-2 mb-2.5">
                            <span className="px-2 py-1 bg-white border border-gray-300 text-caption font-medium text-gray-700 rounded-full shadow-inner" style={{boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'}}>
                              {post.category}
                            </span>
                            {post.featured && (
                              <span className="px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-600 text-caption font-semibold text-white rounded-full shadow-lg border border-yellow-400">
                                ⭐ Featured
                              </span>
                            )}
                          </div>
                          <h3 className="text-h5 weight-semibold text-gray-900 mb-1.5 line-clamp-2 leading-tight">
                            {post.title}
                          </h3>
                          <div className="mb-2.5 flex-grow">
                            <p className="text-gray-600 text-body-sm line-clamp-2 leading-snug">
                              {post.excerpt}
                            </p>
                          </div>
                          
                          {/* Tags */}
                          {post.tags && post.tags.length > 0 && (
                            <div className="mb-3">
                              <div className="flex flex-wrap gap-1.5">
                                {post.tags.slice(0, 3).map((tag) => (
                                  <button
                                    key={tag}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      addTag(tag);
                                    }}
                                    className="rounded-full bg-white border border-gray-300 px-2.5 py-1 text-caption font-medium text-gray-700 shadow-inner hover:bg-gray-50"
                                    style={{boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'}}
                                  >
                                    #{tag}
                                  </button>
                                ))}
                                {post.tags.length > 3 && (
                                  <span className="rounded-full bg-gray-100 border border-gray-400 px-2.5 py-1 text-caption font-medium text-gray-700 shadow-inner" style={{boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.15)'}}>
                                    +{post.tags.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between pt-2.5 border-t border-gray-200 mt-auto">
                            <div className="flex items-center gap-1.5 text-caption text-gray-500">
                              <User className="w-3 h-3" />
                              <span>{post.author.name}</span>
                            </div>
                            <div className="flex items-center gap-3 text-caption text-gray-500">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3 h-3" />
                                <span>{post.readTime} min</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Eye className="w-3 h-3" />
                                <span>{formatNumber(post.stats?.views?.total || 0)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-16 flex justify-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 border rounded-lg text-sm ${
                          page === currentPage
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 