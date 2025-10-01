"use client";

import { useEffect, useState, useMemo } from 'react';
// import LoadingScreen from '@/components/shared/LoadingScreen';
import ConfirmModal from '@/components/shared/ConfirmModal';
import { Eye } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
          aria-label="Close"
        >
          ×
        </button>
        <div className="flex flex-col items-center gap-3 mb-4">
          {tool.icon && <span className="text-5xl">{tool.icon}</span>}
          <h2 className="text-2xl font-bold text-gray-900 text-center">{tool.name}</h2>
        </div>
        {tool.link && (
          <a
            href={tool.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-blue-600 hover:underline text-center mb-2 break-all"
          >
            {tool.link}
          </a>
        )}
        {tool.description && <div className="text-gray-700 text-base mb-2 whitespace-pre-line text-center">{tool.description}</div>}
      </div>
    </div>
  );
}

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
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
      setError('Failed to delete tool');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filtered tools
  const filtered = useMemo(() => {
    return tools.filter(t =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase()))
    );
  }, [tools, search]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tools</h1>
          <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow self-start"
          onClick={() => {
            setShowForm((v) => !v);
            setEditId(null);
            setForm({ name: '', description: '', link: '', icon: '' });
          }}
        >
          {showForm ? 'Cancel' : 'Add Tool'}
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative w-full md:w-1/2">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search tools..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="block w-full !pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 mb-8 space-y-4 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleInputChange}
                required
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Link</label>
              <input
                name="link"
                value={form.link}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 min-h-[80px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Icon (optional, emoji or URL)</label>
            <input
              name="icon"
              value={form.icon}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Leave blank for AI suggestion"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : editId ? 'Update Tool' : 'Add Tool'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="w-6 h-6 rounded-full border-2 border-gray-300 border-t-gray-700 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-8">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-500 text-center">No tools found.</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Icon</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Link</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((tool) => (
                <tr key={tool._id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-3 text-2xl text-center align-middle">{tool.icon}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 align-middle max-w-xs truncate">{tool.name}</td>
                  <td className="px-4 py-3 text-gray-700 align-middle max-w-md truncate">{tool.description}</td>
                  <td className="px-4 py-3 align-middle max-w-xs truncate">
                    {tool.link ? (
                      <a
                        href={tool.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {tool.link}
                      </a>
                    ) : ''}
                  </td>
                  <td className="px-4 py-3 text-center align-middle">
                    <div className="flex justify-center gap-2">
                      <button
                        className="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition-colors"
                        title="View Details"
                        onClick={() => setViewTool(tool)}
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                        onClick={() => handleEdit(tool)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                        onClick={() => setDeleteId(tool._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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