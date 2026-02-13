"use client";

import { useEffect, useMemo, useState } from "react";
import type { OutreachTemplate } from "@/types/outreach";

export default function OutreachTemplatesPage() {
  const [templates, setTemplates] = useState<OutreachTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    type: "cold",
    tone: "professional",
    subjectTemplate: "",
    bodyTemplate: "",
    variables: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/outreach/templates");
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to fetch templates");
      setTemplates(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch templates");
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return templates;
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(s) ||
        t.subjectTemplate.toLowerCase().includes(s) ||
        t.bodyTemplate.toLowerCase().includes(s)
    );
  }, [templates, search]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/outreach/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          type: form.type,
          tone: form.tone,
          subjectTemplate: form.subjectTemplate,
          bodyTemplate: form.bodyTemplate,
          variables: form.variables,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to create template");

      setForm({
        name: "",
        type: "cold",
        tone: "professional",
        subjectTemplate: "",
        bodyTemplate: "",
        variables: "",
      });
      await fetchTemplates();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create template");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    setError(null);
    try {
      const res = await fetch(`/api/outreach/templates/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to delete template");
      await fetchTemplates();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete template");
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Outreach • Templates</h1>
        <p className="text-gray-600">Reusable outreach email structures.</p>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h2 className="font-semibold text-gray-900 mb-3">Add template</h2>
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className="text-sm text-gray-700">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Cold intro (backend)"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-700">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
            >
              <option value="cold">cold</option>
              <option value="post_application">post_application</option>
              <option value="follow_up">follow_up</option>
              <option value="referral">referral</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-700">Tone</label>
            <select
              value={form.tone}
              onChange={(e) => setForm((p) => ({ ...p, tone: e.target.value }))}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
            >
              <option value="professional">professional</option>
              <option value="friendly">friendly</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-gray-700">Subject template</label>
            <input
              value={form.subjectTemplate}
              onChange={(e) => setForm((p) => ({ ...p, subjectTemplate: e.target.value }))}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Interest in {{role}} at {{company}}"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-gray-700">Body template</label>
            <textarea
              value={form.bodyTemplate}
              onChange={(e) => setForm((p) => ({ ...p, bodyTemplate: e.target.value }))}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[160px] font-mono text-sm"
              placeholder="Hi {{name}},\n\n..."
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-gray-700">Variables (comma separated)</label>
            <input
              value={form.variables}
              onChange={(e) => setForm((p) => ({ ...p, variables: e.target.value }))}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="name, company, role, project1"
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Add template"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Templates</h2>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full md:w-96"
            placeholder="Search templates..."
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-gray-600">No templates yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Tone</th>
                  <th className="py-2 pr-4">Subject</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t._id} className="border-b last:border-b-0">
                    <td className="py-2 pr-4 font-medium text-gray-900">{t.name}</td>
                    <td className="py-2 pr-4 text-gray-700">{t.type}</td>
                    <td className="py-2 pr-4 text-gray-700">{t.tone}</td>
                    <td className="py-2 pr-4 text-gray-700 max-w-[420px] truncate">
                      {t.subjectTemplate}
                    </td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => onDelete(t._id)}
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

