'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  Users, 
  Eye, 
  ThumbsUp, 
  MessageCircle,
  FileText,
  Briefcase,
  Star,
  TrendingUp,
  Clock
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  blogs: {
    total: number;
    published: number;
    draft: number;
    trending: Array<{title: string; views: number}>;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
  };
  messages: {
    total: number;
    unread: number;
    recent: Array<{
      id: string;
      sender: string;
      subject: string;
      time: string;
      read: boolean;
    }>;
  };
  skills: {
    total: number;
    featured: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    time: string;
    details?: string;
  }>;
}

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  icon: React.ElementType;
  description?: string;
  onClick?: () => void;
}

function StatCard({ title, value, trend, icon: Icon, description, onClick }: StatCardProps) {
  return (
    <div 
      className={`bg-white p-6 rounded-xl shadow-sm transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
      onClick={onClick}
    >
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
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch('/api/stats/dashboard');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Welcome Back, Avishek! 👋</h1>
          <p className="text-gray-600">Here's what's happening with your portfolio.</p>
        </div>
        <Link 
          href="/dashboard/analytics" 
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          View Full Analytics
        </Link>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Blog Posts"
          value={stats?.blogs.total || 0}
          trend={`+${stats?.blogs.published || 0} published`}
          icon={FileText}
          description={`${stats?.blogs.draft || 0} drafts`}
          onClick={() => window.location.href = '/dashboard/posts'}
        />
        <StatCard
          title="Projects"
          value={stats?.projects.total || 0}
          trend={`${stats?.projects.active || 0} active`}
          icon={Briefcase}
          description={`${stats?.projects.completed || 0} completed`}
          onClick={() => window.location.href = '/dashboard/projects'}
        />
        <StatCard
          title="Messages"
          value={stats?.messages.total || 0}
          trend={`${stats?.messages.unread || 0} unread`}
          icon={MessageCircle}
          description="Last 30 days"
          onClick={() => window.location.href = '/dashboard/messages'}
        />
        <StatCard
          title="Skills"
          value={stats?.skills.total || 0}
          trend={`${stats?.skills.featured || 0} featured`}
          icon={Star}
          onClick={() => window.location.href = '/dashboard/skills'}
        />
      </div>

      {/* Trending Content & Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Trending Content</h2>
          <div className="space-y-4">
            {stats?.blogs.trending.map((blog, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-lg font-semibold text-gray-400 mr-3">#{index + 1}</span>
                  <span className="text-sm">{blog.title}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Eye size={16} className="mr-1" />
                  {blog.views}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Recent Messages</h2>
          <div className="space-y-4">
            {stats?.messages.recent.map((message, index) => (
              <Link 
                key={index} 
                href={`/dashboard/messages/${message.id}`}
                className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{message.sender}</p>
                    <p className="text-sm text-gray-600">{message.subject}</p>
                  </div>
                  <div className="flex items-center">
                    {!message.read && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                    )}
                    <span className="text-xs text-gray-500">{message.time}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {stats?.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                {activity.type === 'post' && <FileText size={20} className="text-blue-500" />}
                {activity.type === 'project' && <Briefcase size={20} className="text-blue-500" />}
                {activity.type === 'skill' && <Star size={20} className="text-blue-500" />}
                {activity.type === 'message' && <MessageCircle size={20} className="text-blue-500" />}
              </div>
              <div>
                <p className="font-medium">{activity.title}</p>
                {activity.details && (
                  <p className="text-sm text-gray-600">{activity.details}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}