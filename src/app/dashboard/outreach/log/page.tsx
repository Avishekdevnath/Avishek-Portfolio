"use client";

import { useEffect, useMemo, useState } from "react";
import type { OutreachContact, OutreachEmail, OutreachTemplate } from "@/types/outreach";
import { extractVariables, replaceVariables, getUnfilledVariables } from "@/lib/outreach-template";

type EmailRow = OutreachEmail & {
  company?: { _id: string; name: string };
  contact?: { _id: string; name: string; email?: string };
  template?: { _id: string; name: string; type: string; tone: string };
};

function formatDate(date: string | Date | undefined) {
  if (!date) return "—";
  const dt = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

export default function OutreachLogPage() {
  const [contacts, setContacts] = useState<OutreachContact[]>([]);
  const [templates, setTemplates] = useState<OutreachTemplate[]>([]);
  const [emails, setEmails] = useState<EmailRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    contactId: "",
    templateId: "",
    subject: "",
    body: "",
    sentAt: new Date().toISOString().slice(0, 10),
    followUpDate: "",
  });
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [unfilledVariables, setUnfilledVariables] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [contactsRes, templatesRes, emailsRes] = await Promise.all([
        fetch("/api/outreach/contacts"),
        fetch("/api/outreach/templates"),
        fetch("/api/outreach/emails"),
      ]);

      const [contactsData, templatesData, emailsData] = await Promise.all([
        contactsRes.json(),
        templatesRes.json(),
        emailsRes.json(),
      ]);

      if (!contactsData.success) throw new Error(contactsData.error || "Failed to fetch contacts");
      if (!templatesData.success) throw new Error(templatesData.error || "Failed to fetch templates");
      if (!emailsData.success) throw new Error(emailsData.error || "Failed to fetch emails");

      setContacts(contactsData.data || []);
      setTemplates(templatesData.data || []);
      setEmails(emailsData.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
      setContacts([]);
      setTemplates([]);
      setEmails([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t._id === templateId);
    setForm((p) => ({ ...p, templateId }));

    if (template) {
      // Extract variables from template
      const subjectVars = extractVariables(template.subjectTemplate);
      const bodyVars = extractVariables(template.bodyTemplate);
      const allVars = [...new Set([...subjectVars, ...bodyVars])];
      
      // Auto-fill known variables from contact
      const contact = contacts.find(c => c._id === form.contactId);
      const autoValues: Record<string, string> = {};
      
      allVars.forEach(v => {
        const key = v.replace(/[{}]/g, '').toLowerCase();
        
        if (contact) {
          if (key === 'name') autoValues[v] = contact.name;
          if (key === 'first_name') autoValues[v] = contact.name.split(' ')[0];
          if (key === 'email') autoValues[v] = contact.email;
          if (key === 'role_title' && contact.roleTitle) autoValues[v] = contact.roleTitle;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const company = (contact as any).company;
          if (key === 'company' && company?.name) autoValues[v] = company.name;
          if (key === 'company_country' && company?.country) autoValues[v] = company.country;
        }
      });

      setVariableValues(autoValues);
      
      // Apply variables to template
      const filledSubject = replaceVariables(template.subjectTemplate, autoValues);
      const filledBody = replaceVariables(template.bodyTemplate, autoValues);
      
      setForm((p) => ({
        ...p,
        subject: filledSubject,
        body: filledBody,
      }));
      
      // Check for unfilled variables
      const unfilled = getUnfilledVariables(template.subjectTemplate + template.bodyTemplate, autoValues);
      setUnfilledVariables(unfilled);
    } else {
      setVariableValues({});
      setUnfilledVariables([]);
    }
  };

  const sortedEmails = useMemo(() => {
    return [...emails].sort((a, b) => {
      const at = new Date(a.sentAt as any).getTime();
      const bt = new Date(b.sentAt as any).getTime();
      return bt - at;
    });
  }, [emails]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/outreach/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId: form.contactId,
          templateId: form.templateId || undefined,
          subject: form.subject,
          body: form.body,
          sentAt: form.sentAt ? new Date(form.sentAt).toISOString() : undefined,
          followUpDate: form.followUpDate ? new Date(form.followUpDate).toISOString() : undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to create outreach email");

      setForm((p) => ({
        ...p,
        templateId: "",
        subject: "",
        body: "",
        followUpDate: "",
      }));
      await fetchAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create outreach email");
    } finally {
      setSaving(false);
    }
  };

  const patchEmail = async (id: string, payload: Record<string, any>) => {
    setError(null);
    try {
      const res = await fetch(`/api/outreach/emails/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to update");
      await fetchAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this log entry?")) return;
    setError(null);
    try {
      const res = await fetch(`/api/outreach/emails/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to delete");
      await fetchAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const handleSendEmail = async () => {
    if (!form.contactId || !form.subject || !form.body) {
      setError("Please fill in all fields before sending");
      return;
    }

    if (unfilledVariables.length > 0 && !confirm(`There are ${unfilledVariables.length} unfilled variables. Send anyway?`)) {
      return;
    }

    const contact = contacts.find(c => c._id === form.contactId);
    if (!contact?.email) {
      setError("Contact has no email address");
      return;
    }

    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/outreach/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: contact.email,
          toName: contact.name,
          subject: form.subject,
          body: form.body,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to send email");

      alert("Email sent successfully!");
      
      // Auto-log the email
      await onSubmit(new Event("submit") as any);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Outreach • Log</h1>
        <p className="text-gray-600">Log what you sent (manual send only).</p>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h2 className="font-semibold text-gray-900 mb-3">Log a sent email</h2>
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className="text-sm text-gray-700">Contact</label>
            <select
              value={form.contactId}
              onChange={(e) => setForm((p) => ({ ...p, contactId: e.target.value }))}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
              required
            >
              <option value="" disabled>
                Select contact
              </option>
              {contacts.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.company?.name || "company"})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-gray-700">Template (optional)</label>
            <select
              value={form.templateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
            >
              <option value="">No template</option>
              {templates.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.type}/{t.tone})
                </option>
              ))}
            </select>
          </div>

          {/* Variable Inputs - Show when template has variables */}
          {form.templateId && Object.keys(variableValues).length > 0 && (
            <div className="md:col-span-2 bg-gray-50 rounded-lg p-3 space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Template Variables
                {unfilledVariables.length > 0 && (
                  <span className="ml-2 text-amber-600">
                    ({unfilledVariables.length} unfilled)
                  </span>
                )}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(variableValues).map(([varName, value]) => (
                  <div key={varName}>
                    <span className="text-xs text-gray-500 font-mono">{varName}</span>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => {
                        const newValues = { ...variableValues, [varName]: e.target.value };
                        setVariableValues(newValues);
                        
                        // Re-apply to subject/body
                        const template = templates.find(t => t._id === form.templateId);
                        if (template) {
                          setForm((p) => ({
                            ...p,
                            subject: replaceVariables(template.subjectTemplate, newValues),
                            body: replaceVariables(template.bodyTemplate, newValues),
                          }));
                        }
                        
                        // Update unfilled
                        const tpl = templates.find(t => t._id === form.templateId);
                        const templateText = (tpl?.subjectTemplate || '') + (tpl?.bodyTemplate || '');
                        setUnfilledVariables(getUnfilledVariables(templateText, newValues));
                      }}
                      className="mt-1 w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      placeholder={varName}
                    />
                  </div>
                ))}
              </div>
              {unfilledVariables.length > 0 && (
                <p className="text-xs text-amber-600">
                  Missing: {unfilledVariables.map(v => v.replace(/[{}]/g, '')).join(', ')}
                </p>
              )}
            </div>
          )}

          <div className="md:col-span-2">
            <label className="text-sm text-gray-700">Subject</label>
            <input
              value={form.subject}
              onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-gray-700">Body</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[140px]"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-700">Sent at</label>
            <input
              value={form.sentAt}
              onChange={(e) => setForm((p) => ({ ...p, sentAt: e.target.value }))}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              type="date"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-700">Follow-up date (optional)</label>
            <input
              value={form.followUpDate}
              onChange={(e) => setForm((p) => ({ ...p, followUpDate: e.target.value }))}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              type="date"
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleSendEmail}
              disabled={sending || !form.contactId}
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
            >
              {sending ? "Sending..." : "Send Email"}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Add to log"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h2 className="font-semibold text-gray-900 mb-3">Outreach emails</h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : sortedEmails.length === 0 ? (
          <p className="text-gray-600">No outreach emails logged yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">Sent</th>
                  <th className="py-2 pr-4">Contact</th>
                  <th className="py-2 pr-4">Company</th>
                  <th className="py-2 pr-4">Subject</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Follow-up</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedEmails.map((e) => (
                  <tr key={e._id} className="border-b last:border-b-0">
                    <td className="py-2 pr-4 text-gray-700">{formatDate(e.sentAt)}</td>
                    <td className="py-2 pr-4 text-gray-900 font-medium">{e.contact?.name || "—"}</td>
                    <td className="py-2 pr-4 text-gray-700">{e.company?.name || "—"}</td>
                    <td className="py-2 pr-4 text-gray-700 max-w-[420px] truncate">{e.subject}</td>
                    <td className="py-2 pr-4">
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs">
                        {e.status}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-gray-700">
                      {formatDate(e.followUpDate)}{" "}
                      {typeof e.followUpCount === "number" ? (
                        <span className="text-xs text-gray-500">({e.followUpCount}/2)</span>
                      ) : null}
                    </td>
                    <td className="py-2 text-right space-x-3">
                      {e.status !== "replied" && (
                        <button
                          onClick={() => patchEmail(e._id, { status: "replied" })}
                          className="text-green-700 hover:text-green-800"
                        >
                          Mark replied
                        </button>
                      )}
                      {e.status !== "closed" && (
                        <button
                          onClick={() => patchEmail(e._id, { status: "closed" })}
                          className="text-gray-700 hover:text-gray-900"
                        >
                          Close
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(e._id)}
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

