"use client";

import { useEffect, useState, useMemo } from 'react';
import LoadingScreen from '@/components/shared/LoadingScreen';
import ConfirmModal from '@/components/shared/ConfirmModal';
import { Search, Loader2, Plus, Pencil, Trash2, Eye } from 'lucide-react';

interface Achievement {
  _id: string;
  title: string;
  description?: string;
  date?: string;
  icon?: string;
}

function AchievementViewModal({
  open,
  achievement,
  onClose,
}: {
  open: boolean;
  achievement?: Achievement;
  onClose: () => void;
}) {
  if (!open || !achievement) return null;
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
          {achievement.icon && (
            <div className="w-14 h-14 rounded-xl bg-[#fef3e2] flex items-center justify-center text-3xl">
              {achievement.icon}
            </div>
          )}
          <h2 className="text-[1.1rem] font-semibold text-[#2a2118] text-center font-body">
            {achievement.title}
          </h2>
          {achievement.date && (
            <span className="text-[0.72rem] font-mono text-[#8a7a6a]">
              {new Date(achievement.date).toLocaleDateString()}
            </span>
          )}
        </div>

        {achievement.description && (
          <p className="text-[0.875rem] text-[#4a3728] text-center whitespace-pre-line leading-relaxed font-body">
            {achievement.description}
          </p>
        )}
      </div>
    </div>
  );
}

const inputCls =
  'w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.875rem] text-[#2a2118] focus:outline-none focus:border-[#d4622a] focus:ring-1 focus:ring-[#d4622a]/20 font-body';

const labelCls = 'block text-[0.75rem] font-mono tracking-[0.08em] uppercase text-[#8a7a6a] mb-1';

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
    } catch {
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
    } catch {
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
    } catch {
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
          .map((a) =>
            a.date && a.date.length >= 4
              ? new Date(a.date).getFullYear().toString()
              : null
          )
          .filter((v): v is string => v !== null)
      )
    );
    return y.sort((a, b) => Number(b) - Number(a));
  }, [achievements]);

  // Filtered achievements
  const filtered = useMemo(() => {
    return achievements.filter((a) => {
      const matchesSearch =
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        (a.description && a.description.toLowerCase().includes(search.toLowerCase()));
      const matchesYear =
        !year || (a.date && new Date(a.date).getFullYear().toString() === year);
      return matchesSearch && matchesYear;
    });
  }, [achievements, search, year]);

  return (
    <div className="space-y-6 font-body">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-[0.78rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a]">
          {achievements.length} achievement{achievements.length !== 1 ? 's' : ''} total
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a7a6a] pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search achievements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#faf8f4] border border-[#ddd5c5] rounded-lg pl-8 pr-3 py-2 text-[0.875rem] text-[#2a2118] focus:outline-none focus:border-[#d4622a] focus:ring-1 focus:ring-[#d4622a]/20 w-48"
            />
          </div>

          {/* Year filter */}
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.875rem] text-[#2a2118] focus:outline-none focus:border-[#d4622a] focus:ring-1 focus:ring-[#d4622a]/20"
          >
            <option value="">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setShowForm((v) => !v);
              setEditId(null);
              setForm({ title: '', description: '', date: '', icon: '' });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#2a2118] text-[#f0ece3] rounded-lg text-[0.82rem] font-medium hover:bg-[#d4622a] transition-colors"
          >
            <Plus size={14} />
            {showForm ? 'Cancel' : 'Add Achievement'}
          </button>
        </div>
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="bg-white border border-[#e8e3db] rounded-xl shadow-sm p-5">
          <p className="text-[0.78rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a] mb-4">
            {editId ? 'Edit Achievement' : 'New Achievement'}
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleInputChange}
                  required
                  className={inputCls}
                  placeholder="Achievement title"
                />
              </div>
              <div>
                <label className={labelCls}>Date</label>
                <input
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleInputChange}
                  className={inputCls}
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
                placeholder="e.g. 🏆"
              />
            </div>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 bg-[#2a2118] text-[#f0ece3] rounded-lg text-[0.82rem] font-medium hover:bg-[#d4622a] transition-colors disabled:opacity-60"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
                {submitting ? 'Saving…' : editId ? 'Update Achievement' : 'Add Achievement'}
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
        <LoadingScreen message="Loading achievements..." />
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#e8e3db] rounded-xl shadow-sm flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="w-10 h-10 rounded-lg bg-[#f7f5f1] flex items-center justify-center mb-3">
            <Search size={18} className="text-[#8a7a6a]" />
          </div>
          <p className="text-[#2a2118] font-medium text-[0.9rem] mb-1">No achievements found</p>
          <p className="text-[#8a7a6a] text-sm">
            {search || year
              ? 'Try adjusting your search or year filter.'
              : 'Add your first achievement using the button above.'}
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
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-[0.65rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a]">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-[0.65rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a]">
                    Date
                  </th>
                  <th className="px-4 py-3 text-center text-[0.65rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ach) => (
                  <tr
                    key={ach._id}
                    className="border-b border-[#e8e3db] hover:bg-[#faf8f4] transition-colors last:border-0"
                  >
                    <td className="px-4 py-3 align-middle">
                      {ach.icon ? (
                        <div className="w-8 h-8 rounded-lg bg-[#fef3e2] flex items-center justify-center text-lg">
                          {ach.icon}
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-[#f7f5f1]" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-[0.875rem] font-medium text-[#2a2118] align-middle max-w-[180px] truncate">
                      {ach.title}
                    </td>
                    <td className="px-4 py-3 text-[0.875rem] text-[#4a3728] align-middle max-w-[260px] truncate">
                      {ach.description}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      {ach.date ? (
                        <span className="text-[0.75rem] font-mono text-[#8a7a6a]">
                          {new Date(ach.date).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-[#8a7a6a] text-[0.82rem]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          title="View details"
                          onClick={() => setViewAchievement(ach)}
                          className="p-2 text-[#8a7a6a] hover:text-[#2d4eb3] hover:bg-[#e8f0fc] rounded-lg transition-colors"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          title="Edit"
                          onClick={() => handleEdit(ach)}
                          className="p-2 text-[#8a7a6a] hover:text-[#2a2118] hover:bg-[#f7f5f1] rounded-lg transition-colors"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => setDeleteId(ach._id)}
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
