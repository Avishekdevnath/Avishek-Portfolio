"use client";

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DailyStats {
  date: string;
  views: number;
  uniqueVisitors: number;
  avgTimeSpent: number;
  likes: number;
  shares: number;
}

interface BlogStatsProps {
  slug: string;
}

export default function BlogStats({ slug }: BlogStatsProps) {
  const [stats, setStats] = useState<{
    views: number;
    likes: number;
    shares: number;
    dailyStats: DailyStats[];
  }>({
    views: 0,
    likes: 0,
    shares: 0,
    dailyStats: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('7d'); // '7d', '30d', 'all'

  useEffect(() => {
    fetchStats();
  }, [slug]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/blogs/${slug}/stats`);
      const data = await response.json();
      if (data.success) {
        // Format dates and sort by date
        const formattedStats = {
          ...data.data,
          dailyStats: data.data.dailyStats.map((stat: any) => ({
            ...stat,
            date: new Date(stat.date).toLocaleDateString(),
          })).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        };
        setStats(formattedStats);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      // Error fetching stats
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredStats = () => {
    if (timeRange === 'all') return stats.dailyStats;

    const days = timeRange === '7d' ? 7 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return stats.dailyStats.filter(stat => 
      new Date(stat.date) >= cutoff
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading statistics...</div>;
  }

  if (error) {
    return <div className="text-red-500 py-4">{error}</div>;
  }

  const filteredStats = getFilteredStats();

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-gray-500 text-sm">Total Views</h4>
          <p className="text-2xl font-bold">{stats.views}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-gray-500 text-sm">Total Likes</h4>
          <p className="text-2xl font-bold">{stats.likes}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-gray-500 text-sm">Total Shares</h4>
          <p className="text-2xl font-bold">{stats.shares}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h4 className="text-gray-500 text-sm">Avg. Time Spent</h4>
          <p className="text-2xl font-bold">
            {Math.round(
              filteredStats.reduce((acc, curr) => acc + curr.avgTimeSpent, 0) /
                filteredStats.length
            )}s
          </p>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => setTimeRange('7d')}
          className={`px-3 py-1 rounded ${
            timeRange === '7d'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          7 Days
        </button>
        <button
          onClick={() => setTimeRange('30d')}
          className={`px-3 py-1 rounded ${
            timeRange === '30d'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          30 Days
        </button>
        <button
          onClick={() => setTimeRange('all')}
          className={`px-3 py-1 rounded ${
            timeRange === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          All Time
        </button>
      </div>

      {/* Views and Visitors Chart */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Views & Unique Visitors</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#2563eb"
                name="Total Views"
              />
              <Line
                type="monotone"
                dataKey="uniqueVisitors"
                stroke="#16a34a"
                name="Unique Visitors"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Engagement Chart */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Engagement Metrics</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="likes" fill="#2563eb" name="Likes" />
              <Bar dataKey="shares" fill="#16a34a" name="Shares" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
} 