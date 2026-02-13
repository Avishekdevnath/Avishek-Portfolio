"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { OutreachCompany } from "@/types/outreach";

interface CompanyFormData {
  name: string;
  country: string;
  website: string;
  careerPageUrl: string;
  tags: string;
  notes: string;
}

const initialForm: CompanyFormData = {
  name: "",
  country: "",
  website: "",
  careerPageUrl: "",
  tags: "",
  notes: "",
};

export default function OutreachCompaniesPage() {
  const [companies, setCompanies] = useState<OutreachCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [showStarred, setShowStarred] = useState(false);

  const [form, setForm] = useState<CompanyFormData>(initialForm);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchCompanies = async (includeArchived = showArchived) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (countryFilter.trim()) params.set("country", countryFilter.trim());
      if (includeArchived) params.set("showArchived", "true");
      const res = await fetch(`/api/outreach/companies?${params.toString()}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to fetch companies");
      setCompanies(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch companies");
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [search, countryFilter]);

  // Get unique countries and tags for filters
  const countries = useMemo(() => {
    const all = companies.map(c => c.country).filter(Boolean);
    return [...new Set(all)].sort();
  }, [companies]);

  const allTags = useMemo(() => {
    const all = companies.flatMap(c => c.tags || []);
    return [...new Set(all)].sort();
  }, [companies]);

  const filtered = useMemo(() => {
    let result = companies;
    const s = search.trim().toLowerCase();
    
    // Filter based on showArchived
    if (!showArchived) {
      // Hide archived companies
      result = result.filter(c => !c.archived);
    } else {
      // Show only archived companies
      result = result.filter(c => c.archived);
    }
    
    if (s) {
      result = result.filter(c => 
        c.name.toLowerCase().includes(s) ||
        c.website?.toLowerCase().includes(s) ||
        c.country?.toLowerCase().includes(s) ||
        c.careerPageUrl?.toLowerCase().includes(s) ||
        c.tags?.some(t => t.toLowerCase().includes(s)) ||
        c.notes?.toLowerCase().includes(s)
      );
    }
    if (tagFilter) {
      result = result.filter(c => c.tags?.includes(tagFilter));
    }
    if (showStarred) {
      result = result.filter(c => c.starred);
    }
    
    if (tagFilter) {
      result = result.filter(c => c.tags?.includes(tagFilter));
    }
    return result;
  }, [companies, search, tagFilter, showArchived, showStarred]);

  const toggleStar = async (id: string, currentStarred: boolean) => {
    try {
      const res = await fetch(`/api/outreach/companies/${id}/star`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ starred: !currentStarred }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchCompanies();
      }
    } catch (err) {
      console.error('Failed to toggle star:', err);
    }
  };

  const openAddModal = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (company: OutreachCompany) => {
    setForm({
      name: company.name,
      country: company.country,
      website: company.website || "",
      careerPageUrl: company.careerPageUrl || "",
      tags: company.tags?.join(", ") || "",
      notes: company.notes || "",
    });
    setEditingId(company._id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(initialForm);
    setEditingId(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const url = editingId ? `/api/outreach/companies/${editingId}` : "/api/outreach/companies";
      const method = editingId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          website: form.website || undefined,
          careerPageUrl: form.careerPageUrl || undefined,
          notes: form.notes || undefined,
          country: form.country || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to save company");

      closeModal();
      await fetchCompanies();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save company");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this company?")) return;
    setError(null);
    try {
      const res = await fetch(`/api/outreach/companies/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to delete company");
      await fetchCompanies();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete company");
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Outreach • Companies</h1>
            <p className="text-gray-600">Store target companies and context.</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/dashboard/outreach/companies/import"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              Import CSV
            </Link>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Add Company
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex flex-wrap gap-3 md:items-center md:justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Companies ({filtered.length})</h2>
          <div className="flex flex-wrap gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 w-48"
              placeholder="Search name, tags, notes..."
            />
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 w-40"
            >
              <option value="">All countries</option>
              {countries.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 w-40"
            >
              <option value="">All tags</option>
              {allTags.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <button
              onClick={() => {
                const newValue = !showStarred;
                setShowStarred(newValue);
              }}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${showStarred ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {showStarred ? '★ Starred' : '☆ Starred'}
            </button>
            <button
              onClick={() => {
                const newValue = !showArchived;
                setShowArchived(newValue);
                fetchCompanies(newValue);
              }}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${showArchived ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {showArchived ? 'Hide Archived' : 'Show Archived'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-gray-600">No companies found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4 w-8">★</th>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Website</th>
                  <th className="py-2 pr-4">Country</th>
                  <th className="py-2 pr-4">Career</th>
                  <th className="py-2 pr-4">Tags</th>
                  <th className="py-2 pr-4">Notes</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const tags = c.tags || [];
                  return (
                  <tr key={c._id} className="border-b last:border-b-0 hover:bg-gray-50">
                    <td className="py-2 pr-4">
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch(`/api/outreach/companies/${c._id}/star`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ starred: !c.starred }),
                            });
                            if (res.ok) {
                              await fetchCompanies();
                            }
                          } catch (err) {
                            console.error('Failed to toggle star', err);
                          }
                        }}
                        className={`text-lg ${c.starred ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'}`}
                        title={c.starred ? "Unstar" : "Star"}
                      >
                        ★
                      </button>
                    </td>
                    <td className="py-2 pr-4">
                      <Link
                        href={`/dashboard/outreach/companies/${c._id}`}
                        className="font-medium text-gray-900 hover:text-blue-600 hover:underline"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="py-2 pr-4">
                      {c.website ? (
                        <a
                          href={c.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {c.website.replace(/^https?:\/\//, '').slice(0, 30)}...
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-2 pr-4">{c.country || "—"}</td>
                    <td className="py-2 pr-4">
                      {c.careerPageUrl ? (
                        <a
                          href={c.careerPageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          careers
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-2 pr-4">
                      {tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs"
                            >
                              {t}
                            </span>
                          ))}
                          {tags.length > 3 && (
                            <span className="text-xs text-gray-500">+{tags.length - 3}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-2 pr-4">
                      {c.notes ? (
                        <span className="text-gray-600 text-sm" title={c.notes}>
                          {c.notes.slice(0, 50)}{c.notes.length > 50 ? '...' : ''}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/outreach/companies/${c._id}`}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="View"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm(c.archived ? 'Unarchive this company?' : 'Archive this company?')) return;
                            try {
                              const res = await fetch(`/api/outreach/companies/${c._id}/archive`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ archived: !c.archived }),
                              });
                              if (res.ok) {
                                await fetchCompanies();
                              }
                            } catch (err) {
                              console.error('Failed to toggle archive', err);
                            }
                          }}
                          className={`p-1.5 rounded ${c.archived ? 'text-green-600 hover:bg-green-50' : 'text-orange-600 hover:bg-orange-50'}`}
                          title={c.archived ? 'Unarchive' : 'Archive'}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onDelete(c._id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit/Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingId ? "Edit Company" : "Add Company"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-700">Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Company name"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-700">Country *</label>
                    <input
                      value={form.country}
                      onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="United States"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-700">Website</label>
                    <input
                      value={form.website}
                      onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-700">Career page</label>
                  <input
                    value={form.careerPageUrl}
                    onChange={(e) => setForm((p) => ({ ...p, careerPageUrl: e.target.value }))}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="https://.../careers"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-700">Tags (comma separated)</label>
                  <input
                    value={form.tags}
                    onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="backend, fintech, scale"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-700">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[100px]"
                    placeholder="Why this company / what to mention..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
                  >
                    {saving ? "Saving..." : editingId ? "Update" : "Add"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
