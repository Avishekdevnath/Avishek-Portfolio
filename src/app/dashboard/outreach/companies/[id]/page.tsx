"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { OutreachCompany, OutreachContact, OutreachEmail } from "@/types/outreach";

function formatDate(date: string | Date | undefined) {
  if (!date) return "—";
  const dt = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

type CompanyWithContacts = OutreachCompany & {
  contacts?: Array<OutreachContact & { emails?: OutreachEmail[] }>;
};

export default function CompanyDetailPage({ params }: { params: { id: string } }) {
  const [company, setCompany] = useState<CompanyWithContacts | null>(null);
  const [contacts, setContacts] = useState<OutreachContact[]>([]);
  const [emails, setEmails] = useState<OutreachEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"contacts" | "emails">("contacts");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch company
      const companyRes = await fetch(`/api/outreach/companies/${params.id}`);
      const companyData = await companyRes.json();
      if (!companyData.success) throw new Error(companyData.error || "Failed to fetch company");
      setCompany(companyData.data);

      // Fetch all contacts
      const contactsRes = await fetch("/api/outreach/contacts");
      const contactsData = await contactsRes.json();
      if (!contactsData.success) throw new Error(contactsData.error || "Failed to fetch contacts");
      
      // Filter contacts for this company by name matching
      const allContacts = contactsData.data || [];
      const companyContacts = allContacts.filter((c: OutreachContact) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cCompany = (c as any).company;
        if (cCompany?._id === params.id) return true;
        if (typeof cCompany === "string" && cCompany === params.id) return true;
        return false;
      });
      setContacts(companyContacts);

      // Fetch emails
      const emailsRes = await fetch("/api/outreach/emails");
      const emailsData = await emailsRes.json();
      if (!emailsData.success) throw new Error(emailsData.error || "Failed to fetch emails");
      
      // Filter emails for company's contacts
      const allEmails = emailsData.data || [];
      const contactIds = companyContacts.map((c: OutreachContact) => c._id);
      const companyEmails = allEmails.filter((e: OutreachEmail) => 
        contactIds.includes(e.contactId)
      );
      setEmails(companyEmails);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/outreach/companies" className="text-blue-600 hover:underline">
            ← Back to Companies
          </Link>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error || "Company not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/outreach/companies" className="text-blue-600 hover:underline">
            ← Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
            <p className="text-gray-600">{company.country}</p>
          </div>
        </div>
        <Link
          href={`/dashboard/outreach/log?companyId=${company._id}`}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          Log Email
        </Link>
      </div>

      {/* Company Details */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Company Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {company.website && (
            <div>
              <label className="text-sm text-gray-500">Website</label>
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline block"
              >
                {company.website}
              </a>
            </div>
          )}
          {company.careerPageUrl && (
            <div>
              <label className="text-sm text-gray-500">Career Page</label>
              <a
                href={company.careerPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline block"
              >
                {company.careerPageUrl}
              </a>
            </div>
          )}
          <div>
            <label className="text-sm text-gray-500">Country</label>
            <p className="text-gray-900">{company.country || "—"}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Tags</label>
            <div className="flex flex-wrap gap-1 mt-1">
              {(company.tags || []).length > 0 ? (
                (company.tags || []).map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-sm">
                    {t}
                  </span>
                ))
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </div>
          </div>
        </div>
        {company.notes && (
          <div className="mt-4">
            <label className="text-sm text-gray-500">Notes</label>
            <p className="text-gray-900 mt-1">{company.notes}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("contacts")}
            className={`px-6 py-3 font-medium ${
              activeTab === "contacts"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Contacts ({contacts.length})
          </button>
          <button
            onClick={() => setActiveTab("emails")}
            className={`px-6 py-3 font-medium ${
              activeTab === "emails"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Emails ({emails.length})
          </button>
        </div>

        {/* Contacts Tab */}
        {activeTab === "contacts" && (
          <div className="p-4">
            {contacts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No contacts for this company.</p>
                <Link
                  href="/dashboard/outreach/contacts"
                  className="text-blue-600 hover:underline mt-2 inline-block"
                >
                  Add contacts →
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-2 pr-4">Name</th>
                      <th className="py-2 pr-4">Email</th>
                      <th className="py-2 pr-4">Role</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((c) => (
                      <tr key={c._id} className="border-b last:border-b-0">
                        <td className="py-2 pr-4 font-medium text-gray-900">{c.name}</td>
                        <td className="py-2 pr-4">{c.email || "—"}</td>
                        <td className="py-2 pr-4">{c.roleTitle || "—"}</td>
                        <td className="py-2 pr-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            c.status === "contacted"
                              ? "bg-green-100 text-green-700"
                              : c.status === "replied"
                              ? "bg-blue-100 text-blue-700"
                              : c.status === "closed"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-gray-50 text-gray-600"
                          }`}>
                            {c.status || "new"}
                          </span>
                        </td>
                        <td className="py-2 text-right">
                          <Link
                            href={`/dashboard/outreach/log?contactId=${c._id}`}
                            className="text-blue-600 hover:text-blue-700 mr-3"
                          >
                            Email
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Emails Tab */}
        {activeTab === "emails" && (
          <div className="p-4">
            {emails.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No emails logged for this company.</p>
                <Link
                  href={`/dashboard/outreach/log?companyId=${company._id}`}
                  className="text-blue-600 hover:underline mt-2 inline-block"
                >
                  Log an email →
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Subject</th>
                      <th className="py-2 pr-4">Contact</th>
                      <th className="py-2 pr-4">Follow-up</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emails.map((e) => (
                      <tr key={e._id} className="border-b last:border-b-0">
                        <td className="py-2 pr-4">{formatDate(e.sentAt)}</td>
                        <td className="py-2 pr-4 font-medium text-gray-900">{e.subject}</td>
                        <td className="py-2 pr-4">
                          {contacts.find(c => c._id === e.contactId)?.name || "—"}
                        </td>
                        <td className="py-2 pr-4">
                          {e.followUpDate ? (
                            <span className="text-amber-600">{formatDate(e.followUpDate)}</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
