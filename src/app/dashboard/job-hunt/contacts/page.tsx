"use client";

import { FormEvent, useCallback, useEffect, useState } from 'react';
import type { JobContactItem, PaginationData } from '@/types/job-hunt';
import { CONTACT_STATUSES, REFERRAL_OPTIONS, RELATIONSHIP_TYPES } from '@/lib/job-hunt-utils';

interface ContactsApiResponse {
  success: boolean;
  data?: {
    items: JobContactItem[];
    pagination: PaginationData;
  };
  error?: string;
}

interface FormState {
  name: string;
  company: string;
  titleOrRole: string;
  relationship: string;
  contactInfo: string;
  lastContact: string;
  nextFollowUp: string;
  referredYou: string;
  notes: string;
  status: string;
}

const initialForm: FormState = {
  name: '',
  company: '',
  titleOrRole: '',
  relationship: RELATIONSHIP_TYPES[0],
  contactInfo: '',
  lastContact: new Date().toISOString().slice(0, 10),
  nextFollowUp: '',
  referredYou: 'No',
  notes: '',
  status: 'Warm',
};

function formatDate(dateInput?: string) {
  if (!dateInput) return '—';
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
}

export default function JobHuntContactsPage() {
  const [items, setItems] = useState<JobContactItem[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({ total: 0, page: 1, limit: 20, pages: 1 });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [relationshipFilter, setRelationshipFilter] = useState('all');
  const [form, setForm] = useState<FormState>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const query = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
      });
      if (searchQuery.trim()) query.set('q', searchQuery.trim());
      if (statusFilter !== 'all') query.set('status', statusFilter);
      if (relationshipFilter !== 'all') query.set('relationship', relationshipFilter);
      const response = await fetch(`/api/job-hunt/contacts?${query.toString()}`);
      const data = (await response.json()) as ContactsApiResponse;
      if (!data.success || !data.data) throw new Error(data.error || 'Failed to fetch contacts');
      setItems(data.data.items);
      setPagination(data.data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contacts');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchQuery, statusFilter, relationshipFilter]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        name: form.name,
        company: form.company || undefined,
        titleOrRole: form.titleOrRole || undefined,
        relationship: form.relationship,
        contactInfo: form.contactInfo || undefined,
        lastContact: form.lastContact ? new Date(form.lastContact).toISOString() : undefined,
        nextFollowUp: form.nextFollowUp ? new Date(form.nextFollowUp).toISOString() : undefined,
        referredYou: form.referredYou,
        notes: form.notes || undefined,
        status: form.status,
      };

      const response = await fetch(editingId ? `/api/job-hunt/contacts/${editingId}` : '/api/job-hunt/contacts', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { success: boolean; error?: string };
      if (!data.success) throw new Error(data.error || (editingId ? 'Failed to update contact' : 'Failed to create contact'));

      setForm(initialForm);
      setEditingId(null);
      await fetchContacts();
    } catch (err) {
      setError(err instanceof Error ? err.message : (editingId ? 'Failed to update contact' : 'Failed to create contact'));
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (item: JobContactItem) => {
    setEditingId(item._id);
    setForm({
      name: item.name,
      company: item.company || '',
      titleOrRole: item.titleOrRole || '',
      relationship: item.relationship,
      contactInfo: item.contactInfo || '',
      lastContact: item.lastContact ? new Date(item.lastContact).toISOString().slice(0, 10) : '',
      nextFollowUp: item.nextFollowUp ? new Date(item.nextFollowUp).toISOString().slice(0, 10) : '',
      referredYou: item.referredYou,
      notes: item.notes || '',
      status: item.status,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onDelete = async (id: string) => {
    if (!window.confirm('Delete this contact?')) return;
    setError(null);

    try {
      const response = await fetch(`/api/job-hunt/contacts/${id}`, { method: 'DELETE' });
      const data = (await response.json()) as { success: boolean; error?: string };
      if (!data.success) throw new Error(data.error || 'Failed to delete contact');
      await fetchContacts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete contact');
    }
  };

  const inputClass = 'mt-1 w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.82rem] text-[#2a2118] focus:outline-none focus:border-[#d4622a]';

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[0.65rem] font-mono tracking-[0.15em] uppercase text-[#8a7a6a]">Networking</p>
        <h1 className="text-[1.05rem] font-semibold text-[#2a2118] mt-1">Contacts & Networking</h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>}

      <form onSubmit={onSubmit} className="bg-white border border-[#e8e3db] rounded-xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-[0.72rem] font-medium text-[#4a3728]">Name *</label>
          <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className="text-[0.72rem] font-medium text-[#4a3728]">Company</label>
          <input value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className="text-[0.72rem] font-medium text-[#4a3728]">Title / Role</label>
          <input value={form.titleOrRole} onChange={(e) => setForm((f) => ({ ...f, titleOrRole: e.target.value }))} className={inputClass} />
        </div>

        <div>
          <label className="text-[0.72rem] font-medium text-[#4a3728]">Relationship *</label>
          <select value={form.relationship} onChange={(e) => setForm((f) => ({ ...f, relationship: e.target.value }))} className={inputClass}>
            {RELATIONSHIP_TYPES.map((relationship) => <option key={relationship} value={relationship}>{relationship}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[0.72rem] font-medium text-[#4a3728]">Email / LinkedIn</label>
          <input value={form.contactInfo} onChange={(e) => setForm((f) => ({ ...f, contactInfo: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className="text-[0.72rem] font-medium text-[#4a3728]">Status *</label>
          <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className={inputClass}>
            {CONTACT_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[0.72rem] font-medium text-[#4a3728]">Last Contact</label>
          <input type="date" value={form.lastContact} onChange={(e) => setForm((f) => ({ ...f, lastContact: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className="text-[0.72rem] font-medium text-[#4a3728]">Next Follow-up</label>
          <input type="date" value={form.nextFollowUp} onChange={(e) => setForm((f) => ({ ...f, nextFollowUp: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className="text-[0.72rem] font-medium text-[#4a3728]">Referred You?</label>
          <select value={form.referredYou} onChange={(e) => setForm((f) => ({ ...f, referredYou: e.target.value }))} className={inputClass}>
            {REFERRAL_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>

        <div className="md:col-span-3">
          <label className="text-[0.72rem] font-medium text-[#4a3728]">Notes</label>
          <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className={`${inputClass} min-h-[90px]`} />
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
            {saving ? 'Saving…' : editingId ? 'Update Contact' : 'Add Contact'}
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
            placeholder="Name, company, role, notes"
            className="w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.875rem]"
          />
        </div>

        <div className="min-w-[150px]">
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
            {CONTACT_STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="min-w-[170px]">
          <label className="block text-[0.65rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] mb-1.5">Relationship</label>
          <select
            value={relationshipFilter}
            onChange={(e) => {
              setPagination((prev) => ({ ...prev, page: 1 }));
              setRelationshipFilter(e.target.value);
            }}
            className="w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.875rem]"
          >
            <option value="all">All</option>
            {RELATIONSHIP_TYPES.map((relationship) => (
              <option key={relationship} value={relationship}>{relationship}</option>
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
                {['Name', 'Company', 'Relationship', 'Status', 'Next Follow-up', 'Actions'].map((heading) => (
                  <th key={heading} className={`px-4 py-3 text-[0.65rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a] font-medium ${heading === 'Actions' ? 'text-right' : 'text-left'}`}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f1ee]">
              {loading ? (
                <tr><td colSpan={6} className="py-10 text-center"><div className="w-5 h-5 border-2 border-[#e8e3db] border-t-[#d4622a] rounded-full animate-spin mx-auto" /></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-[0.85rem] text-[#8a7a6a]">No contacts yet.</td></tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id} className="hover:bg-[#faf8f4] transition-colors">
                    <td className="px-4 py-3.5 text-[0.82rem] text-[#2a2118] font-medium">{item.name}</td>
                    <td className="px-4 py-3.5 text-[0.78rem] text-[#4a3728]">{item.company || '—'}</td>
                    <td className="px-4 py-3.5 text-[0.74rem] text-[#6b5c4e]">{item.relationship}</td>
                    <td className="px-4 py-3.5 text-[0.74rem] text-[#6b5c4e]">{item.status}</td>
                    <td className="px-4 py-3.5 text-[0.74rem] text-[#6b5c4e]">{formatDate(item.nextFollowUp)}</td>
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
