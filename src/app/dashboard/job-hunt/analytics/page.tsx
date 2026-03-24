"use client";

import { useEffect, useState } from 'react';
import type { JobHuntAnalyticsSummary } from '@/types/job-hunt';

interface AnalyticsResponse {
  success: boolean;
  data?: JobHuntAnalyticsSummary;
  error?: string;
}

export default function JobHuntAnalyticsPage() {
  const [data, setData] = useState<JobHuntAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/job-hunt/analytics');
        const result = (await response.json()) as AnalyticsResponse;
        if (!result.success || !result.data) throw new Error(result.error || 'Failed to fetch analytics');
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-6 h-6 border-2 border-[#e8e3db] border-t-[#d4622a] rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (error) {
    return <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>;
  }

  if (!data) {
    return <div className="text-[#8a7a6a]">No analytics data available.</div>;
  }

  const statusEntries = Object.entries(data.statusCounts);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[0.65rem] font-mono tracking-[0.15em] uppercase text-[#8a7a6a]">Analytics</p>
        <h1 className="text-[1.05rem] font-semibold text-[#2a2118] mt-1">Job Hunt Insights</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-[#e8e3db] rounded-xl p-4 shadow-sm">
          <p className="text-[0.65rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a]">Total Applications</p>
          <p className="text-[1.35rem] font-semibold text-[#2a2118] mt-2">{data.totalApplications}</p>
        </div>
        <div className="bg-white border border-[#e8e3db] rounded-xl p-4 shadow-sm">
          <p className="text-[0.65rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a]">Follow-up Soon (7+)</p>
          <p className="text-[1.35rem] font-semibold text-amber-700 mt-2">{data.followUp.dueSoon}</p>
        </div>
        <div className="bg-white border border-[#e8e3db] rounded-xl p-4 shadow-sm">
          <p className="text-[0.65rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a]">Follow-up Overdue (14+)</p>
          <p className="text-[1.35rem] font-semibold text-red-700 mt-2">{data.followUp.overdue}</p>
        </div>
        <div className="bg-white border border-[#e8e3db] rounded-xl p-4 shadow-sm">
          <p className="text-[0.65rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a]">Monthly Offers</p>
          <p className="text-[1.35rem] font-semibold text-green-700 mt-2">{data.monthlySummary.offers}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-[#e8e3db] rounded-xl p-4 shadow-sm">
          <p className="text-[0.72rem] font-medium text-[#4a3728] mb-3">Pipeline Status Distribution</p>
          <div className="space-y-2">
            {statusEntries.map(([status, count]) => {
              const pct = data.totalApplications > 0 ? Math.round((count / data.totalApplications) * 100) : 0;
              return (
                <div key={status}>
                  <div className="flex justify-between text-[0.75rem] text-[#6b5c4e] mb-1">
                    <span>{status}</span>
                    <span>{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-[#f1eee8] rounded-full overflow-hidden">
                    <div className="h-full bg-[#d4622a]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-[#e8e3db] rounded-xl p-4 shadow-sm">
          <p className="text-[0.72rem] font-medium text-[#4a3728] mb-3">Weekly vs Monthly Summary</p>
          <table className="w-full text-[0.78rem]">
            <thead>
              <tr className="text-left text-[#8a7a6a] border-b border-[#eee8de]">
                <th className="py-2">Metric</th>
                <th className="py-2">This Week</th>
                <th className="py-2">This Month</th>
              </tr>
            </thead>
            <tbody className="text-[#4a3728]">
              <tr><td className="py-2">Applications</td><td>{data.weeklySummary.applications}</td><td>{data.monthlySummary.applications}</td></tr>
              <tr><td className="py-2">Responses</td><td>{data.weeklySummary.responses}</td><td>{data.monthlySummary.responses}</td></tr>
              <tr><td className="py-2">Interviews</td><td>{data.weeklySummary.interviews}</td><td>{data.monthlySummary.interviews}</td></tr>
              <tr><td className="py-2">Offers</td><td>{data.weeklySummary.offers}</td><td>{data.monthlySummary.offers}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-[#e8e3db] rounded-xl p-4 shadow-sm">
        <p className="text-[0.72rem] font-medium text-[#4a3728] mb-3">Monthly Response Trend</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-[0.78rem]">
            <thead>
              <tr className="text-left text-[#8a7a6a] border-b border-[#eee8de]">
                <th className="py-2">Month</th>
                <th className="py-2">Applied</th>
                <th className="py-2">Responses</th>
                <th className="py-2">Response Rate</th>
                <th className="py-2">Interviews</th>
                <th className="py-2">Interview Rate</th>
              </tr>
            </thead>
            <tbody className="text-[#4a3728]">
              {data.monthlyResponseRate.length === 0 ? (
                <tr><td colSpan={6} className="py-6 text-center text-[#8a7a6a]">No dated applications yet.</td></tr>
              ) : (
                data.monthlyResponseRate.map((row) => (
                  <tr key={row.month} className="border-b border-[#f4f1ec]">
                    <td className="py-2">{row.month}</td>
                    <td>{row.applied}</td>
                    <td>{row.responses}</td>
                    <td>{row.responseRate}%</td>
                    <td>{row.interviews}</td>
                    <td>{row.interviewRate}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
