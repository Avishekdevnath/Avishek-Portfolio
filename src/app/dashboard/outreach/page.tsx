"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface OutreachStats {
  companies: number;
  contacts: number;
  emails: number;
  followUpsDue: number;
}

const emptyStats: OutreachStats = {
  companies: 0,
  contacts: 0,
  emails: 0,
  followUpsDue: 0,
};

export default function OutreachOverviewPage() {
  const [stats, setStats] = useState<OutreachStats>(emptyStats);
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
        setStats(data.data || emptyStats);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load stats");
        setStats(emptyStats);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Outreach</h1>
        <p className="text-gray-600">
          Manual-only outreach tracking with follow-up discipline.
        </p>
      </header>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/dashboard/outreach/companies"
            className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
          >
            <p className="text-sm text-gray-500">Companies</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {stats.companies}
            </p>
          </Link>
          <Link
            href="/dashboard/outreach/contacts"
            className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
          >
            <p className="text-sm text-gray-500">Contacts</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {stats.contacts}
            </p>
          </Link>
          <Link
            href="/dashboard/outreach/log"
            className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
          >
            <p className="text-sm text-gray-500">Emails logged</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {stats.emails}
            </p>
          </Link>
          <Link
            href="/dashboard/outreach/log"
            className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
          >
            <p className="text-sm text-gray-500">Follow-ups due</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {stats.followUpsDue}
            </p>
          </Link>
        </div>
      )}
    </div>
  );
}

