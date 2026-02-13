"use client";

import { useEffect, useState } from "react";
import type { OutreachEmail } from "@/types/outreach";

interface FollowUpWithDetails extends OutreachEmail {
  contactName?: string;
  companyName?: string;
}

export default function OutreachFollowUpsPage() {
  const [followUps, setFollowUps] = useState<FollowUpWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);
  const [markingSent, setMarkingSent] = useState<string | null>(null);

  const fetchFollowUps = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/outreach/emails?status=sent&followUpDue=true");
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to fetch follow-ups");
      setFollowUps(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch follow-ups");
      setFollowUps([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const generateFollowUp = async (emailId: string) => {
    setGenerating(emailId);
    setError(null);
    try {
      const res = await fetch("/api/outreach/ai/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to generate follow-up");

      // Open mailto with the generated draft
      const email = followUps.find((e) => e._id === emailId);
      if (email) {
        const mailto = `mailto:${email.contact?.email || ""}?subject=${encodeURIComponent(data.data.subject)}&body=${encodeURIComponent(data.data.body)}`;
        window.open(mailto, "_blank");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate follow-up");
    } finally {
      setGenerating(null);
    }
  };

  const markAsSent = async (emailId: string) => {
    setMarkingSent(emailId);
    setError(null);
    try {
      const res = await fetch(`/api/outreach/emails/${emailId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "sent",
          followUpDate: null, // Clear follow-up date as it was just completed
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to update email");

      await fetchFollowUps();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark as sent");
    } finally {
      setMarkingSent(null);
    }
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isOverdue = (date: string | Date | undefined) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Outreach • Follow-ups</h1>
        <p className="text-gray-600">
          Manage your follow-up schedule and never miss an opportunity.
        </p>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h2 className="font-semibold text-gray-900 mb-3">
          Follow-ups {followUps.length > 0 && `(${followUps.length})`}
        </h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : followUps.length === 0 ? (
          <p className="text-gray-600 py-4">
            No follow-ups due. Check your{" "}
            <a href="/dashboard/outreach/log" className="text-blue-600 hover:underline">
              outreach log
            </a>{" "}
            to schedule new follow-ups.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">Contact</th>
                  <th className="py-2 pr-4">Company</th>
                  <th className="py-2 pr-4">Follow-up Date</th>
                  <th className="py-2 pr-4">Count</th>
                  <th className="py-2 pr-4">Subject</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {followUps.map((email) => (
                  <tr
                    key={email._id}
                    className={`border-b last:border-b-0 ${
                      isOverdue(email.followUpDate) ? "bg-yellow-50" : ""
                    }`}
                  >
                    <td className="py-2 pr-4 font-medium text-gray-900">
                      {email.contact?.name || "-"}
                    </td>
                    <td className="py-2 pr-4 text-gray-700">
                      {email.company?.name || "-"}
                    </td>
                    <td className="py-2 pr-4">
                      <span
                        className={`${
                          isOverdue(email.followUpDate)
                            ? "text-red-600 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        {formatDate(email.followUpDate)}
                        {isOverdue(email.followUpDate) && " (overdue)"}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-gray-700">
                      {email.followUpCount}/2
                    </td>
                    <td className="py-2 pr-4 text-gray-700 max-w-[250px] truncate">
                      {email.subject}
                    </td>
                    <td className="py-2 text-right space-x-2">
                      <button
                        onClick={() => generateFollowUp(email._id)}
                        disabled={generating === email._id}
                        className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs hover:bg-blue-700 disabled:opacity-60"
                      >
                        {generating === email._id ? "Generating..." : "AI Follow-up"}
                      </button>
                      <button
                        onClick={() => markAsSent(email._id)}
                        disabled={markingSent === email._id}
                        className="px-3 py-1 rounded-lg bg-green-600 text-white text-xs hover:bg-green-700 disabled:opacity-60"
                      >
                        {markingSent === email._id ? "Updating..." : "Mark Sent"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-medium text-blue-900 mb-2">Tips for effective follow-ups</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Wait at least 5-7 days before following up</li>
          <li>• Add new value or insight in each follow-up</li>
          <li>• Keep follow-ups brief (100-150 words)</li>
          <li>• Stop after 2 follow-ups if no response</li>
        </ul>
      </div>
    </div>
  );
}
