'use client';

import { useState, useEffect } from 'react';
import { 
  Eye, 
  MessageCircle,
  FileText,
  Briefcase,
  Star,
  TrendingUp
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
    published: number;
    draft: number;
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

// Default stats structure to prevent undefined errors
const defaultStats: DashboardStats = {
  blogs: { total: 0, published: 0, draft: 0, trending: [] },
  projects: { total: 0, published: 0, draft: 0 },
  messages: { total: 0, unread: 0, recent: [] },
  skills: { total: 0, featured: 0 },
  recentActivity: []
};

// Helper function to format time ago
function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
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
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch('/api/stats/dashboard');
        const data = await response.json();
        
        // Check if response is successful and has expected structure
        if (response.ok && data && data.blogs && data.projects && data.messages && data.skills) {
          // Transform message data from API format to frontend format
          const transformedMessages = {
            ...data.messages,
            recent: (data.messages.recent || []).map((msg: any, index: number) => ({
              id: msg._id || `msg-${index}`,
              sender: msg.sender || 'Unknown',
              subject: msg.subject || 'No subject',
              time: msg.createdAt ? formatTimeAgo(msg.createdAt) : 'Unknown',
              read: false // API returns only unread messages, so all are unread
            }))
          };

          // Transform recentActivity data
          const transformedActivity = (data.recentActivity || []).map((activity: any, index: number) => ({
            id: activity._id || `activity-${index}`,
            type: activity.type || 'info',
            title: activity.title || 'Activity',
            time: activity.createdAt ? formatTimeAgo(activity.createdAt) : 'Unknown',
            details: activity.message || activity.details
          }));

          setStats({
            blogs: data.blogs || defaultStats.blogs,
            projects: data.projects || defaultStats.projects,
            messages: transformedMessages,
            skills: data.skills || defaultStats.skills,
            recentActivity: transformedActivity
          });
        } else {
          // API returned error or invalid structure, use defaults
          console.error('Invalid API response structure:', data);
          setStats(defaultStats);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setStats(defaultStats);
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
          value={stats?.blogs?.total ?? 0}
          trend={`+${stats?.blogs?.published ?? 0} published`}
          icon={FileText}
          description={`${stats?.blogs?.draft ?? 0} drafts`}
          onClick={() => window.location.href = '/dashboard/posts'}
        />
        <StatCard
          title="Projects"
          value={stats?.projects?.total ?? 0}
          trend={`${stats?.projects?.published ?? 0} published`}
          icon={Briefcase}
          description={`${stats?.projects?.draft ?? 0} drafts`}
          onClick={() => window.location.href = '/dashboard/projects'}
        />
        <StatCard
          title="Messages"
          value={stats?.messages?.total ?? 0}
          trend={`${stats?.messages?.unread ?? 0} unread`}
          icon={MessageCircle}
          description="Last 30 days"
          onClick={() => window.location.href = '/dashboard/messages'}
        />
        <StatCard
          title="Skills"
          value={stats?.skills?.total ?? 0}
          trend={`${stats?.skills?.featured ?? 0} featured`}
          icon={Star}
          onClick={() => window.location.href = '/dashboard/skills'}
        />
      </div>

      {/* Trending Content & Messages (only if data exists) */}
      {(stats?.blogs?.trending?.length > 0 || stats?.messages?.recent?.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {stats?.blogs?.trending?.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Trending Content</h2>
              <div className="space-y-4">
                {stats.blogs.trending.map((blog, index) => (
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
          )}

          {stats?.messages?.recent?.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Recent Messages</h2>
              <div className="space-y-4">
                {stats.messages.recent.map((message, index) => (
                  <Link
                    key={message.id || index}
                    href={`/dashboard/messages/${message.id}`}
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{message.sender}</p>
                        <p className="text-sm text-gray-600">{message.subject}</p>
                      </div>
                      <div className="flex items-center">
                        {!message.read && <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />}
                        <span className="text-xs text-gray-500">{message.time}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Activity (only if data exists) */}
      {stats?.recentActivity?.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {stats.recentActivity.map((activity, index) => (
              <div key={activity.id || index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  {activity.type === 'post' && <FileText size={20} className="text-blue-500" />}
                  {activity.type === 'project' && <Briefcase size={20} className="text-blue-500" />}
                  {activity.type === 'skill' && <Star size={20} className="text-blue-500" />}
                  {activity.type === 'message' && <MessageCircle size={20} className="text-blue-500" />}
                </div>
                <div>
                  <p className="font-medium">{activity.title}</p>
                  {activity.details && <p className="text-sm text-gray-600">{activity.details}</p>}
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
