"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaFilter } from 'react-icons/fa';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  status: 'draft' | 'published';
  publishedAt: string;
  views: number;
  likes: number;
}

export default function BlogDashboard() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBlogs();
  }, [currentPage, statusFilter]);

  const fetchBlogs = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm
      });
      if (statusFilter !== 'all') {
        queryParams.set('status', statusFilter);
      }

      const response = await fetch(`/api/blogs?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setBlogs(data.data.blogs);
        setTotalPages(data.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) {
      return;
    }

    try {
      const response = await fetch(`/api/blogs/${slug}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        fetchBlogs(); // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page
    fetchBlogs();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Blog Posts</h1>
        <Link
          href="/dashboard/posts/new"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors"
        >
          <FaPlus /> New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Apply Filters
          </button>
        </form>
      </div>

      {/* Blog Posts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Likes</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : blogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No blog posts found
                  </td>
                </tr>
              ) : (
                blogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{blog.title}</span>
                        <span className="text-sm text-gray-500">{blog.excerpt.substring(0, 60)}...</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                        {blog.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-sm rounded-full ${
                        blog.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {blog.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{blog.views}</td>
                    <td className="px-6 py-4 text-gray-500">{blog.likes}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/blogs/${blog.slug}`}
                        className="text-gray-400 hover:text-gray-500"
                        target="_blank"
                      >
                        <FaEye className="inline" />
                      </Link>
                      <Link
                        href={`/dashboard/posts/edit/${blog.slug}`}
                        className="text-blue-400 hover:text-blue-500"
                      >
                        <FaEdit className="inline" />
                      </Link>
                      <button
                        onClick={() => handleDelete(blog.slug)}
                        className="text-red-400 hover:text-red-500"
                      >
                        <FaTrash className="inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 flex justify-between items-center border-t">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-gray-100 text-gray-600 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-gray-100 text-gray-600 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 