"use client";

import { FormEvent, useCallback, useEffect, useState } from 'react';
import type { JobActivityItem, PaginationData } from '@/types/job-hunt';
import { ACTIVITY_TYPES, FOLLOW_UP_DONE_OPTIONS, PRIORITY_LEVELS } from '@/lib/job-hunt-utils';

interface ActivitiesApiResponse {
  success: boolean;
  data?: {
    items: JobActivityItem[];
    pagination: PaginationData;
  };
  error?: string;
}

interface FormState {
  date: string;
  activityType: string;
  companyOrContact: string;
  description: string;
  timeSpentHours: string;
  followUpDate: string;
  followUpDone: string;
  priority: string;
}

const initialForm: FormState = {
  date: new Date().toISOString().slice(0, 10),
  activityType: 'Job Application',
  companyOrContact: '',
  description: '',
  timeSpentHours: '',
  followUpDate: '',
  followUpDone: 'N/A',
  priority: 'Medium',
};

function formatDate(dateInput?: string) {
  if (!dateInput) return '—';
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
}

export default function JobHuntActivitiesPage() {
  const [items, setItems] = useState<JobActivityItem[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({ total: 0, page: 1, limit: 20, pages: 1 });
  const [searchQuery, setSearchQuery] = useState('');
  const [activityTypeFilter, setActivityTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [followUpFilter, setFollowUpFilter] = useState('all');
  const [form, setForm] = useState<FormState>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const query = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
      });
      if (searchQuery.trim()) query.set('q', searchQuery.trim());
      if (activityTypeFilter !== 'all') query.set('activityType', activityTypeFilter);
      if (priorityFilter !== 'all') query.set('priority', priorityFilter);
      if (followUpFilter !== 'all') query.set('followUpDone', followUpFilter);

      const response = await fetch(`/api/job-hunt/activities?${query.toString()}`);
      const data = (await response.json()) as ActivitiesApiResponse;
      if (!data.success || !data.data) throw new Error(data.error || 'Failed to fetch activities');

      setItems(data.data.items);
      setPagination(data.data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activities');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchQuery, activityTypeFilter, priorityFilter, followUpFilter]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        date: new Date(form.date).toISOString(),
        activityType: form.activityType,
        companyOrContact: form.companyOrContact || undefined,
        description: form.description || undefined,
        timeSpentHours: form.timeSpentHours ? Number(form.timeSpentHours) : undefined,
        followUpDate: form.followUpDate ? new Date(form.followUpDate).toISOString() : undefined,
        followUpDone: form.followUpDone,
        priority: form.priority,
      };

      const response = await fetch(editingId ? `/api/job-hunt/activities/${editingId}` : '/api/job-hunt/activities', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { success: boolean; error?: string };
      if (!data.success) throw new Error(data.error || (editingId ? 'Failed to update activity' : 'Failed to create activity'));

      setForm(initialForm);
      setEditingId(null);
      await fetchActivities();
    } catch (err) {
      setError(err instanceof Error ? err.message : (editingId ? 'Failed to update activity' : 'Failed to create activity'));
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (item: JobActivityItem) => {
    setEditingId(item._id);
    setForm({
      date: item.date ? new Date(item.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      activityType: item.activityType,
      companyOrContact: item.companyOrContact || '',
      description: item.description || '',
      timeSpentHours: item.timeSpentHours !== undefined ? String(item.timeSpentHours) : '',
      followUpDate: item.followUpDate ? new Date(item.followUpDate).toISOString().slice(0, 10) : '',
      followUpDone: item.followUpDone,
      priority: item.priority,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onDelete = async (id: string) => {
    if (!window.confirm('Delete this activity log item?')) return;
    setError(null);

    try {
      const response = await fetch(`/api/job-hunt/activities/${id}`, { method: 'DELETE' });
      const data = (await response.json()) as { success: boolean; error?: string };
      if (!data.success) throw new Error(data.error || 'Failed to delete activity');
      await fetchActivities();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete activity');
    }
  };

  const inputClass = 'mt-1 w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.82rem] text-[#2a2118] focus:outline-none focus:border-[#d4622a]';

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[0.65rem] font-mono tracking-[0.15em] uppercase text-[#8a7a6a]">Daily Log</p>
        <h1 className="text-[1.05rem] font-semibold text-[#2a2118] mt-1">Activity Tracker</h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>}

      <form onSubmit={onSubmit} className="bg-white border border-[#e8e3db] rounded-xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-[0.72rem] font-medium text-[#4a3728]">Date *</label>
          <input type="date" required value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className="text-[0.72rem] font-medium text-[#4a3728]">Activity Type *</label>
          <select value={form.activityType} onChange={(e) => setForm((f) => ({ ...f, activityType: e.target.value }))} className={inputClass}>
            {ACTIVITY_TYPES.map((activityType) => <option key={activityType} value={activityType}>{activityType}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[0.72rem] font-medium text-[#4a3728]">Priority *</label>
          <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))} className={inputClass}>
            {PRIORITY_LEVELS.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[0.72rem] font-medium text-[#4a3728]">Company / Contact</label>
          <input value={form.companyOrContact} onChange={(e) => setForm((f) => ({ ...f, companyOrContact: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className="text-[0.72rem] font-medium text-[#4a3728]">Time Spent (hours)</label>
          <input type="number" min="0" max="24" step="0.25" value={form.timeSpentHours} onChange={(e) => setForm((f) => ({ ...f, timeSpentHours: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className="text-[0.72rem] font-medium text-[#4a3728]">Follow-up Done?</label>
          <select value={form.followUpDone} onChange={(e) => setForm((f) => ({ ...f, followUpDone: e.target.value }))} className={inputClass}>
            {FOLLOW_UP_DONE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[0.72rem] font-medium text-[#4a3728]">Follow-up Date</label>
          <input type="date" value={form.followUpDate} onChange={(e) => setForm((f) => ({ ...f, followUpDate: e.target.value }))} className={inputClass} />
        </div>

        <div className="md:col-span-2">
          <label className="text-[0.72rem] font-medium text-[#4a3728]">Description</label>
          <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={`${inputClass} min-h-[90px]`} />
        </div>

        <div className="md:col-span-3 flex justify-end gap-2">
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(initialForm);
              }}
              className="px-4 py-2 border border-[#ddd5c5] text-[#4a3728] rounded-lg text-[0.82rem]"
            >
              Cancel Edit
            </button>
          )}
          <button type="submit" disabled={saving} className="px-4 py-2 bg-[#2a2118] text-[#f0ece3] rounded-lg text-[0.82rem] font-medium hover:bg-[#d4622a] disabled:opacity-60">
            {saving ? 'Saving…' : editingId ? 'Update Activity' : 'Add Activity'}
          </button>
        </div>
      </form>

      <div className="bg-white border border-[#e8e3db] rounded-xl p-4 shadow-sm flex flex-wrap items-end gap-3">
        <div className="min-w-[210px] flex-1">
          <label className="block text-[0.65rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] mb-1.5">Search</label>
          <input
            value={searchQuery}
            onChange={(e) => {
              setPagination((prev) => ({ ...prev, page: 1 }));
              setSearchQuery(e.target.value);
            }}
            placeholder="Contact or description"
            className="w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.875rem]"
          />
        </div>

        <div className="min-w-[170px]">
          <label className="block text-[0.65rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] mb-1.5">Type</label>
          <select
            value={activityTypeFilter}
            onChange={(e) => {
              setPagination((prev) => ({ ...prev, page: 1 }));
              setActivityTypeFilter(e.target.value);
            }}
            className="w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.875rem]"
          >
            <option value="all">All</option>
            {ACTIVITY_TYPES.map((activityType) => (
              <option key={activityType} value={activityType}>{activityType}</option>
            ))}
          </select>
        </div>

        <div className="min-w-[130px]">
          <label className="block text-[0.65rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] mb-1.5">Priority</label>
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPagination((prev) => ({ ...prev, page: 1 }));
              setPriorityFilter(e.target.value);
            }}
            className="w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.875rem]"
          >
            <option value="all">All</option>
            {PRIORITY_LEVELS.map((priority) => (
              <option key={priority} value={priority}>{priority}</option>
            ))}
          </select>
        </div>

        <div className="min-w-[140px]">
          <label className="block text-[0.65rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] mb-1.5">Follow-up</label>
          <select
            value={followUpFilter}
            onChange={(e) => {
              setPagination((prev) => ({ ...prev, page: 1 }));
              setFollowUpFilter(e.target.value);
            }}
            className="w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.875rem]"
          >
            <option value="all">All</option>
            {FOLLOW_UP_DONE_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="min-w-[120px]">
          <label className="block text-[0.65rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] mb-1.5">Per page</label>
          <select
            value={String(pagination.limit)}
            onChange={(e) => setPagination((prev) => ({ ...prev, page: 1, limit: Number(e.target.value) }))}
            className="w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.875rem]"
          >
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white border border-[#e8e3db] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f7f5f1]">
                {['Date', 'Type', 'Priority', 'Company/Contact', 'Follow-up', 'Actions'].map((heading) => (
                  <th key={heading} className={`px-4 py-3 text-[0.65rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a] font-medium ${heading === 'Actions' ? 'text-right' : 'text-left'}`}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f1ee]">
              {loading ? (
                <tr><td colSpan={6} className="py-10 text-center"><div className="w-5 h-5 border-2 border-[#e8e3db] border-t-[#d4622a] rounded-full animate-spin mx-auto" /></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-[0.85rem] text-[#8a7a6a]">No activities yet.</td></tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id} className="hover:bg-[#faf8f4] transition-colors">
                    <td className="px-4 py-3.5 text-[0.78rem] text-[#4a3728]">{formatDate(item.date)}</td>
                    <td className="px-4 py-3.5 text-[0.78rem] text-[#4a3728]">{item.activityType}</td>
                    <td className="px-4 py-3.5 text-[0.74rem] text-[#6b5c4e]">{item.priority}</td>
                    <td className="px-4 py-3.5 text-[0.78rem] text-[#4a3728]">{item.companyOrContact || '—'}</td>
                    <td className="px-4 py-3.5 text-[0.74rem] text-[#6b5c4e]">{item.followUpDate ? `${formatDate(item.followUpDate)} (${item.followUpDone})` : item.followUpDone}</td>
                    <td className="px-4 py-3.5 text-right">
                      <button onClick={() => onEdit(item)} className="text-[0.75rem] text-[#2a2118] hover:text-[#d4622a] mr-3">Edit</button>
                      <button onClick={() => onDelete(item._id)} className="text-[0.75rem] text-red-600 hover:text-red-700">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#e8e3db]">
            <span className="font-mono text-[0.72rem] text-[#8a7a6a]">
              Showing {items.length === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </span>
            <button
              onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
              disabled={pagination.page === 1}
              className="px-3 py-1.5 rounded-lg border border-[#ddd5c5] text-[0.78rem] text-[#4a3728] disabled:opacity-40"
            >
              Previous
            </button>
            <span className="font-mono text-[0.72rem] text-[#8a7a6a]">Page {pagination.page} / {pagination.pages}</span>
            <button
              onClick={() => setPagination((p) => ({ ...p, page: Math.min(p.pages, p.page + 1) }))}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-1.5 rounded-lg border border-[#ddd5c5] text-[0.78rem] text-[#4a3728] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
