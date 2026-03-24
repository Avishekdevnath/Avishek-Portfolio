"use client";

import { useCallback, useEffect, useState } from 'react';
import type { JobLeadItem, PaginationData } from '@/types/job-hunt';
import { LEAD_SOURCES, LEAD_STATUSES } from '@/lib/job-hunt-utils';

interface LeadsApiResponse {
  success: boolean;
  data?: {
    items: JobLeadItem[];
    pagination: PaginationData;
  };
  error?: string;
}

interface FetchApiResponse {
  success: boolean;
  data?: {
    fetched: number;
    inserted: number;
    skipped: number;
    failedSources: string[];
    keywordsUsed?: string[];
  };
  error?: string;
}

interface FetchCriteria {
  title: string;
  role: string;
  tech: string;
  location: string;
  remoteOnly: boolean;
  source: string;
}

function formatDate(dateInput?: string) {
  if (!dateInput) return '—';
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
}

export default function JobLeadsPage() {
  const [items, setItems] = useState<JobLeadItem[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({ total: 0, page: 1, limit: 20, pages: 1 });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState('');
  const [techFilter, setTechFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minFit, setMinFit] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'dateFound' | 'fitScore'>('dateFound');
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>('Applied');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkBookmarking, setBulkBookmarking] = useState(false);
  const [digesting, setDigesting] = useState(false);
  const [runningDaily, setRunningDaily] = useState(false);
  const [bookmarkingId, setBookmarkingId] = useState<string | null>(null);
  const [isFetchModalOpen, setIsFetchModalOpen] = useState(false);
  const [fetchCriteria, setFetchCriteria] = useState<FetchCriteria>({
    title: '',
    role: '',
    tech: '',
    location: '',
    remoteOnly: true,
    source: 'all',
  });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
      });
      if (statusFilter !== 'all') query.set('status', statusFilter);
      if (sourceFilter !== 'all') query.set('source', sourceFilter);
      if (searchQuery.trim()) query.set('q', searchQuery.trim());
      if (roleFilter.trim()) query.set('role', roleFilter.trim());
      if (techFilter.trim()) query.set('tech', techFilter.trim());
      if (dateFrom) query.set('dateFrom', dateFrom);
      if (dateTo) query.set('dateTo', dateTo);
      if (minFit > 0) query.set('minFit', String(minFit));
      query.set('sortBy', sortBy);
      query.set('sortOrder', 'desc');

      const response = await fetch(`/api/job-hunt/leads?${query.toString()}`);
      const data = (await response.json()) as LeadsApiResponse;
      if (!data.success || !data.data) throw new Error(data.error || 'Failed to fetch leads');

      setItems(data.data.items);
      setPagination(data.data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leads');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, sourceFilter, statusFilter, searchQuery, roleFilter, techFilter, dateFrom, dateTo, minFit, sortBy]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => items.some((item) => item._id === id)));
  }, [items]);

  const onManualFetch = async (criteria?: FetchCriteria) => {
    setFetching(true);
    setError(null);
    setSummary(null);

    try {
      const payload = {
        title: criteria?.title ?? searchQuery,
        role: criteria?.role ?? roleFilter,
        tech: criteria?.tech ?? techFilter,
        location: criteria?.location ?? '',
        remoteOnly: criteria?.remoteOnly ?? false,
        source: criteria?.source ?? 'all',
      };

      const response = await fetch('/api/job-hunt/leads/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as FetchApiResponse;
      if (!data.success || !data.data) throw new Error(data.error || 'Failed to fetch leads from sources');

      const failed = data.data.failedSources.length > 0 ? `; failed: ${data.data.failedSources.join(', ')}` : '';
      const keywords = data.data.keywordsUsed?.length ? `; keywords: ${data.data.keywordsUsed.slice(0, 8).join(', ')}` : '';
      setSummary(`Fetched ${data.data.fetched}, inserted ${data.data.inserted}, skipped ${data.data.skipped}${failed}${keywords}`);
      await fetchLeads();
      if (criteria) setIsFetchModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leads from sources');
    } finally {
      setFetching(false);
    }
  };

  const openFetchModal = () => {
    setFetchCriteria({
      title: searchQuery,
      role: roleFilter,
      tech: techFilter,
      location: '',
      remoteOnly: true,
      source: sourceFilter !== 'all' ? sourceFilter : 'all',
    });
    setIsFetchModalOpen(true);
  };

  const onStatusChange = async (id: string, status: string) => {
    setSavingId(id);
    setError(null);
    try {
      const response = await fetch(`/api/job-hunt/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = (await response.json()) as { success: boolean; error?: string };
      if (!data.success) throw new Error(data.error || 'Failed to update lead');
      await fetchLeads();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update lead status');
    } finally {
      setSavingId(null);
    }
  };

  const toggleSelectAllOnPage = (checked: boolean) => {
    if (checked) {
      setSelectedIds(items.map((item) => item._id));
      return;
    }
    setSelectedIds([]);
  };

  const onBulkAction = async (action: 'delete' | 'update-status') => {
    if (selectedIds.length === 0) return;
    if (action === 'delete' && !window.confirm(`Delete ${selectedIds.length} selected lead(s)?`)) return;

    setBulkLoading(true);
    setError(null);
    setSummary(null);

    try {
      const response = await fetch('/api/job-hunt/leads/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedIds,
          action,
          ...(action === 'update-status' ? { status: bulkStatus } : {}),
        }),
      });

      const data = (await response.json()) as {
        success: boolean;
        data?: { affected: number; status?: string };
        error?: string;
      };

      if (!data.success || !data.data) throw new Error(data.error || 'Bulk action failed');

      setSummary(
        action === 'delete'
          ? `Deleted ${data.data.affected} lead(s).`
          : `Updated ${data.data.affected} lead(s) to ${data.data.status || bulkStatus}.`
      );
      setSelectedIds([]);
      await fetchLeads();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk action failed');
    } finally {
      setBulkLoading(false);
    }
  };

  const allSelectedOnPage = items.length > 0 && items.every((item) => selectedIds.includes(item._id));

  const onSendDigest = async () => {
    setDigesting(true);
    setError(null);
    setSummary(null);
    try {
      const response = await fetch('/api/job-hunt/digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onlyToday: true, sendEmail: true }),
      });

      const data = (await response.json()) as {
        success: boolean;
        data?: { total: number; remote: number; dhaka: number; emailSent: boolean };
        error?: string;
      };

      if (!data.success || !data.data) throw new Error(data.error || 'Failed to send digest');
      setSummary(`Digest ready: ${data.data.total} jobs (${data.data.remote} remote, ${data.data.dhaka} dhaka). Email ${data.data.emailSent ? 'sent' : 'preview-only (email creds missing)'}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send digest');
    } finally {
      setDigesting(false);
    }
  };

  const onRunDailyCycle = async () => {
    setRunningDaily(true);
    setError(null);
    setSummary(null);
    try {
      const response = await fetch('/api/job-hunt/automation/daily-run', { method: 'POST' });
      const data = (await response.json()) as {
        success: boolean;
        data?: {
          fetch?: { fetched: number; inserted: number; skipped: number };
          digest?: { total: number; emailSent: boolean };
        };
        error?: string;
      };

      if (!data.success || !data.data) throw new Error(data.error || 'Failed daily cycle');

      setSummary(
        `Daily run complete: fetched ${data.data.fetch?.fetched ?? 0}, inserted ${data.data.fetch?.inserted ?? 0}, skipped ${data.data.fetch?.skipped ?? 0}; digest total ${data.data.digest?.total ?? 0} (${data.data.digest?.emailSent ? 'email sent' : 'preview-only'}).`
      );

      await fetchLeads();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed daily cycle');
    } finally {
      setRunningDaily(false);
    }
  };

  const onSaveBookmark = async (id: string) => {
    setBookmarkingId(id);
    setError(null);
    setSummary(null);
    try {
      const response = await fetch(`/api/job-hunt/leads/${id}/bookmark`, { method: 'POST' });
      const data = (await response.json()) as {
        success: boolean;
        error?: string;
        meta?: { alreadyExists?: boolean };
      };

      if (!data.success) throw new Error(data.error || 'Failed to save bookmark');

      setSummary(data.meta?.alreadyExists ? 'Bookmark already exists for this lead.' : 'Lead saved to bookmarks.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save bookmark');
    } finally {
      setBookmarkingId(null);
    }
  };

  const onBulkSaveBookmarks = async () => {
    if (selectedIds.length === 0) return;

    setBulkBookmarking(true);
    setError(null);
    setSummary(null);

    try {
      const response = await fetch('/api/job-hunt/leads/bookmark-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });

      const data = (await response.json()) as {
        success: boolean;
        error?: string;
        data?: {
          requested: number;
          processed: number;
          created: number;
          alreadyExists: number;
          skippedInvalidPlatform: number;
        };
      };

      if (!data.success || !data.data) throw new Error(data.error || 'Bulk bookmark save failed');

      setSummary(
        `Bookmarks: created ${data.data.created}, existing ${data.data.alreadyExists}, skipped-platform ${data.data.skippedInvalidPlatform}.`
      );
      setSelectedIds([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk bookmark save failed');
    } finally {
      setBulkBookmarking(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-mono tracking-[0.15em] uppercase text-[#8a7a6a]">
            {pagination.total} lead{pagination.total === 1 ? '' : 's'}
          </p>
          <h1 className="text-[1.05rem] font-semibold text-[#2a2118] mt-1">Job Leads</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openFetchModal}
            disabled={fetching}
            className="px-4 py-2 bg-[#2a2118] text-[#f0ece3] rounded-lg text-[0.82rem] font-medium hover:bg-[#d4622a] disabled:opacity-60"
          >
            {fetching ? 'Fetching…' : 'Fetch New Leads'}
          </button>
          <button
            onClick={onSendDigest}
            disabled={digesting}
            className="px-4 py-2 border border-[#ddd5c5] text-[#4a3728] rounded-lg text-[0.82rem] font-medium hover:border-[#d4622a] hover:text-[#d4622a] disabled:opacity-60"
          >
            {digesting ? 'Building Digest…' : 'Send Digest'}
          </button>
          <button
            onClick={onRunDailyCycle}
            disabled={runningDaily}
            className="px-4 py-2 bg-[#d4622a] text-white rounded-lg text-[0.82rem] font-medium hover:bg-[#bd5422] disabled:opacity-60"
          >
            {runningDaily ? 'Running…' : 'Run Daily Cycle'}
          </button>
        </div>
      </div>

      {isFetchModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-xl border border-[#e8e3db] shadow-2xl">
            <div className="px-5 py-4 border-b border-[#eee7dc]">
              <h2 className="text-[1rem] font-semibold text-[#2a2118]">Fetch Job Leads</h2>
              <p className="text-[0.78rem] text-[#8a7a6a] mt-1">Add title and requirements to fetch targeted jobs.</p>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[0.68rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] mb-1.5">Job title / search</label>
                <input
                  value={fetchCriteria.title}
                  onChange={(e) => setFetchCriteria((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. software engineer"
                  className="w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.88rem]"
                />
              </div>

              <div>
                <label className="block text-[0.68rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] mb-1.5">Role keywords</label>
                <input
                  value={fetchCriteria.role}
                  onChange={(e) => setFetchCriteria((prev) => ({ ...prev, role: e.target.value }))}
                  placeholder="backend, full stack"
                  className="w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.88rem]"
                />
              </div>

              <div>
                <label className="block text-[0.68rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] mb-1.5">Tech stack</label>
                <input
                  value={fetchCriteria.tech}
                  onChange={(e) => setFetchCriteria((prev) => ({ ...prev, tech: e.target.value }))}
                  placeholder="node, react, python"
                  className="w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.88rem]"
                />
              </div>

              <div>
                <label className="block text-[0.68rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] mb-1.5">Location contains</label>
                <input
                  value={fetchCriteria.location}
                  onChange={(e) => setFetchCriteria((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="remote / dhaka / us"
                  className="w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.88rem]"
                />
              </div>

              <div>
                <label className="block text-[0.68rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] mb-1.5">Source</label>
                <select
                  value={fetchCriteria.source}
                  onChange={(e) => setFetchCriteria((prev) => ({ ...prev, source: e.target.value }))}
                  className="w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.88rem]"
                >
                  <option value="all">All sources</option>
                  {LEAD_SOURCES.map((source) => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>

              <label className="inline-flex items-center gap-2 text-[0.82rem] text-[#4a3728] mt-1">
                <input
                  type="checkbox"
                  checked={fetchCriteria.remoteOnly}
                  onChange={(e) => setFetchCriteria((prev) => ({ ...prev, remoteOnly: e.target.checked }))}
                />
                Remote only
              </label>
            </div>

            <div className="px-5 py-4 border-t border-[#eee7dc] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsFetchModalOpen(false)}
                className="px-4 py-2 border border-[#ddd5c5] rounded-lg text-[0.82rem] text-[#4a3728]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => onManualFetch(fetchCriteria)}
                disabled={fetching}
                className="px-4 py-2 bg-[#2a2118] text-[#f0ece3] rounded-lg text-[0.82rem] font-medium hover:bg-[#d4622a] disabled:opacity-60"
              >
                {fetching ? 'Fetching…' : 'Fetch Leads'}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>}
      {summary && <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm">{summary}</div>}

      <div className="bg-white border border-[#e8e3db] rounded-xl p-4 shadow-sm flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-1">
          <label className="block text-[0.65rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] mb-1.5">Search</label>
          <input
            value={searchQuery}
            onChange={(e) => {
              setPagination((prev) => ({ ...prev, page: 1 }));
              setSearchQuery(e.target.value);
            }}
            placeholder="Title, company, or location"
            className="w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.875rem]"
          />
        </div>

        <div className="min-w-[170px]">
          <label className="block text-[0.65rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] mb-1.5">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setPagination((prev) => ({ ...prev, page: 1 }));
              setStatusFilter(e.target.value);
            }}
            className="w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.875rem]"
          >
            <option value="all">All</option>
            {LEAD_STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="min-w-[180px]">
          <label className="block text-[0.65rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] mb-1.5">Source</label>
          <select
            value={sourceFilter}
            onChange={(e) => {
              setPagination((prev) => ({ ...prev, page: 1 }));
              setSourceFilter(e.target.value);
            }}
            className="w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.875rem]"
          >
            <option value="all">All Sources</option>
            {LEAD_SOURCES.map((source) => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
        </div>

        <div className="min-w-[130px]">
          <label className="block text-[0.65rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] mb-1.5">Per page</label>
          <select
            value={String(pagination.limit)}
            onChange={(e) => {
              setPagination((prev) => ({ ...prev, page: 1, limit: Number(e.target.value) }));
            }}
            className="w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.875rem]"
          >
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        <div className="min-w-[180px]">
          <label className="block text-[0.65rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] mb-1.5">Role filter</label>
          <input
            value={roleFilter}
            onChange={(e) => {
              setPagination((prev) => ({ ...prev, page: 1 }));
              setRoleFilter(e.target.value);
            }}
            placeholder="e.g. backend engineer"
            className="w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.875rem]"
          />
        </div>

        <div className="min-w-[180px]">
          <label className="block text-[0.65rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] mb-1.5">Tech filter</label>
          <input
            value={techFilter}
            onChange={(e) => {
              setPagination((prev) => ({ ...prev, page: 1 }));
              setTechFilter(e.target.value);
            }}
            placeholder="e.g. node react"
            className="w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.875rem]"
          />
        </div>

        <div className="min-w-[160px]">
          <label className="block text-[0.65rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] mb-1.5">Date from</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setPagination((prev) => ({ ...prev, page: 1 }));
              setDateFrom(e.target.value);
            }}
            className="w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.875rem]"
          />
        </div>

        <div className="min-w-[160px]">
          <label className="block text-[0.65rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] mb-1.5">Date to</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setPagination((prev) => ({ ...prev, page: 1 }));
              setDateTo(e.target.value);
            }}
            className="w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.875rem]"
          />
        </div>

        <div className="min-w-[130px]">
          <label className="block text-[0.65rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] mb-1.5">Min fit</label>
          <select
            value={String(minFit)}
            onChange={(e) => {
              setPagination((prev) => ({ ...prev, page: 1 }));
              setMinFit(Number(e.target.value));
            }}
            className="w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.875rem]"
          >
            {[0, 40, 50, 60, 70, 80].map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </div>

        <div className="min-w-[160px]">
          <label className="block text-[0.65rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] mb-1.5">Sort by</label>
          <select
            value={sortBy}
            onChange={(e) => {
              setPagination((prev) => ({ ...prev, page: 1 }));
              setSortBy(e.target.value as 'dateFound' | 'fitScore');
            }}
            className="w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.875rem]"
          >
            <option value="dateFound">Newest</option>
            <option value="fitScore">Best fit</option>
          </select>
        </div>

        <div className="w-full border-t border-[#efe9df] pt-3 mt-1 flex flex-wrap items-center gap-2">
          <span className="text-[0.72rem] text-[#6b5c4e]">Selected: {selectedIds.length}</span>
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            className="bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-2.5 py-1.5 text-[0.75rem] text-[#2a2118]"
          >
            {LEAD_STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <button
            onClick={() => onBulkAction('update-status')}
            disabled={bulkLoading || selectedIds.length === 0}
            className="px-3 py-1.5 rounded-lg border border-[#ddd5c5] text-[0.75rem] text-[#4a3728] disabled:opacity-40"
          >
            Apply Status
          </button>
          <button
            onClick={() => onBulkAction('delete')}
            disabled={bulkLoading || selectedIds.length === 0}
            className="px-3 py-1.5 rounded-lg border border-red-200 text-[0.75rem] text-red-700 disabled:opacity-40"
          >
            Delete Selected
          </button>
          <button
            onClick={onBulkSaveBookmarks}
            disabled={bulkBookmarking || selectedIds.length === 0}
            className="px-3 py-1.5 rounded-lg border border-[#ddd5c5] text-[0.75rem] text-[#2a2118] hover:border-[#d4622a] hover:text-[#d4622a] disabled:opacity-40"
          >
            {bulkBookmarking ? 'Saving…' : 'Save Selected as Bookmarks'}
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#e8e3db] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f7f5f1]">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allSelectedOnPage}
                    onChange={(e) => toggleSelectAllOnPage(e.target.checked)}
                    aria-label="Select all leads on page"
                  />
                </th>
                {['Title', 'Company', 'Source', 'Found', 'Status', 'Fit', 'Synced'].map((heading) => (
                  <th key={heading} className="px-4 py-3 text-left text-[0.65rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a] font-medium">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f1ee]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center">
                    <div className="w-5 h-5 border-2 border-[#e8e3db] border-t-[#d4622a] rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[0.85rem] text-[#8a7a6a]">No leads found.</td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id} className="hover:bg-[#faf8f4] transition-colors">
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds((prev) => [...new Set([...prev, item._id])]);
                          } else {
                            setSelectedIds((prev) => prev.filter((id) => id !== item._id));
                          }
                        }}
                        aria-label={`Select lead ${item.title}`}
                      />
                    </td>
                    <td className="px-4 py-3.5 text-[0.82rem] text-[#4a3728]">
                      <p className="font-medium text-[#2a2118]">{item.title}</p>
                      <a href={item.jobUrl} target="_blank" rel="noopener noreferrer" className="text-[0.68rem] text-[#d4622a] font-mono">
                        Open job →
                      </a>
                      <button
                        onClick={() => onSaveBookmark(item._id)}
                        disabled={bookmarkingId === item._id}
                        className="ml-3 text-[0.68rem] text-[#2a2118] border border-[#ddd5c5] rounded-md px-2 py-0.5 hover:border-[#d4622a] hover:text-[#d4622a] disabled:opacity-50"
                      >
                        {bookmarkingId === item._id ? 'Saving…' : 'Save Bookmark'}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-[0.82rem] text-[#4a3728]">{item.company}</td>
                    <td className="px-4 py-3.5 text-[0.75rem] text-[#6b5c4e]">{item.source}</td>
                    <td className="px-4 py-3.5 text-[0.75rem] text-[#6b5c4e]">{formatDate(item.dateFound)}</td>
                    <td className="px-4 py-3.5">
                      <select
                        value={item.status}
                        disabled={savingId === item._id}
                        onChange={(e) => onStatusChange(item._id, e.target.value)}
                        className="bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-2.5 py-1.5 text-[0.75rem] text-[#2a2118]"
                      >
                        {LEAD_STATUSES.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-[0.65rem] font-mono tracking-wide px-2.5 py-1 rounded-full ${
                          Number(item.fitScore || 0) >= 80
                            ? 'bg-green-100 text-green-700'
                            : Number(item.fitScore || 0) >= 60
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-[#f3f1ee] text-[#6b5c4e]'
                        }`}
                      >
                        {Number(item.fitScore || 0)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[0.65rem] font-mono tracking-wide px-2.5 py-1 rounded-full ${item.synced ? 'bg-green-100 text-green-700' : 'bg-[#f3f1ee] text-[#6b5c4e]'}`}>
                        {item.synced ? 'Yes' : 'No'}
                      </span>
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
