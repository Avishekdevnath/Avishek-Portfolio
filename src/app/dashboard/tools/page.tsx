"use client";

import { useEffect, useState, useMemo } from 'react';
import ConfirmModal from '@/components/shared/ConfirmModal';
import { Eye, Plus, Pencil, Trash2, Search } from 'lucide-react';

interface Tool {
  _id: string;
  name: string;
  description?: string;
  link?: string;
  icon?: string;
}

function ToolViewModal({ open, tool, onClose }: { open: boolean; tool?: Tool; onClose: () => void }) {
  if (!open || !tool) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg text-[#8a7a6a] hover:text-[#2a2118] hover:bg-[#f7f5f1] transition-colors text-lg leading-none"
          aria-label="Close"
        >
          ×
        </button>

        <div className="flex flex-col items-center gap-3 mb-5">
          {tool.icon && (
            <div className="w-14 h-14 rounded-xl bg-[#fdf0eb] flex items-center justify-center text-3xl">
              {tool.icon}
            </div>
          )}
          <h2 className="text-[1.1rem] font-semibold text-[#2a2118] text-center font-body">{tool.name}</h2>
        </div>

        {tool.link && (
          <a
            href={tool.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-[0.82rem] text-[#d4622a] hover:underline mb-3 break-all font-mono"
          >
            {tool.link}
          </a>
        )}

        {tool.description && (
          <p className="text-[0.875rem] text-[#4a3728] text-center whitespace-pre-line leading-relaxed font-body">
            {tool.description}
          </p>
        )}
      </div>
    </div>
  );
}

const inputCls =
  'w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.875rem] text-[#2a2118] focus:outline-none focus:border-[#d4622a] focus:ring-1 focus:ring-[#d4622a]/20 font-body';

const labelCls = 'block text-[0.75rem] font-mono tracking-[0.08em] uppercase text-[#8a7a6a] mb-1';

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', link: '', icon: '' });
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewTool, setViewTool] = useState<Tool | null>(null);
  const [search, setSearch] = useState('');

  const fetchTools = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/tools');
      const data = await res.json();
      if (data.success) setTools(data.data);
      else setError(data.error || 'Failed to fetch tools');
    } catch {
      setError('Failed to fetch tools');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editId ? `/api/tools/${editId}` : '/api/tools';
      const method = editId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setForm({ name: '', description: '', link: '', icon: '' });
        setShowForm(false);
        setEditId(null);
        fetchTools();
      } else {
        setError(data.error || 'Failed to save tool');
      }
    } catch {
      setError('Failed to save tool');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (tool: Tool) => {
    setForm({
      name: tool.name || '',
      description: tool.description || '',
      link: tool.link || '',
      icon: tool.icon || '',
    });
    setEditId(tool._id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/tools/${deleteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setDeleteId(null);
        fetchTools();
      } else {
        setError(data.error || 'Failed to delete tool');
      }
    } catch {
      setError('Failed to delete tool');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return tools.filter(
      (t) =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(search.toLowerCase()))
    );
  }, [tools, search]);

  return (
    <div className="space-y-6 font-body">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-[0.78rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a]">
          {tools.length} tool{tools.length !== 1 ? 's' : ''} total
        </p>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a7a6a] pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search tools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#faf8f4] border border-[#ddd5c5] rounded-lg pl-8 pr-3 py-2 text-[0.875rem] text-[#2a2118] focus:outline-none focus:border-[#d4622a] focus:ring-1 focus:ring-[#d4622a]/20 w-48"
            />
          </div>
          <button
            onClick={() => {
              setShowForm((v) => !v);
              setEditId(null);
              setForm({ name: '', description: '', link: '', icon: '' });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#2a2118] text-[#f0ece3] rounded-lg text-[0.82rem] font-medium hover:bg-[#d4622a] transition-colors"
          >
            <Plus size={14} />
            {showForm ? 'Cancel' : 'Add Tool'}
          </button>
        </div>
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="bg-white border border-[#e8e3db] rounded-xl shadow-sm p-5">
          <p className="text-[0.78rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a] mb-4">
            {editId ? 'Edit Tool' : 'New Tool'}
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  required
                  className={inputCls}
                  placeholder="Tool name"
                />
              </div>
              <div>
                <label className={labelCls}>Link</label>
                <input
                  name="link"
                  value={form.link}
                  onChange={handleInputChange}
                  className={inputCls}
                  placeholder="https://..."
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleInputChange}
                rows={3}
                className={inputCls + ' resize-none'}
                placeholder="Short description..."
              />
            </div>
            <div>
              <label className={labelCls}>Icon — emoji or URL (optional)</label>
              <input
                name="icon"
                value={form.icon}
                onChange={handleInputChange}
                className={inputCls}
                placeholder="Leave blank for AI suggestion"
              />
            </div>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 bg-[#2a2118] text-[#f0ece3] rounded-lg text-[0.82rem] font-medium hover:bg-[#d4622a] transition-colors disabled:opacity-60"
              >
                {submitting ? (
                  <span className="w-4 h-4 border-2 border-[#f0ece3]/40 border-t-[#f0ece3] rounded-full animate-spin inline-block" />
                ) : null}
                {submitting ? 'Saving…' : editId ? 'Update Tool' : 'Add Tool'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditId(null); }}
                className="px-4 py-2 border border-[#ddd5c5] text-[#4a3728] rounded-lg text-[0.82rem] hover:border-[#2a2118] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-[#fceaea] border border-red-200 text-[#c0392b] text-[0.875rem] px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Table / States */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[240px]">
          <div className="w-5 h-5 border-2 border-[#e8e3db] border-t-[#d4622a] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#e8e3db] rounded-xl shadow-sm flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="w-10 h-10 rounded-lg bg-[#f7f5f1] flex items-center justify-center mb-3">
            <Search size={18} className="text-[#8a7a6a]" />
          </div>
          <p className="text-[#2a2118] font-medium text-[0.9rem] mb-1">No tools found</p>
          <p className="text-[#8a7a6a] text-sm">
            {search ? 'Try a different search term.' : 'Add your first tool using the button above.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#e8e3db] rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-[#f7f5f1]">
                <tr>
                  <th className="px-4 py-3 text-left text-[0.65rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a]">
                    Icon
                  </th>
                  <th className="px-4 py-3 text-left text-[0.65rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a]">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-[0.65rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a]">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-[0.65rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a]">
                    Link
                  </th>
                  <th className="px-4 py-3 text-center text-[0.65rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tool) => (
                  <tr
                    key={tool._id}
                    className="border-b border-[#e8e3db] hover:bg-[#faf8f4] transition-colors last:border-0"
                  >
                    <td className="px-4 py-3 align-middle">
                      {tool.icon ? (
                        <div className="w-8 h-8 rounded-lg bg-[#fdf0eb] flex items-center justify-center text-lg">
                          {tool.icon}
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-[#f7f5f1]" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-[0.875rem] font-medium text-[#2a2118] align-middle max-w-[160px] truncate">
                      {tool.name}
                    </td>
                    <td className="px-4 py-3 text-[0.875rem] text-[#4a3728] align-middle max-w-[260px] truncate">
                      {tool.description}
                    </td>
                    <td className="px-4 py-3 align-middle max-w-[180px] truncate">
                      {tool.link ? (
                        <a
                          href={tool.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[0.82rem] text-[#d4622a] hover:underline font-mono"
                        >
                          {tool.link}
                        </a>
                      ) : (
                        <span className="text-[#8a7a6a] text-[0.82rem]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          title="View details"
                          onClick={() => setViewTool(tool)}
                          className="p-2 text-[#8a7a6a] hover:text-[#2d4eb3] hover:bg-[#e8f0fc] rounded-lg transition-colors"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          title="Edit"
                          onClick={() => handleEdit(tool)}
                          className="p-2 text-[#8a7a6a] hover:text-[#2a2118] hover:bg-[#f7f5f1] rounded-lg transition-colors"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => setDeleteId(tool._id)}
                          className="p-2 text-[#8a7a6a] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ToolViewModal
        open={!!viewTool}
        tool={viewTool || undefined}
        onClose={() => setViewTool(null)}
      />

      <ConfirmModal
        open={!!deleteId}
        title="Delete Tool"
        description="Are you sure you want to delete this tool? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
