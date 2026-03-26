'use client';

import { useState, useEffect, useCallback } from 'react';

interface TrafficSummary {
  totalViews: number;
  humanViews: number;
  botViews: number;
  topPages: Array<{ path: string; views: number; humanViews: number }>;
  topReferrers: Array<{ referer: string; views: number }>;
  topCountries: Array<{ country: string; views: number }>;
  dailyTrend: Array<{ date: string; humanViews: number; botViews: number }>;
}

const EMPTY: TrafficSummary = {
  totalViews: 0,
  humanViews: 0,
  botViews: 0,
  topPages: [],
  topReferrers: [],
  topCountries: [],
  dailyTrend: [],
};

export default function AnalyticsPage() {
  const [range, setRange] = useState('7d');
  const [data, setData] = useState<TrafficSummary>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch(`/api/track/summary?range=${range}`);
      const json = await res.json();
      if (json.success) setData(json.data as TrafficSummary);
      else setData(EMPTY);
    } catch {
      setData(EMPTY);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [range]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#8a7a6a] font-mono">Traffic</p>
          <h1 className="text-2xl font-semibold text-[#2a2118] mt-1">Analytics</h1>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="rounded-md border border-[#d8d0c5] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#d4622a]/30"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing || loading}
            title="Refresh data"
            className="rounded-md border border-[#d8d0c5] px-3 py-2 text-sm text-[#6b5c4e] hover:bg-[#f3ede4] disabled:opacity-40 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={refreshing ? 'animate-spin' : ''}
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 16h5v5" />
            </svg>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-[#e8e3db] bg-white p-8 text-sm text-[#6b5c4e]">
          Loading traffic data...
        </div>
      ) : (
        <>
          {/* Summary strip */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Total Views',    value: data.totalViews },
              { label: 'Human Visitors', value: data.humanViews },
              { label: 'Bot Traffic',    value: data.botViews   },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-[#e8e3db] bg-white p-5">
                <p className="text-xs text-[#8a7a6a] uppercase tracking-wide">{label}</p>
                <p className="text-3xl font-semibold text-[#2a2118] mt-1">{value.toLocaleString()}</p>
              </div>
            ))}
          </div>

          {/* Top Pages */}
          <div className="rounded-xl border border-[#e8e3db] bg-white p-5">
            <h2 className="text-base font-semibold text-[#2a2118] mb-3">Top Pages</h2>
            {data.topPages.length === 0 ? (
              <p className="text-sm text-[#6b5c4e]">No data yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-[#8a7a6a] uppercase tracking-wide border-b border-[#e8e3db]">
                    <th className="pb-2 font-medium">Path</th>
                    <th className="pb-2 font-medium text-right">Total</th>
                    <th className="pb-2 font-medium text-right">Human</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topPages.map((p) => (
                    <tr key={p.path} className="border-b border-[#f3ede4] last:border-0">
                      <td className="py-2 text-[#2a2118] font-mono text-xs">{p.path}</td>
                      <td className="py-2 text-right text-[#4b3a2d]">{p.views}</td>
                      <td className="py-2 text-right text-[#4b3a2d]">{p.humanViews}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Top Referrers + Top Countries */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-[#e8e3db] bg-white p-5">
              <h2 className="text-base font-semibold text-[#2a2118] mb-3">Top Referrers</h2>
              {data.topReferrers.length === 0 ? (
                <p className="text-sm text-[#6b5c4e]">No referrer data yet.</p>
              ) : (
                <ul className="space-y-1.5">
                  {data.topReferrers.map((r) => (
                    <li key={r.referer} className="flex justify-between text-sm">
                      <span className="text-[#2a2118]">{r.referer}</span>
                      <span className="text-[#6b5c4e]">{r.views}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-xl border border-[#e8e3db] bg-white p-5">
              <h2 className="text-base font-semibold text-[#2a2118] mb-3">Top Countries</h2>
              {data.topCountries.length === 0 ? (
                <p className="text-sm text-[#6b5c4e]">No country data yet.</p>
              ) : (
                <ul className="space-y-1.5">
                  {data.topCountries.map((c) => (
                    <li key={c.country} className="flex justify-between text-sm">
                      <span className="text-[#2a2118]">{c.country}</span>
                      <span className="text-[#6b5c4e]">{c.views}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Daily Trend */}
          <div className="rounded-xl border border-[#e8e3db] bg-white p-5">
            <h2 className="text-base font-semibold text-[#2a2118] mb-3">Daily Trend</h2>
            {data.dailyTrend.length === 0 ? (
              <p className="text-sm text-[#6b5c4e]">No data yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-[#8a7a6a] uppercase tracking-wide border-b border-[#e8e3db]">
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium text-right">Human</th>
                    <th className="pb-2 font-medium text-right">Bot</th>
                  </tr>
                </thead>
                <tbody>
                  {data.dailyTrend.map((d) => (
                    <tr key={d.date} className="border-b border-[#f3ede4] last:border-0">
                      <td className="py-2 text-[#2a2118] font-mono text-xs">{d.date}</td>
                      <td className="py-2 text-right text-[#4b3a2d]">{d.humanViews}</td>
                      <td className="py-2 text-right text-[#4b3a2d]">{d.botViews}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
