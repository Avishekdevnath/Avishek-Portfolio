"use client";

import { useEffect, useState } from "react";
import type { OutreachCompany, OutreachContact, OutreachDraft } from "@/types/outreach";

export default function OutreachAIPage() {
  const [companies, setCompanies] = useState<OutreachCompany[]>([]);
  const [contacts, setContacts] = useState<OutreachContact[]>([]);
  const [drafts, setDrafts] = useState<OutreachDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    companyId: "",
    contactId: "",
    jobTitle: "",
    jobDescription: "",
    tone: "professional",
  });

  const [generatedDraft, setGeneratedDraft] = useState<{ subject: string; body: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [companiesRes, contactsRes, draftsRes] = await Promise.all([
        fetch("/api/outreach/companies"),
        fetch("/api/outreach/contacts"),
        fetch("/api/outreach/ai/draft"),
      ]);

      const [companiesData, contactsData, draftsData] = await Promise.all([
        companiesRes.json(),
        contactsRes.json(),
        draftsRes.json(),
      ]);

      if (companiesData.success) setCompanies(companiesData.data || []);
      if (contactsData.success) setContacts(contactsData.data || []);
      if (draftsData.success) setDrafts(draftsData.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCompanyChange = (companyId: string) => {
    setForm((p) => ({ ...p, companyId, contactId: "" }));
  };

  const filteredContacts = contacts.filter((c) => c.companyId === form.companyId);

  const generateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.contactId || !form.companyId || !form.jobTitle) {
      setError("Please fill in all required fields");
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/outreach/ai/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId: form.contactId,
          companyId: form.companyId,
          jobTitle: form.jobTitle,
          jobDescription: form.jobDescription || undefined,
          tone: form.tone,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to generate draft");

      setGeneratedDraft({
        subject: data.data.subject,
        body: data.data.body,
      });

      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate draft");
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const openMailto = (subject: string, body: string) => {
    const contact = contacts.find((c) => c._id === form.contactId);
    const mailto = `mailto:${contact?.email || ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, "_blank");
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Outreach • AI Assistant</h1>
        <p className="text-gray-600">
          Generate AI-assisted email drafts using your portfolio context.
        </p>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generate Draft Form */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h2 className="font-semibold text-gray-900 mb-3">Generate New Draft</h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : (
            <form onSubmit={generateDraft} className="space-y-3">
              <div>
                <label className="text-sm text-gray-700">Company *</label>
                <select
                  value={form.companyId}
                  onChange={(e) => handleCompanyChange(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  required
                >
                  <option value="">Select company</option>
                  {companies.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-700">Contact *</label>
                <select
                  value={form.contactId}
                  onChange={(e) => setForm((p) => ({ ...p, contactId: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  disabled={!form.companyId}
                  required
                >
                  <option value="">Select contact</option>
                  {filteredContacts.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} {c.roleTitle && `(${c.roleTitle})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-700">Job Title *</label>
                <input
                  value={form.jobTitle}
                  onChange={(e) => setForm((p) => ({ ...p, jobTitle: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g., Senior Backend Engineer"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-gray-700">Job Description (optional)</label>
                <textarea
                  value={form.jobDescription}
                  onChange={(e) => setForm((p) => ({ ...p, jobDescription: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[80px] text-sm"
                  placeholder="Paste job description for better context..."
                />
              </div>

              <div>
                <label className="text-sm text-gray-700">Tone</label>
                <select
                  value={form.tone}
                  onChange={(e) => setForm((p) => ({ ...p, tone: e.target.value }))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                >
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {generating ? "Generating..." : "Generate Draft with AI"}
              </button>
            </form>
          )}
        </div>

        {/* Generated Draft */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h2 className="font-semibold text-gray-900 mb-3">Generated Draft</h2>

          {!generatedDraft ? (
            <p className="text-gray-600 py-8 text-center">
              Fill out the form and generate a draft to see it here.
            </p>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Subject</label>
                <div className="flex gap-2">
                  <input
                    value={generatedDraft.subject}
                    onChange={(e) => setGeneratedDraft((p) => p ? { ...p, subject: e.target.value } : null)}
                    className="mt-1 flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(generatedDraft.subject)}
                    className="mt-1 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-500">Body</label>
                <div className="flex gap-2">
                  <textarea
                    value={generatedDraft.body}
                    onChange={(e) => setGeneratedDraft((p) => p ? { ...p, body: e.target.value } : null)}
                    className="mt-1 flex-1 border border-gray-300 rounded-lg px-3 py-2 min-h-[200px] text-sm font-mono"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => copyToClipboard(generatedDraft.body)}
                    className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => openMailto(generatedDraft.subject, generatedDraft.body)}
                    className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm"
                  >
                    Open Email Client
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Draft History */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h2 className="font-semibold text-gray-900 mb-3">Recent Drafts</h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : drafts.length === 0 ? (
          <p className="text-gray-600">No drafts generated yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">Created</th>
                  <th className="py-2 pr-4">Intent</th>
                  <th className="py-2 pr-4">Tone</th>
                  <th className="py-2 pr-4">Subject</th>
                  <th className="py-2">Preview</th>
                </tr>
              </thead>
              <tbody>
                {drafts.slice(0, 10).map((d) => (
                  <tr key={d._id} className="border-b last:border-b-0">
                    <td className="py-2 pr-4 text-gray-700">{formatDate(d.createdAt)}</td>
                    <td className="py-2 pr-4 text-gray-700">{d.intent}</td>
                    <td className="py-2 pr-4 text-gray-700">{d.tone}</td>
                    <td className="py-2 pr-4 text-gray-700 max-w-[200px] truncate">{d.subject}</td>
                    <td className="py-2 text-gray-500 max-w-[300px] truncate">{d.body.substring(0, 100)}...</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <h3 className="font-medium text-yellow-900 mb-2">AI Guidelines</h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Always review AI-generated drafts before sending</li>
          <li>• Personalize the content based on your research</li>
          <li>• AI never sends emails - you always have control</li>
          <li>• Use portfolio projects as evidence, not claims</li>
        </ul>
      </div>
    </div>
  );
}
