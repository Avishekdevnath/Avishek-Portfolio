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
import LoadingScreen from "@/components/shared/LoadingScreen";

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Header />
        <LoadingScreen 
          type="blogs"
          className="mt-16"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            <h3 className="font-semibold mb-2">Error Loading Blogs</h3>
            <p>{error}</p>
            <button
              onClick={() => {
                setError(null);
                fetchBlogs();
              }}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h4 className="text-md text-gray-600 mb-2">Welcome to My</h4>
          <h1 className="text-5xl font-bold text-gray-900">Blog</h1>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Explore my thoughts, tutorials, and insights on web development, technology, and software engineering.
          </p>
        </div>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredPosts.map((post) => (
                <Link
                  key={post._id}
                  href={`/blogs/${post.slug}`}
                  className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {post.coverImage && (
                    <div className="aspect-video relative">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                        {post.category}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(post.publishedAt)}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-2">{post.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Search and Filters */}
        <section className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Clean Search Design */}
              <div className="flex-1 max-w-lg">
                <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-transparent transition-all duration-300 shadow-sm hover:shadow-md">
                  <Search className="text-gray-400 flex-shrink-0" size={20} />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="flex-1 bg-transparent border-0 focus:outline-none text-gray-700 placeholder-gray-400 text-base"
                  />
                  {searchTerm ? (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setCurrentPage(1);
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 flex-shrink-0"
                    >
                      <X size={18} />
                    </button>
                  ) : (
                    <div className="text-xs text-gray-400 hidden sm:block flex-shrink-0">
                      ⌘K
                    </div>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="newest">Latest</option>
                  <option value="oldest">Oldest</option>
                  <option value="popular">Most Popular</option>
                  <option value="title">A-Z</option>
                </select>

                {/* View Mode */}
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${viewMode === "grid" ? "bg-teal-500 text-white" : "bg-white text-gray-600"}`}
                  >
                    <Grid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${viewMode === "list" ? "bg-teal-500 text-white" : "bg-white text-gray-600"}`}
                  >
                    <List size={20} />
                  </button>
                </div>

                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <Filter size={20} />
                  <span>Filters</span>
                </button>
              </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                {selectedCategory !== "All" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm">
                    <Tag size={14} />
                    {selectedCategory}
                    <button
                      onClick={() => setSelectedCategory("All")}
                      className="ml-1 text-teal-600 hover:text-teal-800"
                    >
                      <X size={14} />
                    </button>
                  </span>
                )}
                {selectedTags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    <Hash size={14} />
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-purple-600 hover:text-purple-800"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-600 hover:text-red-800 underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar */}
              <aside className={`lg:w-80 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Categories */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Bookmark className="text-teal-500" size={20} />
                    <h3 className="text-lg font-semibold">Categories</h3>
                  </div>
                  <div className="space-y-2">
                    {categories.map(({ category, count }) => (
                      <button
                        key={category}
                        onClick={() => {
                          setSelectedCategory(category);
                          setCurrentPage(1);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                          selectedCategory === category
                            ? "bg-teal-500 text-white shadow-md"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <span className="font-medium">{category}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          selectedCategory === category
                            ? "bg-white/20 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Hash className="text-purple-500" size={20} />
                    <h3 className="text-lg font-semibold">Popular Tags</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.slice(0, 20).map(({ tag, count }) => (
                      <button
                        key={tag}
                        onClick={() => addTag(tag)}
                        disabled={selectedTags.includes(tag)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-all ${
                          selectedTags.includes(tag)
                            ? "bg-purple-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-purple-100 hover:text-purple-700"
                        }`}
                      >
                        <Hash size={12} />
                        {tag}
                        <span className="ml-1 text-xs opacity-75">({count})</span>
                      </button>
                    ))}
                  </div>
                </div>
              </aside>

              {/* Blog Posts */}
              <main className="flex-1">
                {/* Results Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {searchTerm ? `Search results for "${searchTerm}"` : 
                       selectedCategory !== "All" ? `${selectedCategory} Articles` : 
                       "All Articles"}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {totalPosts} {totalPosts === 1 ? 'article' : 'articles'} found
                    </p>
                  </div>
                </div>

                {/* Blog Grid/List */}
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading articles...</p>
                    </div>
                  </div>
                ) : blogs.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="text-6xl text-gray-300 mb-4">📝</div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      No articles found
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Try adjusting your search terms or filters to find what you're looking for.
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                      >
                        Clear All Filters
                      </button>
                    )}
                  </div>
                ) : (
                  <div className={viewMode === "grid" 
                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8" 
                    : "space-y-6"
                  }>
                    {blogs.map((post) => (
                      <article
                        key={post._id}
                        className={`bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 ${
                          viewMode === "list" ? "flex gap-6" : ""
                        }`}
                      >
                        <Link href={`/blogs/${post.slug}`} className="block">
                          {/* Image */}
                          <div className={`relative overflow-hidden ${
                            viewMode === "list" ? "w-48 h-32 flex-shrink-0" : "h-52"
                          }`}>
                            {post.coverImage ? (
                              <img
                                src={post.coverImage}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center">
                                <BookOpen className="text-white" size={40} />
                              </div>
                            )}
                            {post.featured && (
                              <div className="absolute top-4 left-4">
                                <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                                  Featured
                                </span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                          </div>

                          {/* Content */}
                          <div className="p-6 flex-1">
                            {/* Meta */}
                            <div className="flex items-center justify-between mb-4">
                              <span className="px-3 py-1 bg-teal-50 text-teal-600 rounded-full text-xs font-semibold">
                                {post.category}
                              </span>
                              <span className="text-gray-400 text-sm">{formatDate(post.publishedAt)}</span>
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-bold mb-4 text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-2 leading-tight">
                              {post.title}
                            </h3>

                            {/* Excerpt */}
                            <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                              {post.excerpt}
                            </p>

                            {/* Footer with Author and Engagement */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                                  <User size={14} className="text-teal-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">
                                  {post.author.name.split(' ')[0]}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                {post.stats?.views && (
                                  <div className="flex items-center gap-1">
                                    <Eye size={14} />
                                    <span>{formatNumber(post.stats.views.total)}</span>
                                  </div>
                                )}
                                {post.stats?.likes && (
                                  <div className="flex items-center gap-1">
                                    <Heart size={14} />
                                    <span>{formatNumber(post.stats.likes.total)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </article>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-12">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        Previous
                      </button>
                      
                      <div className="flex gap-1">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-10 h-10 rounded-lg transition-colors ${
                                currentPage === pageNum
                                  ? "bg-teal-500 text-white"
                                  : "bg-white border border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </main>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
} 