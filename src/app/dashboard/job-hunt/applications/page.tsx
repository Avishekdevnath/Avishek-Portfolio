"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { JobApplicationItem, PaginationData } from '@/types/job-hunt';
import { APPLICATION_STATUSES } from '@/lib/job-hunt-utils';

interface ApiResponse {
  success: boolean;
  data?: { items: JobApplicationItem[]; pagination: PaginationData };
  error?: string;
}

function formatDate(dateInput?: string) {
  if (!dateInput) return '—';
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
}

function followUpBadgeStyle(alert: JobApplicationItem['followUpAlert']) {
  if (alert === 'Overdue') return 'bg-red-100 text-red-700';
  if (alert === 'Follow up Soon') return 'bg-amber-100 text-amber-700';
  return 'bg-[#f3f1ee] text-[#6b5c4e]';
}

export default function JobApplicationsPage() {
  const [items, setItems] = useState<JobApplicationItem[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({ total: 0, page: 1, limit: 20, pages: 1 });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>('Applied');
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({ page: String(pagination.page), limit: String(pagination.limit) });
      if (statusFilter !== 'all') query.set('status', statusFilter);
      if (searchQuery.trim()) query.set('q', searchQuery.trim());
      const response = await fetch(`/api/job-hunt/applications?${query.toString()}`);
      const data = (await response.json()) as ApiResponse;
      if (!data.success || !data.data) throw new Error(data.error || 'Failed to fetch');
      setItems(data.data.items);
      setPagination(data.data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch applications');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter, searchQuery]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);
  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => items.some((item) => item._id === id)));
  }, [items]);

  const onStatusChange = async (id: string, status: string) => {
    setSavingId(id);
    try {
      const res = await fetch(`/api/job-hunt/applications/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      await fetchApplications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally { setSavingId(null); }
  };

  const onDelete = async (id: string) => {
    if (!window.confirm('Delete this application?')) return;
    setSavingId(id);
    try {
      const res = await fetch(`/api/job-hunt/applications/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      await fetchApplications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    } finally { setSavingId(null); }
  };

  const onBulkAction = async (action: 'delete' | 'update-status') => {
    if (selectedIds.length === 0) return;
    if (action === 'delete' && !window.confirm(`Delete ${selectedIds.length} application(s)?`)) return;
    setBulkLoading(true);
    try {
      const res = await fetch('/api/job-hunt/applications/bulk', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, action, ...(action === 'update-status' ? { status: bulkStatus } : {}) }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setSelectedIds([]);
      await fetchApplications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk action failed');
    } finally { setBulkLoading(false); }
  };

  const allSelectedOnPage = items.length > 0 && items.every((item) => selectedIds.includes(item._id));

  const statusCounts = useMemo(() =>
    items.reduce<Record<string, number>>((acc, item) => { acc[item.status] = (acc[item.status] || 0) + 1; return acc; }, {}),
  [items]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[0.6rem] font-mono tracking-[0.18em] uppercase text-[#8a7a6a]">
            {pagination.total} application{pagination.total === 1 ? '' : 's'}
          </p>
          <h1 className="text-[1rem] font-semibold text-[#2a2118]">Applications</h1>
        </div>
        <Link
          href="/dashboard/job-hunt/applications/new"
          className="px-3.5 py-2 bg-[#2a2118] text-[#f0ece3] rounded-lg text-[0.78rem] font-medium hover:bg-[#d4622a] transition-colors"
        >
          Log New
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-2.5 text-xs">{error}</div>
      )}

      {/* Filters — single row */}
      <div className="bg-white border border-[#e8e3db] rounded-xl px-4 py-3 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-[0.6rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a] mb-1">Search</label>
            <input
              value={searchQuery}
              onChange={(e) => { setPagination((p) => ({ ...p, page: 1 })); setSearchQuery(e.target.value); }}
              placeholder="Company, role, or location"
              className="w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-1.5 text-[0.82rem] focus:outline-none focus:ring-1 focus:ring-[#d4622a]"
            />
          </div>
          <div className="min-w-[130px]">
            <label className="block text-[0.6rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a] mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => { setPagination((p) => ({ ...p, page: 1 })); setStatusFilter(e.target.value); }}
              className="w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-1.5 text-[0.82rem] focus:outline-none focus:ring-1 focus:ring-[#d4622a]"
            >
              <option value="all">All</option>
              {APPLICATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="min-w-[90px]">
            <label className="block text-[0.6rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a] mb-1">Per page</label>
            <select
              value={String(pagination.limit)}
              onChange={(e) => setPagination((p) => ({ ...p, page: 1, limit: Number(e.target.value) }))}
              className="w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-1.5 text-[0.82rem] focus:outline-none focus:ring-1 focus:ring-[#d4622a]"
            >
              {[10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        {/* Status pill counts */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-[#f3f1ee]">
          {APPLICATION_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { setPagination((p) => ({ ...p, page: 1 })); setStatusFilter(statusFilter === s ? 'all' : s); }}
              className={`text-[0.62rem] font-mono tracking-wide px-2 py-0.5 rounded-full transition-colors ${
                statusFilter === s ? 'bg-[#d4622a] text-white' : 'bg-[#f3f1ee] text-[#6b5c4e] hover:bg-[#e8e3db]'
              }`}
            >
              {s}: {statusCounts[s] || 0}
            </button>
          ))}
          {selectedIds.length > 0 && (
            <div className="ml-auto flex items-center gap-2">
              <span className="text-[0.68rem] text-[#6b5c4e]">{selectedIds.length} selected</span>
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                className="bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-2 py-1 text-[0.72rem]"
              >
                {APPLICATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={() => onBulkAction('update-status')} disabled={bulkLoading}
                className="px-2.5 py-1 rounded-lg border border-[#ddd5c5] text-[0.72rem] text-[#4a3728] disabled:opacity-40">
                Apply
              </button>
              <button onClick={() => onBulkAction('delete')} disabled={bulkLoading}
                className="px-2.5 py-1 rounded-lg border border-red-200 text-[0.72rem] text-red-700 disabled:opacity-40">
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#e8e3db] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f7f5f1]">
                <th className="px-4 py-2.5 text-left">
                  <input type="checkbox" checked={allSelectedOnPage}
                    onChange={(e) => e.target.checked ? setSelectedIds(items.map((i) => i._id)) : setSelectedIds([])} />
                </th>
                {['Company', 'Role', 'Applied', 'Status', 'Follow-up', 'Actions'].map((h) => (
                  <th key={h} className={`px-4 py-2.5 text-[0.6rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a] font-medium ${h === 'Actions' ? 'text-right' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f1ee]">
              {loading ? (
                <tr><td colSpan={7} className="py-10 text-center">
                  <div className="w-5 h-5 border-2 border-[#e8e3db] border-t-[#d4622a] rounded-full animate-spin mx-auto" />
                </td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-[0.82rem] text-[#8a7a6a]">No applications found.</td></tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id} className="hover:bg-[#faf8f4] transition-colors">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selectedIds.includes(item._id)}
                        onChange={(e) => e.target.checked
                          ? setSelectedIds((p) => [...new Set([...p, item._id])])
                          : setSelectedIds((p) => p.filter((id) => id !== item._id))} />
                    </td>
                    <td className="px-4 py-3 text-[0.82rem] font-medium">
                      <Link href={`/dashboard/job-hunt/applications/${item._id}`} className="text-[#2a2118] hover:text-[#d4622a] transition-colors">
                        {item.company}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[0.82rem] text-[#4a3728]">
                      <Link href={`/dashboard/job-hunt/applications/${item._id}`} className="hover:text-[#d4622a] transition-colors">
                        {item.jobTitle}
                      </Link>
                      {item.jobUrl && (
                        <a href={item.jobUrl} target="_blank" rel="noopener noreferrer" className="block text-[0.65rem] text-[#d4622a] font-mono mt-0.5">
                          View posting →
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[0.75rem] text-[#6b5c4e]">
                      <span>{formatDate(item.dateApplied)}</span>
                      <p className="text-[0.62rem] text-[#9a8a7a] mt-0.5">{item.daysSinceApplied}d ago</p>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={item.status}
                        disabled={savingId === item._id}
                        onChange={(e) => onStatusChange(item._id, e.target.value)}
                        className="bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-2 py-1.5 text-[0.72rem] text-[#2a2118]"
                      >
                        {APPLICATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[0.62rem] font-mono tracking-wide px-2 py-0.5 rounded-full ${followUpBadgeStyle(item.followUpAlert)}`}>
                        {item.followUpAlert}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => onDelete(item._id)} disabled={savingId === item._id}
                        className="text-[0.72rem] text-red-600 hover:text-red-700 disabled:opacity-50">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#e8e3db]">
            <span className="font-mono text-[0.68rem] text-[#8a7a6a]">
              {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))} disabled={pagination.page === 1}
                className="px-2.5 py-1 rounded-lg border border-[#ddd5c5] text-[0.72rem] text-[#4a3728] disabled:opacity-40">
                Previous
              </button>
              <span className="font-mono text-[0.68rem] text-[#8a7a6a]">{pagination.page} / {pagination.pages}</span>
              <button onClick={() => setPagination((p) => ({ ...p, page: Math.min(p.pages, p.page + 1) }))} disabled={pagination.page === pagination.pages}
                className="px-2.5 py-1 rounded-lg border border-[#ddd5c5] text-[0.72rem] text-[#4a3728] disabled:opacity-40">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
