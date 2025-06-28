'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart, 
  LineChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { 
  Users, 
  Eye, 
  ThumbsUp, 
  Share2, 
  Clock, 
  TrendingUp,
  Globe,
  MessageCircle
} from 'lucide-react';

interface AnalyticsSummary {
  totalViews: number;
  uniqueVisitors: number;
  avgTimeSpent: number;
  totalLikes: number;
  totalShares: number;
  topBlogs: Array<{title: string; views: number}>;
  viewsByCountry: Array<{country: string; views: number}>;
  dailyStats: Array<{
    date: string;
    views: number;
    visitors: number;
    likes: number;
  }>;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: string;
  icon: React.ElementType;
  description?: string;
}

const MetricCard = ({ title, value, trend, icon: Icon, description }: MetricCardProps) => (
  <div className="bg-white p-6 rounded-xl shadow-sm">
    <div className="flex justify-between items-start">
      <div>
        <div className="flex items-center">
          <Icon size={20} className="text-blue-500 mr-2" />
          <p className="text-sm text-gray-500">{title}</p>
        </div>
        <h3 className="text-2xl font-semibold mt-2">{value}</h3>
        {trend && (
          <p className={`text-sm flex items-center mt-2 ${trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
            <TrendingUp size={16} className="mr-1" />
            {trend}
          </p>
        )}
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  </div>
);

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`/api/stats?range=${timeRange}`);
        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  if (isLoading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <select 
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="border rounded-md p-2"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Views"
          value={analytics?.totalViews || 0}
          trend="+12.3% vs last period"
          icon={Eye}
          description="Total page views across all content"
        />
        <MetricCard
          title="Unique Visitors"
          value={analytics?.uniqueVisitors || 0}
          trend="+5.8% vs last period"
          icon={Users}
          description="Number of unique visitors"
        />
        <MetricCard
          title="Avg. Time Spent"
          value={`${analytics?.avgTimeSpent || 0}m`}
          trend="+2.1% vs last period"
          icon={Clock}
          description="Average time spent per session"
        />
        <MetricCard
          title="Engagement Rate"
          value="68%"
          trend="+8.4% vs last period"
          icon={ThumbsUp}
          description="Likes and shares per view"
        />
      </div>

      {/* Traffic Overview */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Traffic Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analytics?.dailyStats || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="views" stroke="#2563eb" name="Views" />
            <Line type="monotone" dataKey="visitors" stroke="#16a34a" name="Visitors" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Content Performance & Geographic Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Top Performing Content</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics?.topBlogs || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="title" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="views" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Geographic Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics?.viewsByCountry || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="country" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="views" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Key Insights</h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <TrendingUp className="text-green-500" />
            <div>
              <h3 className="font-medium">Growing Engagement</h3>
              <p className="text-sm text-gray-600">Your blog posts are receiving 23% more engagement compared to last month. Consider creating more content in similar topics.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Globe className="text-blue-500" />
            <div>
              <h3 className="font-medium">International Reach</h3>
              <p className="text-sm text-gray-600">Your content is gaining traction in new regions. Consider creating content in multiple languages to expand reach.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Clock className="text-purple-500" />
            <div>
              <h3 className="font-medium">Peak Traffic Times</h3>
              <p className="text-sm text-gray-600">Your content receives most engagement between 2 PM and 6 PM UTC. Consider scheduling new posts during these hours.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}