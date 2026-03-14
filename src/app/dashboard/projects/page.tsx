"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaPlus, FaEdit, FaTrash, FaEye, FaStar, FaGripVertical } from 'react-icons/fa';
import { Search, X } from 'lucide-react';
import { Project } from '@/types/dashboard';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => { fetchProjects(); }, [currentPage, statusFilter, categoryFilter]);

  const fetchProjects = async () => {
    try {
      const queryParams = new URLSearchParams({ page: currentPage.toString(), limit: '10' });
      if (searchTerm) queryParams.set('search', searchTerm);
      if (statusFilter !== 'all') queryParams.set('status', statusFilter);
      if (categoryFilter !== 'all') queryParams.set('category', categoryFilter);
      const response = await fetch(`/api/projects?${queryParams}`, { headers: { 'x-is-admin': 'true' } });
      const data = await response.json();
      if (data.success) {
        const projectsList = Array.isArray(data.data) ? data.data : (data.data.projects || []);
        setProjects(projectsList);
        const uniqueCategories = Array.from(new Set(projectsList.map((p: Project) => p.category)));
        setCategories(uniqueCategories as string[]);
        if (data.data.pagination) setTotalPages(data.data.pagination.pages);
      }
    } catch (error) {
      // Error fetching projects
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      const response = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) fetchProjects();
    } catch (error) { /* Error deleting project */ }
  };

  const handleToggleFeatured = async (projectId: string, currentFeatured: boolean) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !currentFeatured }),
      });
      if (response.ok) fetchProjects();
    } catch (error) { /* Error updating project */ }
  };

  const handleOrderChange = async (projectId: string, newOrder: number) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newOrder }),
      });
      if (response.ok) {
        setProjects(prev => prev.map(p => p._id === projectId ? { ...p, order: newOrder } : p));
      }
    } catch (error) { fetchProjects(); }
  };

  const handleAutoOrder = async () => {
    if (!window.confirm('This will automatically set order numbers for all projects. Continue?')) return;
    try {
      const sortedProjects = [...projects].sort((a, b) =>
        new Date(a.createdAt as string).getTime() - new Date(b.createdAt as string).getTime()
      );
      const projectIds = sortedProjects.map((project) => project._id);
      const response = await fetch('/api/projects/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectIds }),
      });
      if (response.ok) fetchProjects();
    } catch (error) { /* Error updating orders */ }
  };

  const handleDragStart = (projectId: string) => setDraggedId(projectId);
  const handleDragEnd = () => setDraggedId(null);

  const handleDrop = async (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;
    const currentList = [...projects];
    const fromIndex = currentList.findIndex(p => p._id === draggedId);
    const toIndex = currentList.findIndex(p => p._id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;
    const [moved] = currentList.splice(fromIndex, 1);
    currentList.splice(toIndex, 0, moved);
    const reordered = currentList.map((project, index) => ({ ...project, order: index }));
    setProjects(reordered);
    try {
      const projectIds = reordered.map(project => project._id);
      const response = await fetch('/api/projects/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectIds }),
      });
      if (!response.ok) fetchProjects();
    } catch (error) { fetchProjects(); }
  };

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setCurrentPage(1); fetchProjects(); };

  const inputCls = "bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.875rem] text-[#2a2118] focus:outline-none focus:border-[#d4622a] focus:ring-1 focus:ring-[#d4622a]/20";

  return (
    <div className="space-y-5">

      <div className="flex items-center justify-between">
        <p className="text-[0.65rem] font-mono tracking-[0.15em] uppercase text-[#8a7a6a]">
          {projects.length} project{projects.length !== 1 ? 's' : ''}
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleAutoOrder}
            className="px-4 py-2 border border-[#ddd5c5] text-[#4a3728] rounded-lg text-[0.82rem] hover:border-[#2a2118] transition-colors"
          >
            Auto Order
          </button>
          <Link
            href="/dashboard/projects/new"
            className="flex items-center gap-2 px-4 py-2 bg-[#2a2118] text-[#f0ece3] rounded-lg text-[0.82rem] font-medium hover:bg-[#d4622a] transition-colors"
          >
            <FaPlus size={12} /> New Project
          </Link>
        </div>
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
        <div className="min-w-[130px]">
          <label className="block text-[0.65rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] mb-1.5">Category</label>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={`${inputCls} w-full`}>
            <option value="all">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 bg-[#2a2118] text-[#f0ece3] rounded-lg text-[0.82rem] font-medium hover:bg-[#d4622a] transition-colors">Apply</button>
          <button type="button" onClick={() => { setSearchTerm(''); setStatusFilter('all'); setCategoryFilter('all'); }} className="px-4 py-2 border border-[#ddd5c5] text-[#4a3728] rounded-lg text-[0.82rem] hover:border-[#2a2118] transition-colors">Clear</button>
        </div>
      </form>

      <div className="bg-white border border-[#e8e3db] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f7f5f1]">
                {['', 'Title', 'Category', 'Order', 'Technologies', 'Status', 'Featured', 'Actions'].map((h, i) => (
                  <th key={i} className={`px-4 py-3 text-[0.65rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a] font-medium ${i === 0 ? 'text-center w-8' : i === 7 ? 'text-right' : i === 3 || i === 6 ? 'text-center' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f1ee]">
              {loading ? (
                <tr><td colSpan={8} className="py-10 text-center"><div className="flex justify-center"><div className="w-5 h-5 border-2 border-[#e8e3db] border-t-[#d4622a] rounded-full animate-spin" /></div></td></tr>
              ) : projects.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center"><p className="text-[0.875rem] font-medium text-[#2a2118]">No projects found</p></td></tr>
              ) : projects.map((project) => (
                <tr
                  key={project._id}
                  className={`hover:bg-[#faf8f4] transition-colors ${draggedId === project._id ? 'opacity-50' : ''}`}
                  draggable
                  onDragStart={() => handleDragStart(project._id)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(project._id)}
                >
                  <td className="px-4 py-3.5 text-center text-[#8a7a6a]">
                    <FaGripVertical size={12} className="inline cursor-move" />
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-[0.875rem] font-medium text-[#2a2118]">{project.title}</p>
                    <p className="text-[0.72rem] text-[#8a7a6a] mt-0.5 line-clamp-1">{project.shortDescription}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-[0.65rem] font-mono tracking-wide px-2.5 py-0.5 rounded-full bg-[#f3f1ee] text-[#6b5c4e]">{project.category}</span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <input
                      type="number"
                      value={project.order || 0}
                      onChange={(e) => handleOrderChange(project._id, parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 text-center text-[0.82rem] font-mono bg-[#faf8f4] border border-[#ddd5c5] rounded-lg focus:outline-none focus:border-[#d4622a]"
                      min="0"
                    />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {project.technologies?.slice(0, 3).map((tech, idx) => (
                        <span key={idx} className="text-[0.6rem] font-mono tracking-wide px-2 py-0.5 rounded-full bg-[#e8f0fc] text-[#2d4eb3]">{tech.name}</span>
                      ))}
                      {project.technologies?.length > 3 && (
                        <span className="text-[0.65rem] font-mono text-[#8a7a6a]">+{project.technologies.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[0.65rem] font-mono tracking-wider uppercase px-2.5 py-0.5 rounded-full ${project.status === 'published' ? 'bg-[#e6f2ee] text-[#2a6b4f]' : 'bg-[#fef3e2] text-[#92510a]'}`}>{project.status}</span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <button
                      onClick={() => handleToggleFeatured(project._id, project.featured)}
                      className={`transition-colors ${project.featured ? 'text-[#d4622a]' : 'text-[#ddd5c5] hover:text-[#d4622a]'}`}
                      title={project.featured ? 'Remove from featured' : 'Mark as featured'}
                    >
                      <FaStar size={14} />
                    </button>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/projects/${project._id}`} target="_blank" className="p-1.5 text-[#8a7a6a] hover:text-[#2a2118] hover:bg-[#f3f1ee] rounded-lg transition-colors" title="View"><FaEye size={13} /></Link>
                      <Link href={`/dashboard/projects/edit/${project._id}`} className="p-1.5 text-[#8a7a6a] hover:text-[#2a2118] hover:bg-[#f3f1ee] rounded-lg transition-colors" title="Edit"><FaEdit size={13} /></Link>
                      <button onClick={() => handleDelete(project._id)} className="p-1.5 text-[#8a7a6a] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><FaTrash size={13} /></button>
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
