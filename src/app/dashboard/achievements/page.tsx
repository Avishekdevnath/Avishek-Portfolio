"use client";

import { useEffect, useState, useMemo } from 'react';
import LoadingScreen from '@/components/shared/LoadingScreen';
import ConfirmModal from '@/components/shared/ConfirmModal';
import { Search, Loader2 } from 'lucide-react';

interface Achievement {
  _id: string;
  title: string;
  description?: string;
  date?: string;
  icon?: string;
}

function AchievementViewModal({ open, achievement, onClose }: { open: boolean; achievement?: Achievement; onClose: () => void }) {
  if (!open || !achievement) return null;
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
          {achievement.icon && <span className="text-5xl">{achievement.icon}</span>}
          <h2 className="text-2xl font-bold text-gray-900 text-center">{achievement.title}</h2>
          {achievement.date && <div className="text-xs text-gray-400">{new Date(achievement.date).toLocaleDateString()}</div>}
        </div>
        {achievement.description && <div className="text-gray-700 text-base mb-2 whitespace-pre-line text-center">{achievement.description}</div>}
      </div>
    </div>
  );
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', date: '', icon: '' });
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewAchievement, setViewAchievement] = useState<Achievement | null>(null);
  const [search, setSearch] = useState('');
  const [year, setYear] = useState('');

  const fetchAchievements = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/achievements');
      const data = await res.json();
      if (data.success) setAchievements(data.data);
      else setError(data.error || 'Failed to fetch achievements');
    } catch (err) {
      setError('Failed to fetch achievements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editId ? `/api/achievements/${editId}` : '/api/achievements';
      const method = editId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setForm({ title: '', description: '', date: '', icon: '' });
        setShowForm(false);
        setEditId(null);
        fetchAchievements();
      } else {
        setError(data.error || 'Failed to save achievement');
      }
    } catch (err) {
      setError('Failed to save achievement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (ach: Achievement) => {
    setForm({
      title: ach.title || '',
      description: ach.description || '',
      date: ach.date ? ach.date.slice(0, 10) : '',
      icon: ach.icon || '',
    });
    setEditId(ach._id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/achievements/${deleteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setDeleteId(null);
        fetchAchievements();
      } else {
        setError(data.error || 'Failed to delete achievement');
      }
    } catch (err) {
      setError('Failed to delete achievement');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Get all years from achievements
  const years = useMemo<string[]>(() => {
    const y = Array.from(
      new Set(
        achievements
          .map(a => (a.date && a.date.length >= 4 ? new Date(a.date).getFullYear().toString() : null))
          .filter((v): v is string => v !== null)
      )
    );
    return y.sort((a, b) => Number(b) - Number(a));
  }, [achievements]);

  // Filtered achievements
  const filtered = useMemo(() => {
    return achievements.filter(a => {
      const matchesSearch =
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        (a.description && a.description.toLowerCase().includes(search.toLowerCase()));
      const matchesYear = !year || (a.date && new Date(a.date).getFullYear().toString() === year);
      return matchesSearch && matchesYear;
    });
  }, [achievements, search, year]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Achievements</h1>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow self-start"
          onClick={() => {
            setShowForm((v) => !v);
            setEditId(null);
            setForm({ title: '', description: '', date: '', icon: '' });
          }}
        >
          {showForm ? 'Cancel' : 'Add Achievement'}
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search achievements..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full md:w-1/2 border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={year}
          onChange={e => setYear(e.target.value)}
          className="w-full md:w-40 border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Years</option>
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 mb-8 space-y-4 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleInputChange}
                required
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                name="date"
                type="date"
                value={form.date}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
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
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow"
            disabled={submitting}
          >
          {submitting ? <Loader2 className="animate-spin" size={20} /> : editId ? 'Update Achievement' : 'Add Achievement'}
          </button>
        </form>
      )}

      {loading ? (
        <LoadingScreen message="Loading achievements..." />
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-8">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-500 text-center">No achievements found.</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Icon</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((ach) => (
                <tr key={ach._id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-3 text-2xl text-center align-middle">{ach.icon}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 align-middle max-w-xs truncate">{ach.title}</td>
                  <td className="px-4 py-3 text-gray-700 align-middle max-w-md truncate">{ach.description}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 align-middle">{ach.date ? new Date(ach.date).toLocaleDateString() : ''}</td>
                  <td className="px-4 py-3 text-center align-middle">
                    <div className="flex justify-center gap-2">
                      <button
                        className="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition-colors"
                        title="View Details"
                        onClick={() => setViewAchievement(ach)}
                      >
                        <Search size={18} />
                      </button>
                      <button
                        className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                        onClick={() => handleEdit(ach)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                        onClick={() => setDeleteId(ach._id)}
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

      <AchievementViewModal
        open={!!viewAchievement}
        achievement={viewAchievement || undefined}
        onClose={() => setViewAchievement(null)}
      />

      <ConfirmModal
        open={!!deleteId}
        title="Delete Achievement"
        description="Are you sure you want to delete this achievement? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleteLoading}
      />
    </div>
  );
} 