"use client";

import { FormEvent, useCallback, useEffect, useState } from 'react';
import type { JobInterviewItem, PaginationData } from '@/types/job-hunt';
import { INTERVIEW_RESULTS, INTERVIEW_ROUNDS, INTERVIEW_TYPES } from '@/lib/job-hunt-utils';

interface InterviewsApiResponse {
  success: boolean;
  data?: {
    items: JobInterviewItem[];
    pagination: PaginationData;
  };
  error?: string;
}

interface FormState {
  company: string;
  jobTitle: string;
  interviewRound: string;
  interviewDate: string;
  interviewType: string;
  interviewers: string;
  questionsAsked: string;
  selfRating: string;
  result: string;
  nextSteps: string;
  notes: string;
}

const initialForm: FormState = {
  company: '',
  jobTitle: '',
  interviewRound: INTERVIEW_ROUNDS[0],
  interviewDate: new Date().toISOString().slice(0, 10),
  interviewType: INTERVIEW_TYPES[0],
  interviewers: '',
  questionsAsked: '',
  selfRating: '',
  result: 'Pending',
  nextSteps: '',
  notes: '',
};

function formatDate(dateInput?: string) {
  if (!dateInput) return '—';
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
}

export default function JobHuntInterviewsPage() {
  const [items, setItems] = useState<JobInterviewItem[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({ total: 0, page: 1, limit: 20, pages: 1 });
  const [searchQuery, setSearchQuery] = useState('');
  const [resultFilter, setResultFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [form, setForm] = useState<FormState>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInterviews = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const query = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
      });
      if (searchQuery.trim()) query.set('q', searchQuery.trim());
      if (resultFilter !== 'all') query.set('result', resultFilter);
      if (typeFilter !== 'all') query.set('interviewType', typeFilter);
      const response = await fetch(`/api/job-hunt/interviews?${query.toString()}`);
      const data = (await response.json()) as InterviewsApiResponse;
      if (!data.success || !data.data) throw new Error(data.error || 'Failed to fetch interviews');
      setItems(data.data.items);
      setPagination(data.data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch interviews');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchQuery, resultFilter, typeFilter]);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        company: form.company,
        jobTitle: form.jobTitle,
        interviewRound: form.interviewRound,
        interviewDate: new Date(form.interviewDate).toISOString(),
        interviewType: form.interviewType,
        interviewers: form.interviewers || undefined,
        questionsAsked: form.questionsAsked || undefined,
        selfRating: form.selfRating ? Number(form.selfRating) : undefined,
        result: form.result,
        nextSteps: form.nextSteps || undefined,
        notes: form.notes || undefined,
      };

      const response = await fetch(editingId ? `/api/job-hunt/interviews/${editingId}` : '/api/job-hunt/interviews', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { success: boolean; error?: string };
      if (!data.success) throw new Error(data.error || (editingId ? 'Failed to update interview' : 'Failed to create interview'));

      setForm(initialForm);
      setEditingId(null);
      await fetchInterviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : (editingId ? 'Failed to update interview' : 'Failed to create interview'));
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (item: JobInterviewItem) => {
    setEditingId(item._id);
    setForm({
      company: item.company,
      jobTitle: item.jobTitle,
      interviewRound: item.interviewRound,
      interviewDate: item.interviewDate ? new Date(item.interviewDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      interviewType: item.interviewType,
      interviewers: item.interviewers || '',
      questionsAsked: item.questionsAsked || '',
      selfRating: item.selfRating !== undefined ? String(item.selfRating) : '',
      result: item.result,
      nextSteps: item.nextSteps || '',
      notes: item.notes || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onDelete = async (id: string) => {
    if (!window.confirm('Delete this interview record?')) return;
    setError(null);

    try {
      const response = await fetch(`/api/job-hunt/interviews/${id}`, { method: 'DELETE' });
      const data = (await response.json()) as { success: boolean; error?: string };
      if (!data.success) throw new Error(data.error || 'Failed to delete interview');
      await fetchInterviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete interview');
    }
  };

  const inputClass = 'mt-1 w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.82rem] text-[#2a2118] focus:outline-none focus:border-[#d4622a]';

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[0.65rem] font-mono tracking-[0.15em] uppercase text-[#8a7a6a]">Interview Tracker</p>
        <h1 className="text-[1.05rem] font-semibold text-[#2a2118] mt-1">Interviews</h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>}

      <form onSubmit={onSubmit} className="bg-white border border-[#e8e3db] rounded-xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-[0.72rem] font-medium text-[#4a3728]">Company *</label>
          <input required value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className="text-[0.72rem] font-medium text-[#4a3728]">Job Title *</label>
          <input required value={form.jobTitle} onChange={(e) => setForm((f) => ({ ...f, jobTitle: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className="text-[0.72rem] font-medium text-[#4a3728]">Interview Date *</label>
          <input type="date" required value={form.interviewDate} onChange={(e) => setForm((f) => ({ ...f, interviewDate: e.target.value }))} className={inputClass} />
        </div>

        <div>
          <label className="text-[0.72rem] font-medium text-[#4a3728]">Round *</label>
          <select value={form.interviewRound} onChange={(e) => setForm((f) => ({ ...f, interviewRound: e.target.value }))} className={inputClass}>
            {INTERVIEW_ROUNDS.map((round) => <option key={round} value={round}>{round}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[0.72rem] font-medium text-[#4a3728]">Type *</label>
          <select value={form.interviewType} onChange={(e) => setForm((f) => ({ ...f, interviewType: e.target.value }))} className={inputClass}>
            {INTERVIEW_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[0.72rem] font-medium text-[#4a3728]">Result *</label>
          <select value={form.result} onChange={(e) => setForm((f) => ({ ...f, result: e.target.value }))} className={inputClass}>
            {INTERVIEW_RESULTS.map((result) => <option key={result} value={result}>{result}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[0.72rem] font-medium text-[#4a3728]">Interviewer(s)</label>
          <input value={form.interviewers} onChange={(e) => setForm((f) => ({ ...f, interviewers: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className="text-[0.72rem] font-medium text-[#4a3728]">Self Rating (1-5)</label>
          <input type="number" min="1" max="5" value={form.selfRating} onChange={(e) => setForm((f) => ({ ...f, selfRating: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className="text-[0.72rem] font-medium text-[#4a3728]">Next Steps</label>
          <input value={form.nextSteps} onChange={(e) => setForm((f) => ({ ...f, nextSteps: e.target.value }))} className={inputClass} />
        </div>

        <div className="md:col-span-3">
          <label className="text-[0.72rem] font-medium text-[#4a3728]">Questions Asked</label>
          <textarea value={form.questionsAsked} onChange={(e) => setForm((f) => ({ ...f, questionsAsked: e.target.value }))} className={`${inputClass} min-h-[80px]`} />
        </div>

        <div className="md:col-span-3">
          <label className="text-[0.72rem] font-medium text-[#4a3728]">Notes</label>
          <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className={`${inputClass} min-h-[80px]`} />
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
            {saving ? 'Saving…' : editingId ? 'Update Interview' : 'Add Interview'}
          </button>
        </div>
      </form>

      <div className="bg-white border border-[#e8e3db] rounded-xl p-4 shadow-sm flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-1">
          <label className="block text-[0.65rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] mb-1.5">Search</label>
          <input
            value={searchQuery}
            onChange={(e) => {
              setPagination((prev) => ({ ...prev, page: 1 }));
              setSearchQuery(e.target.value);
            }}
            placeholder="Company, role, or interviewer"
            className="w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.875rem]"
          />
        </div>

        <div className="min-w-[170px]">
          <label className="block text-[0.65rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] mb-1.5">Result</label>
          <select
            value={resultFilter}
            onChange={(e) => {
              setPagination((prev) => ({ ...prev, page: 1 }));
              setResultFilter(e.target.value);
            }}
            className="w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.875rem]"
          >
            <option value="all">All</option>
            {INTERVIEW_RESULTS.map((result) => (
              <option key={result} value={result}>{result}</option>
            ))}
          </select>
        </div>

        <div className="min-w-[170px]">
          <label className="block text-[0.65rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] mb-1.5">Type</label>
          <select
            value={typeFilter}
            onChange={(e) => {
              setPagination((prev) => ({ ...prev, page: 1 }));
              setTypeFilter(e.target.value);
            }}
            className="w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.875rem]"
          >
            <option value="all">All</option>
            {INTERVIEW_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
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
                {['Company', 'Role', 'Date', 'Round', 'Result', 'Actions'].map((heading) => (
                  <th key={heading} className={`px-4 py-3 text-[0.65rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a] font-medium ${heading === 'Actions' ? 'text-right' : 'text-left'}`}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f1ee]">
              {loading ? (
                <tr><td colSpan={6} className="py-10 text-center"><div className="w-5 h-5 border-2 border-[#e8e3db] border-t-[#d4622a] rounded-full animate-spin mx-auto" /></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-[0.85rem] text-[#8a7a6a]">No interviews yet.</td></tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id} className="hover:bg-[#faf8f4] transition-colors">
                    <td className="px-4 py-3.5 text-[0.82rem] text-[#2a2118] font-medium">{item.company}</td>
                    <td className="px-4 py-3.5 text-[0.78rem] text-[#4a3728]">{item.jobTitle}</td>
                    <td className="px-4 py-3.5 text-[0.74rem] text-[#6b5c4e]">{formatDate(item.interviewDate)}</td>
                    <td className="px-4 py-3.5 text-[0.74rem] text-[#6b5c4e]">{item.interviewRound}</td>
                    <td className="px-4 py-3.5 text-[0.74rem] text-[#6b5c4e]">{item.result}</td>
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
