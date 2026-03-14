'use client';

import { useState, useEffect } from 'react';
import {
  Eye,
  MessageCircle,
  FileText,
  Briefcase,
  Star,
  TrendingUp,
  ArrowRight,
  PlusCircle,
  Code2,
  GraduationCap,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  blogs: { total: number; published: number; draft: number; trending: Array<{ title: string; views: number }>; };
  projects: { total: number; published: number; draft: number; };
  messages: { total: number; unread: number; recent: Array<{ id: string; sender: string; subject: string; time: string; read: boolean; }>; };
  skills: { total: number; featured: number; };
  recentActivity: Array<{ id: string; type: string; title: string; time: string; details?: string; }>;
}

const defaultStats: DashboardStats = {
  blogs: { total: 0, published: 0, draft: 0, trending: [] },
  projects: { total: 0, published: 0, draft: 0 },
  messages: { total: 0, unread: 0, recent: [] },
  skills: { total: 0, featured: 0 },
  recentActivity: [],
};

function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

function getStatValue(stats: DashboardStats, key: string): number {
  if (key === 'blogs') return stats.blogs.total;
  if (key === 'projects') return stats.projects.total;
  if (key === 'messages') return stats.messages.total;
  if (key === 'skills') return stats.skills.total;
  return 0;
}

function getStatMeta(stats: DashboardStats, key: string): string {
  if (key === 'blogs') return `${stats.blogs.published} published · ${stats.blogs.draft} drafts`;
  if (key === 'projects') return `${stats.projects.published} published`;
  if (key === 'messages') return `${stats.messages.unread} unread`;
  if (key === 'skills') return `${stats.skills.featured} featured`;
  return '';
}

const STAT_CARDS = [
  { key: 'blogs',    label: 'Blog Posts',  icon: FileText,      href: '/dashboard/posts',    iconBg: 'bg-[#e8f0fc] text-[#2d4eb3]' },
  { key: 'projects', label: 'Projects',    icon: Briefcase,     href: '/dashboard/projects', iconBg: 'bg-[#fdf0eb] text-[#d4622a]' },
  { key: 'messages', label: 'Messages',    icon: MessageCircle, href: '/dashboard/messages', iconBg: 'bg-[#e6f2ee] text-[#2a6b4f]' },
  { key: 'skills',   label: 'Skills',      icon: Star,          href: '/dashboard/skills',   iconBg: 'bg-[#fef3e2] text-[#92510a]' },
] as const;

