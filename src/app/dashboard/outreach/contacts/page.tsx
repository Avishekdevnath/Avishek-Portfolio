"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { OutreachCompany, OutreachContact } from "@/types/outreach";

export default function OutreachContactsPage() {
  const [companies, setCompanies] = useState<OutreachCompany[]>([]);
  const [contacts, setContacts] = useState<OutreachContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "new" | "contacted" | "replied" | "closed"
  >("all");

  const [form, setForm] = useState({
    companyId: "",
    name: "",
    email: "",
    roleTitle: "",
    linkedinUrl: "",
    status: "new",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchCompanies = async () => {
    const res = await fetch("/api/outreach/companies");
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to fetch companies");
    setCompanies(data.data || []);
  };

  const fetchContacts = async () => {
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (search.trim()) params.set("search", search.trim());

    const res = await fetch(`/api/outreach/contacts?${params.toString()}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to fetch contacts");
    setContacts(data.data || []);
  };

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchCompanies(), fetchContacts()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
      setCompanies([]);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchContacts().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return contacts;
    return contacts.filter((c) => {
      const companyName = c.company?.name || "";
      return (
        c.name.toLowerCase().includes(s) ||
        c.email.toLowerCase().includes(s) ||
        companyName.toLowerCase().includes(s)
      );
    });
  }, [contacts, search]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/outreach/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          roleTitle: form.roleTitle || undefined,
          linkedinUrl: form.linkedinUrl || undefined,
          notes: form.notes || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to create contact");

      setForm({
        companyId: "",
        name: "",
        email: "",
        roleTitle: "",
        linkedinUrl: "",
        status: "new",
        notes: "",
      });
      await fetchContacts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create contact");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this contact?")) return;
    setError(null);
    try {
      const res = await fetch(`/api/outreach/contacts/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to delete contact");
      await fetchContacts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete contact");
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Outreach • Contacts</h1>
            <p className="text-gray-600">Manage recruiters / hiring managers.</p>
          </div>
          <Link
            href="/dashboard/outreach/contacts/import"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
          >
            Import CSV
          </Link>
        </div>
        {/* Removed OutreachNav - navigation via sidebar */}
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h2 className="font-semibold text-gray-900 mb-3">Add contact</h2>
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className="text-sm text-gray-700">Company</label>
            <select
              value={form.companyId}
              onChange={(e) => setForm((p) => ({ ...p, companyId: e.target.value }))}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
              required
            >
              <option value="" disabled>
                Select company
              </option>
              {companies.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-700">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Recruiter name"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-700">Email</label>
            <input
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="name@company.com"
              type="email"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-700">Role title (optional)</label>
            <input
              value={form.roleTitle}
              onChange={(e) => setForm((p) => ({ ...p, roleTitle: e.target.value }))}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Recruiter / Hiring Manager"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700">LinkedIn (optional)</label>
            <input
              value={form.linkedinUrl}
              onChange={(e) => setForm((p) => ({ ...p, linkedinUrl: e.target.value }))}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="https://linkedin.com/in/..."
            />
          </div>

          <div>
            <label className="text-sm text-gray-700">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
            >
              <option value="new">new</option>
              <option value="contacted">contacted</option>
              <option value="replied">replied</option>
              <option value="closed">closed</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-gray-700">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[90px]"
              placeholder="Personalization hooks..."
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Add contact"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Contacts</h2>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
            >
              <option value="all">all</option>
              <option value="new">new</option>
              <option value="contacted">contacted</option>
              <option value="replied">replied</option>
              <option value="closed">closed</option>
            </select>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-72"
              placeholder="Search..."
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-gray-600">No contacts yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Company</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c._id} className="border-b last:border-b-0">
                    <td className="py-2 pr-4 font-medium text-gray-900">{c.name}</td>
                    <td className="py-2 pr-4 text-gray-700">{c.email}</td>
                    <td className="py-2 pr-4 text-gray-700">{c.company?.name || "—"}</td>
                    <td className="py-2 pr-4">
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => onDelete(c._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

