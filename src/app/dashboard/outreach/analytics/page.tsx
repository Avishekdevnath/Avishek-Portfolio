"use client";

import { useEffect, useState } from "react";

interface OutreachStats {
  totalSent: number;
  totalReplied: number;
  replyRate: number;
  emailsWithFollowUp: number;
  followUpReplyRate: number;
  byTemplate: Record<string, { sent: number; replied: number; rate: number }>;
  byCompany: Record<string, { name: string; sent: number; replied: number; rate: number }>;
  recentEmails: Array<{
    _id: string;
    subject: string;
    status: string;
    sentAt: string;
    contactName: string;
    companyName: string;
  }>;
}

export default function OutreachAnalyticsPage() {
  const [stats, setStats] = useState<OutreachStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/outreach/stats");
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Failed to load stats");

        // Transform stats for analytics
        const emails = data.data?.emailsList || [];
        const templates = data.data?.templates || [];
        const companies = data.data?.companiesList || [];

        // Calculate metrics
        const totalSent = emails.filter((e: any) => e.status === "sent").length;
        const totalReplied = emails.filter((e: any) => e.status === "replied").length;
        const replyRate = totalSent > 0 ? (totalReplied / totalSent) * 100 : 0;

        const emailsWithFollowUp = emails.filter((e: any) => e.followUpCount > 0).length;
        const followUpReplied = emails.filter((e: any) => e.followUpCount > 0 && e.status === "replied").length;
        const followUpReplyRate = emailsWithFollowUp > 0 ? (followUpReplied / emailsWithFollowUp) * 100 : 0;

        // By template
        const byTemplate: Record<string, { sent: number; replied: number; rate: number }> = {};
        templates.forEach((t: any) => {
          const templateEmails = emails.filter((e: any) => e.templateId === t._id);
          const sent = templateEmails.length;
          const replied = templateEmails.filter((e: any) => e.status === "replied").length;
          byTemplate[t.name] = {
            sent,
            replied,
            rate: sent > 0 ? (replied / sent) * 100 : 0,
          };
        });

        // By company
        const byCompany: Record<string, { name: string; sent: number; replied: number; rate: number }> = {};
        companies.forEach((c: any) => {
          const companyEmails = emails.filter((e: any) => e.companyId === c._id);
          const sent = companyEmails.length;
          const replied = companyEmails.filter((e: any) => e.status === "replied").length;
          byCompany[c._id] = {
            name: c.name,
            sent,
            replied,
            rate: sent > 0 ? (replied / sent) * 100 : 0,
          };
        });

        // Recent emails
        const recentEmails = emails
          .sort((a: any, b: any) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
          .slice(0, 10)
          .map((e: any) => ({
            _id: e._id,
            subject: e.subject,
            status: e.status,
            sentAt: e.sentAt,
            contactName: e.contact?.name || "-",
            companyName: e.company?.name || "-",
          }));

        setStats({
          totalSent,
          totalReplied,
          replyRate,
          emailsWithFollowUp,
          followUpReplyRate,
          byTemplate,
          byCompany,
          recentEmails,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "replied":
        return "text-green-600 bg-green-50";
      case "sent":
        return "text-blue-600 bg-blue-50";
      case "no_response":
        return "text-gray-600 bg-gray-50";
      case "closed":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Outreach • Analytics</h1>
        <p className="text-gray-600">
          Track your outreach performance and optimize your strategy.
        </p>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : !stats ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-yellow-800">
            No outreach data yet. Start logging your emails to see analytics.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-sm text-gray-500">Total Sent</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.totalSent}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-sm text-gray-500">Replies</p>
              <p className="text-2xl font-semibold text-green-600 mt-1">{stats.totalReplied}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-sm text-gray-500">Reply Rate</p>
              <p className="text-2xl font-semibold text-blue-600 mt-1">{stats.replyRate.toFixed(1)}%</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-sm text-gray-500">Follow-up Effectiveness</p>
              <p className="text-2xl font-semibold text-purple-600 mt-1">{stats.followUpReplyRate.toFixed(1)}%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By Template */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h2 className="font-semibold text-gray-900 mb-3">Performance by Template</h2>

              {Object.keys(stats.byTemplate).length === 0 ? (
                <p className="text-gray-600">No template data yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th className="py-2 pr-4">Template</th>
                        <th className="py-2 pr-4">Sent</th>
                        <th className="py-2 pr-4">Replied</th>
                        <th className="py-2 text-right">Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(stats.byTemplate).map(([name, data]) => (
                        <tr key={name} className="border-b last:border-b-0">
                          <td className="py-2 pr-4 font-medium text-gray-900">{name}</td>
                          <td className="py-2 pr-4 text-gray-700">{data.sent}</td>
                          <td className="py-2 pr-4 text-gray-700">{data.replied}</td>
                          <td className="py-2 text-right text-gray-700">{data.rate.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* By Company */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h2 className="font-semibold text-gray-900 mb-3">Performance by Company</h2>

              {Object.keys(stats.byCompany).length === 0 ? (
                <p className="text-gray-600">No company data yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th className="py-2 pr-4">Company</th>
                        <th className="py-2 pr-4">Sent</th>
                        <th className="py-2 pr-4">Replied</th>
                        <th className="py-2 text-right">Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(stats.byCompany)
                        .sort((a, b) => b[1].sent - a[1].sent)
                        .slice(0, 10)
                        .map(([id, data]) => (
                          <tr key={id} className="border-b last:border-b-0">
                            <td className="py-2 pr-4 font-medium text-gray-900">{data.name}</td>
                            <td className="py-2 pr-4 text-gray-700">{data.sent}</td>
                            <td className="py-2 pr-4 text-gray-700">{data.replied}</td>
                            <td className="py-2 text-right text-gray-700">{data.rate.toFixed(1)}%</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h2 className="font-semibold text-gray-900 mb-3">Recent Outreach</h2>

            {stats.recentEmails.length === 0 ? (
              <p className="text-gray-600">No outreach activity yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Contact</th>
                      <th className="py-2 pr-4">Company</th>
                      <th className="py-2 pr-4">Subject</th>
                      <th className="py-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentEmails.map((email) => (
                      <tr key={email._id} className="border-b last:border-b-0">
                        <td className="py-2 pr-4 text-gray-700">{formatDate(email.sentAt)}</td>
                        <td className="py-2 pr-4 font-medium text-gray-900">{email.contactName}</td>
                        <td className="py-2 pr-4 text-gray-700">{email.companyName}</td>
                        <td className="py-2 pr-4 text-gray-700 max-w-[200px] truncate">{email.subject}</td>
                        <td className="py-2 text-right">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(email.status)}`}
                          >
                            {email.status.replace("_", " ")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-medium text-blue-900 mb-2">Analytics Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Reply rate above 20% is considered good for cold outreach</li>
          <li>• Track which templates perform best and use them more</li>
          <li>• Follow-ups can increase response rates by 10-15%</li>
          <li>• Focus on companies with higher reply rates for better ROI</li>
        </ul>
      </div>
    </div>
  );
}
