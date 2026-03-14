"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { Search, SlidersHorizontal, X } from 'lucide-react';

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

  useEffect(() => { fetchBlogs(); }, [currentPage, statusFilter]);

  const fetchBlogs = async () => {
    try {
      const queryParams = new URLSearchParams({ page: currentPage.toString(), limit: '10', search: searchTerm });
      if (statusFilter !== 'all') queryParams.set('status', statusFilter);
      const response = await fetch(`/api/blogs?${queryParams}`);
      const data = await response.json();
      if (data.success) { setBlogs(data.data.blogs); setTotalPages(data.data.pagination.pages); }
    } catch (error) { console.error('Error fetching blogs:', error); } finally { setLoading(false); }
  };

  const handleDelete = async (slug: string) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    try {
      const response = await fetch(`/api/blogs/${slug}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) fetchBlogs();
    } catch (error) { console.error('Error deleting blog:', error); }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBlogs();
  };

  const inputCls = "bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.875rem] text-[#2a2118] focus:outline-none focus:border-[#d4622a] focus:ring-1 focus:ring-[#d4622a]/20";

  return (
    <div className="space-y-5">

      <div className="flex items-center justify-between">
        <p className="text-[0.65rem] font-mono tracking-[0.15em] uppercase text-[#8a7a6a]">
          {blogs.length} post{blogs.length !== 1 ? 's' : ''}
        </p>
        <Link
          href="/dashboard/posts/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#2a2118] text-[#f0ece3] rounded-lg text-[0.82rem] font-medium hover:bg-[#d4622a] transition-colors"
        >
          <FaPlus size={12} /> New Post
        </Link>
      </div>

      <form onSubmit={handleSearch} className="bg-white border border-[#e8e3db] rounded-xl p-4 shadow-sm flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[220px]">
          <label className="block text-[0.65rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] mb-1.5">Search</label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a7a6a] pointer-events-none" />
            <input type="text" placeholder="Search by title…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`${inputCls} w-full`} style={{ paddingLeft: '2.25rem' }} />
            {searchTerm && (
              <button type="button" onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a7a6a] hover:text-[#2a2118]"><X size={13} /></button>
            )}
          </div>
        </div>
        <div className="min-w-[130px]">
          <label className="block text-[0.65rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] mb-1.5">Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`${inputCls} w-full`}>
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 bg-[#2a2118] text-[#f0ece3] rounded-lg text-[0.82rem] font-medium hover:bg-[#d4622a] transition-colors">Apply</button>
          <button type="button" onClick={() => { setSearchTerm(''); setStatusFilter('all'); }} className="px-4 py-2 border border-[#ddd5c5] text-[#4a3728] rounded-lg text-[0.82rem] hover:border-[#2a2118] transition-colors">Clear</button>
        </div>
      </form>

      <div className="bg-white border border-[#e8e3db] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f7f5f1]">
                {['Title', 'Category', 'Status', 'Views', 'Likes', 'Actions'].map(h => (
                  <th key={h} className={`px-5 py-3 text-[0.65rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a] font-medium ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f1ee]">
              {loading ? (
                <tr><td colSpan={6} className="py-10 text-center"><div className="flex justify-center"><div className="w-5 h-5 border-2 border-[#e8e3db] border-t-[#d4622a] rounded-full animate-spin" /></div></td></tr>
              ) : blogs.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center"><p className="text-[0.875rem] font-medium text-[#2a2118]">No blog posts found</p></td></tr>
              ) : blogs.map((blog) => (
                <tr key={blog._id} className="hover:bg-[#faf8f4] transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-[0.875rem] font-medium text-[#2a2118]">{blog.title}</p>
                    <p className="text-[0.72rem] text-[#8a7a6a] mt-0.5 line-clamp-1">{blog.excerpt?.substring(0, 60)}…</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[0.65rem] font-mono tracking-wide px-2.5 py-0.5 rounded-full bg-[#f3f1ee] text-[#6b5c4e]">{blog.category}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[0.65rem] font-mono tracking-wider uppercase px-2.5 py-0.5 rounded-full ${blog.status === 'published' ? 'bg-[#e6f2ee] text-[#2a6b4f]' : 'bg-[#fef3e2] text-[#92510a]'}`}>{blog.status}</span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[0.82rem] text-[#4a3728]">{blog.views}</td>
                  <td className="px-5 py-3.5 font-mono text-[0.82rem] text-[#4a3728]">{blog.likes}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/blogs/${blog.slug}`} target="_blank" className="p-1.5 text-[#8a7a6a] hover:text-[#2a2118] hover:bg-[#f3f1ee] rounded-lg transition-colors" title="View"><FaEye size={13} /></Link>
                      <Link href={`/dashboard/posts/edit/${blog.slug}`} className="p-1.5 text-[#8a7a6a] hover:text-[#2a2118] hover:bg-[#f3f1ee] rounded-lg transition-colors" title="Edit"><FaEdit size={13} /></Link>
                      <button onClick={() => handleDelete(blog.slug)} className="p-1.5 text-[#8a7a6a] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><FaTrash size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#e8e3db]">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg border border-[#ddd5c5] text-[0.78rem] text-[#4a3728] hover:border-[#2a2118] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Previous</button>
            <span className="font-mono text-[0.72rem] text-[#8a7a6a]">Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg border border-[#ddd5c5] text-[0.78rem] text-[#4a3728] hover:border-[#2a2118] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next</button>
          </div>
        )}
      </div>

    </div>
  );
}