const activityIconBg: Record<string, string> = {
  post:    'bg-[#e8f0fc] text-[#2d4eb3]',
  project: 'bg-[#fdf0eb] text-[#d4622a]',
  message: 'bg-[#e6f2ee] text-[#2a6b4f]',
  skill:   'bg-[#fef3e2] text-[#92510a]',
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch('/api/stats/dashboard');
        const data = await response.json();
        if (response.ok && data?.blogs && data?.projects && data?.messages && data?.skills) {
          const transformedMessages = {
            ...data.messages,
            recent: (data.messages.recent || []).map((msg: any, index: number) => ({
              id: msg._id || `msg-${index}`,
              sender: msg.sender || 'Unknown',
              subject: msg.subject || 'No subject',
              time: msg.createdAt ? formatTimeAgo(msg.createdAt) : 'Unknown',
              read: false,
            })),
          };
          const transformedActivity = (data.recentActivity || []).map((activity: any, index: number) => ({
            id: activity._id || `activity-${index}`,
            type: activity.type || 'info',
            title: activity.title || 'Activity',
            time: activity.createdAt ? formatTimeAgo(activity.createdAt) : 'Unknown',
            details: activity.message || activity.details,
          }));
          setStats({
            blogs: data.blogs || defaultStats.blogs,
            projects: data.projects || defaultStats.projects,
            messages: transformedMessages,
            skills: data.skills || defaultStats.skills,
            recentActivity: transformedActivity,
          });
        } else {
          setStats(defaultStats);
        }
      } catch {
        setStats(defaultStats);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-[#e8e3db] border-t-[#d4622a] rounded-full animate-spin" />
      </div>
    );
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const QUICK_ACTIONS = [
    { label: 'New Project',   href: '/dashboard/projects/new',  icon: Briefcase,    tint: 'bg-[#fdf0eb] text-[#d4622a] hover:bg-[#f9e2d4]' },
    { label: 'New Post',      href: '/dashboard/posts/new',     icon: FileText,     tint: 'bg-[#e8f0fc] text-[#2d4eb3] hover:bg-[#d5e3f9]' },
    { label: 'Add Skill',     href: '/dashboard/skills',        icon: Code2,        tint: 'bg-[#e6f2ee] text-[#2a6b4f] hover:bg-[#d1ece4]' },
    { label: 'Add Experience',href: '/dashboard/experience',    icon: GraduationCap,tint: 'bg-[#fef3e2] text-[#92510a] hover:bg-[#fde9c4]' },
  ] as const;

  return (
    <div className="space-y-6">

      {/* Welcome banner */}
      <div className="bg-white border border-[#e8e3db] rounded-xl px-5 py-4 shadow-sm flex items-center justify-between gap-4">
        <div>
          <p className="text-[0.72rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a]">{today}</p>
          <p className="text-[0.875rem] font-semibold text-[#2a2118] mt-0.5">Welcome back — here&apos;s your portfolio at a glance.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          {QUICK_ACTIONS.map(({ label, href, icon: Icon, tint }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.72rem] font-medium transition-colors ${tint}`}
            >
              <Icon size={13} />
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ key, label, icon: Icon, href, iconBg }) => (
          <Link
            key={key}
            href={href}
            className="bg-white border border-[#e8e3db] rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-4"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
              <Icon size={18} />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[1.5rem] font-semibold text-[#2a2118] leading-none">
                {getStatValue(stats, key)}
              </p>
              <p className="text-[0.72rem] text-[#8a7a6a] font-body mt-0.5 truncate">{label}</p>
              <p className="text-[0.65rem] font-mono text-[#a89a8a] mt-0.5 truncate">{getStatMeta(stats, key)}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Trending + Recent Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-[#e8e3db] rounded-xl shadow-sm">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e8e3db]">
            <p className="text-[0.82rem] font-semibold text-[#2a2118]">Trending Content</p>
            <TrendingUp size={14} className="text-[#8a7a6a]" />
          </div>
          {stats.blogs.trending.length > 0 ? (
            <div className="divide-y divide-[#f3f1ee]">
              {stats.blogs.trending.map((blog, index) => (
                <div key={index} className="flex items-center justify-between px-5 py-3 hover:bg-[#faf8f4] transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-[0.65rem] text-[#8a7a6a] w-4 flex-shrink-0">#{index + 1}</span>
                    <span className="text-[0.82rem] text-[#4a3728] truncate">{blog.title}</span>
                  </div>
                  <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                    <Eye size={12} className="text-[#8a7a6a]" />
                    <span className="font-mono text-[0.72rem] text-[#8a7a6a]">{blog.views}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
              <FileText size={28} className="text-[#ddd5c5] mb-2" />
              <p className="text-[0.82rem] font-medium text-[#4a3728]">No blog posts yet</p>
              <Link href="/dashboard/posts/new" className="mt-2 flex items-center gap-1 text-[0.72rem] font-mono text-[#d4622a] hover:underline">
                <PlusCircle size={12} /> Write your first post
              </Link>
            </div>
          )}
        </div>

        <div className="bg-white border border-[#e8e3db] rounded-xl shadow-sm">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e8e3db]">
            <p className="text-[0.82rem] font-semibold text-[#2a2118]">Recent Messages</p>
            <Link href="/dashboard/messages" className="text-[0.65rem] font-mono text-[#d4622a] hover:underline flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          {stats.messages.recent.length > 0 ? (
            <div className="divide-y divide-[#f3f1ee]">
              {stats.messages.recent.map((message, index) => (
                <Link
                  key={message.id || index}
                  href={`/dashboard/messages/${message.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-[#faf8f4] transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-[0.82rem] font-medium text-[#2a2118] truncate">{message.sender}</p>
                    <p className="text-[0.72rem] text-[#8a7a6a] truncate">{message.subject}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    {!message.read && <span className="w-1.5 h-1.5 bg-[#d4622a] rounded-full" />}
                    <span className="font-mono text-[0.65rem] text-[#8a7a6a]">{message.time}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
              <MessageCircle size={28} className="text-[#ddd5c5] mb-2" />
              <p className="text-[0.82rem] font-medium text-[#4a3728]">No messages yet</p>
              <p className="text-[0.72rem] text-[#8a7a6a] mt-0.5">Contact form submissions appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-[#e8e3db] rounded-xl shadow-sm">
        <div className="px-5 py-3.5 border-b border-[#e8e3db]">
          <p className="text-[0.82rem] font-semibold text-[#2a2118]">Recent Activity</p>
        </div>
        {stats.recentActivity.length > 0 ? (
          <div className="divide-y divide-[#f3f1ee]">
            {stats.recentActivity.map((activity, index) => {
              const IconComp = activity.type === 'post' ? FileText
                : activity.type === 'project' ? Briefcase
                : activity.type === 'skill' ? Star
                : MessageCircle;
              const bg = activityIconBg[activity.type] || 'bg-[#f3f1ee] text-[#6b5c4e]';
              return (
                <div key={activity.id || index} className="flex items-start gap-4 px-5 py-3.5 hover:bg-[#faf8f4] transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${bg}`}>
                    <IconComp size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.82rem] font-medium text-[#2a2118]">{activity.title}</p>
                    {activity.details && <p className="text-[0.72rem] text-[#8a7a6a] mt-0.5">{activity.details}</p>}
                  </div>
                  <span className="font-mono text-[0.65rem] text-[#8a7a6a] flex-shrink-0 mt-0.5">{activity.time}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
            <Star size={28} className="text-[#ddd5c5] mb-2" />
            <p className="text-[0.82rem] font-medium text-[#4a3728]">No activity yet</p>
            <p className="text-[0.72rem] text-[#8a7a6a] mt-0.5">Your recent portfolio changes will show up here</p>
          </div>
        )}
      </div>

    </div>
  );
}
