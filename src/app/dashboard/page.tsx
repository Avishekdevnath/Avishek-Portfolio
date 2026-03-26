'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Eye,
  ThumbsUp,
  MessageCircle,
  Send,
  Briefcase,
  AlertTriangle,
  Clock,
  CheckCircle,
  ArrowRight,
  FileText,
  Star,
  PlusCircle,
  Code2,
  GraduationCap,
  TrendingUp,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RecentMessage {
  id: string;
  sender: string;
  subject: string;
  time: string;
  read: boolean;
}

interface TrendingBlog {
  title: string;
  views: number;
}

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  time: string;
  details?: string;
}

interface DashboardHomeState {
  engagement: { totalViews: number; totalLikes: number };
  messages: { unread: number; recent: RecentMessage[] };
  blogs: { trending: TrendingBlog[] };
  recentActivity: ActivityItem[];
  outreach: { followUpsDue: number };
  jobHunt: {
    totalApplications: number;
    overdueCount: number;
    followUpSoonCount: number;
    pipeline: { applied: number; interview: number; offer: number };
    newLeadsCount: number;
  };
}

const DEFAULT_STATE: DashboardHomeState = {
  engagement: { totalViews: 0, totalLikes: 0 },
  messages: { unread: 0, recent: [] },
  blogs: { trending: [] },
  recentActivity: [],
  outreach: { followUpsDue: 0 },
  jobHunt: {
    totalApplications: 0,
    overdueCount: 0,
    followUpSoonCount: 0,
    pipeline: { applied: 0, interview: 0, offer: 0 },
    newLeadsCount: 0,
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const d = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [state, setState] = useState<DashboardHomeState>(DEFAULT_STATE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const [dashRes, outreachRes, jobHuntRes] = await Promise.allSettled([
        fetch('/api/stats/dashboard'),
        fetch('/api/outreach/stats'),
        fetch('/api/job-hunt/summary'),
      ]);

      const next: DashboardHomeState = { ...DEFAULT_STATE };

      // Portfolio stats
      if (dashRes.status === 'fulfilled' && dashRes.value.ok) {
        try {
          const d = await dashRes.value.json();
          next.engagement = {
            totalViews: d.engagement?.totalViews ?? 0,
            totalLikes: d.engagement?.totalLikes ?? 0,
          };
          next.messages = {
            unread: d.messages?.unread ?? 0,
            recent: (d.messages?.recent ?? []).map((m: any, i: number) => ({
              id: m._id || `msg-${i}`,
              sender: m.sender || 'Unknown',
              subject: m.subject || 'No subject',
              time: m.createdAt ? formatTimeAgo(m.createdAt) : '',
              read: false,
            })),
          };
          next.blogs = { trending: d.blogs?.trending ?? [] };
          next.recentActivity = (d.recentActivity ?? []).map((a: any, i: number) => ({
            id: a._id || `act-${i}`,
            type: a.type || 'info',
            title: a.title || 'Activity',
            time: a.createdAt ? formatTimeAgo(a.createdAt) : '',
            details: a.message || a.details,
          }));
        } catch { /* keep defaults */ }
      }

      // Outreach stats
      if (outreachRes.status === 'fulfilled' && outreachRes.value.ok) {
        try {
          const d = await outreachRes.value.json();
          if (d.success) next.outreach = { followUpsDue: d.data?.followUpsDue ?? 0 };
        } catch { /* keep defaults */ }
      }

      // Job hunt summary
      if (jobHuntRes.status === 'fulfilled' && jobHuntRes.value.ok) {
        try {
          const d = await jobHuntRes.value.json();
          if (d.success) {
            next.jobHunt = {
              totalApplications: d.data?.totalApplications ?? 0,
              overdueCount: d.data?.overdueCount ?? 0,
              followUpSoonCount: d.data?.followUpSoonCount ?? 0,
              pipeline: d.data?.pipeline ?? { applied: 0, interview: 0, offer: 0 },
              newLeadsCount: d.data?.newLeadsCount ?? 0,
            };
          }
        } catch { /* keep defaults */ }
      }

      setState(next);
      setIsLoading(false);
    };

    fetchAll();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-[#e8e3db] border-t-[#d4622a] rounded-full animate-spin" />
      </div>
    );
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  const QUICK_ACTIONS = [
    { label: 'New Project',    href: '/dashboard/projects/new', icon: Briefcase,     tint: 'bg-[#fdf0eb] text-[#d4622a] hover:bg-[#f9e2d4]' },
    { label: 'New Post',       href: '/dashboard/posts/new',    icon: FileText,      tint: 'bg-[#e8f0fc] text-[#2d4eb3] hover:bg-[#d5e3f9]' },
    { label: 'Add Skill',      href: '/dashboard/skills',       icon: Code2,         tint: 'bg-[#e6f2ee] text-[#2a6b4f] hover:bg-[#d1ece4]' },
    { label: 'Add Experience', href: '/dashboard/experience',   icon: GraduationCap, tint: 'bg-[#fef3e2] text-[#92510a] hover:bg-[#fde9c4]' },
  ] as const;

  const { engagement, messages, blogs, recentActivity, outreach, jobHunt } = state;

  const actionItems = [
    {
      show: messages.unread > 0,
      icon: MessageCircle,
      label: 'Unread messages',
      count: messages.unread,
      href: '/dashboard/messages',
      color: 'text-[#d4622a]',
      bg: 'bg-[#fdf0eb]',
    },
    {
      show: outreach.followUpsDue > 0,
      icon: Send,
      label: 'Outreach follow-ups due',
      count: outreach.followUpsDue,
      href: '/dashboard/outreach/follow-ups',
      color: 'text-[#92510a]',
      bg: 'bg-[#fef3e2]',
    },
    {
      show: jobHunt.overdueCount > 0,
      icon: AlertTriangle,
      label: 'Overdue applications',
      count: jobHunt.overdueCount,
      href: '/dashboard/job-hunt/applications?alert=overdue',
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      show: jobHunt.followUpSoonCount > 0,
      icon: Clock,
      label: 'Applications to follow up',
      count: jobHunt.followUpSoonCount,
      href: '/dashboard/job-hunt/applications?alert=followUpSoon',
      color: 'text-yellow-700',
      bg: 'bg-yellow-50',
    },
  ].filter(item => item.show);

  const pipelineEmpty =
    jobHunt.pipeline.applied === 0 &&
    jobHunt.pipeline.interview === 0 &&
    jobHunt.pipeline.offer === 0;

  const activityIconBg: Record<string, string> = {
    post:    'bg-[#e8f0fc] text-[#2d4eb3]',
    project: 'bg-[#fdf0eb] text-[#d4622a]',
    message: 'bg-[#e6f2ee] text-[#2a6b4f]',
    skill:   'bg-[#fef3e2] text-[#92510a]',
  };

  return (
    <div className="space-y-6">

      {/* ── Welcome banner ─────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#e8e3db] rounded-xl px-5 py-4 shadow-sm flex items-center justify-between gap-4">
        <div>
          <p className="text-[0.72rem] font-mono tracking-[0.12em] uppercase text-[#8a7a6a]">{today}</p>
          <p className="text-[0.875rem] font-semibold text-[#2a2118] mt-0.5">Welcome back — here&apos;s your command centre.</p>
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

      {/* ── Row 1: Stat strip ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">

        <Link href="/dashboard/analytics" className="bg-white border border-[#e8e3db] rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center gap-1.5 mb-2">
            <Eye size={13} className="text-[#8a7a6a]" />
            <p className="text-[0.65rem] font-mono text-[#8a7a6a] uppercase tracking-wide">Views</p>
          </div>
          <p className="font-mono text-[1.4rem] font-semibold text-[#2a2118] leading-none">{engagement.totalViews}</p>
        </Link>

        <Link href="/dashboard/analytics" className="bg-white border border-[#e8e3db] rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center gap-1.5 mb-2">
            <ThumbsUp size={13} className="text-[#8a7a6a]" />
            <p className="text-[0.65rem] font-mono text-[#8a7a6a] uppercase tracking-wide">Likes</p>
          </div>
          <p className="font-mono text-[1.4rem] font-semibold text-[#2a2118] leading-none">{engagement.totalLikes}</p>
        </Link>

        <Link href="/dashboard/messages" className="bg-white border border-[#e8e3db] rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all relative">
          {messages.unread > 0 && (
            <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#d4622a]" />
          )}
          <div className="flex items-center gap-1.5 mb-2">
            <MessageCircle size={13} className="text-[#8a7a6a]" />
            <p className="text-[0.65rem] font-mono text-[#8a7a6a] uppercase tracking-wide">Messages</p>
          </div>
          <p className="font-mono text-[1.4rem] font-semibold text-[#2a2118] leading-none">{messages.unread}</p>
          <p className="text-[0.6rem] text-[#a89a8a] font-mono mt-0.5">unread</p>
        </Link>

        <Link
          href="/dashboard/outreach/follow-ups"
          className={`rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all border ${
            outreach.followUpsDue > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-[#e8e3db]'
          }`}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <Send size={13} className="text-[#8a7a6a]" />
            <p className="text-[0.65rem] font-mono text-[#8a7a6a] uppercase tracking-wide">Follow-ups</p>
          </div>
          <p className="font-mono text-[1.4rem] font-semibold text-[#2a2118] leading-none">{outreach.followUpsDue}</p>
          <p className="text-[0.6rem] text-[#a89a8a] font-mono mt-0.5">due</p>
        </Link>

        <Link href="/dashboard/job-hunt/applications" className="bg-white border border-[#e8e3db] rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center gap-1.5 mb-2">
            <Briefcase size={13} className="text-[#8a7a6a]" />
            <p className="text-[0.65rem] font-mono text-[#8a7a6a] uppercase tracking-wide">Applied</p>
          </div>
          <p className="font-mono text-[1.4rem] font-semibold text-[#2a2118] leading-none">{jobHunt.totalApplications}</p>
          <p className="text-[0.6rem] text-[#a89a8a] font-mono mt-0.5">total</p>
        </Link>

        <Link
          href="/dashboard/job-hunt/applications"
          className={`rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all border ${
            jobHunt.overdueCount > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-[#e8e3db]'
          }`}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle size={13} className="text-[#8a7a6a]" />
            <p className="text-[0.65rem] font-mono text-[#8a7a6a] uppercase tracking-wide">Overdue</p>
          </div>
          <p className="font-mono text-[1.4rem] font-semibold text-[#2a2118] leading-none">{jobHunt.overdueCount}</p>
          <p className="text-[0.6rem] text-[#a89a8a] font-mono mt-0.5">apps</p>
        </Link>

      </div>

      {/* ── Row 2: Action panels ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Needs Action */}
        <div className="bg-white border border-[#e8e3db] rounded-xl shadow-sm">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e8e3db]">
            <p className="text-[0.82rem] font-semibold text-[#2a2118]">Needs Action</p>
          </div>
          {actionItems.length > 0 ? (
            <div className="divide-y divide-[#f3f1ee]">
              {actionItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between px-5 py-3 hover:bg-[#faf8f4] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${item.bg}`}>
                      <item.icon size={13} className={item.color} />
                    </div>
                    <p className="text-[0.82rem] text-[#4a3728]">{item.label}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[0.72rem] font-mono font-semibold ${item.color}`}>{item.count}</span>
                    <ArrowRight size={12} className="text-[#8a7a6a]" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
              <CheckCircle size={26} className="text-[#2a6b4f] mb-2" />
              <p className="text-[0.82rem] font-medium text-[#4a3728]">All clear</p>
              <p className="text-[0.72rem] text-[#8a7a6a] mt-0.5">Nothing needs your attention right now</p>
            </div>
          )}
        </div>

        {/* Job Hunt Pipeline */}
        <div className="bg-white border border-[#e8e3db] rounded-xl shadow-sm">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e8e3db]">
            <p className="text-[0.82rem] font-semibold text-[#2a2118]">Job Hunt Pipeline</p>
            <Link href="/dashboard/job-hunt" className="text-[0.65rem] font-mono text-[#d4622a] hover:underline flex items-center gap-1">
              Open <ArrowRight size={11} />
            </Link>
          </div>
          {pipelineEmpty ? (
            <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
              <Briefcase size={26} className="text-[#ddd5c5] mb-2" />
              <p className="text-[0.82rem] font-medium text-[#4a3728]">No applications logged yet</p>
              <Link href="/dashboard/job-hunt/applications/new" className="mt-2 flex items-center gap-1 text-[0.72rem] font-mono text-[#d4622a] hover:underline">
                <PlusCircle size={12} /> Log your first application
              </Link>
            </div>
          ) : (
            <div className="px-5 py-5 space-y-4">
              <div className="flex items-center gap-2">
                {[
                  { label: 'Applied',   count: jobHunt.pipeline.applied,   bg: 'bg-[#e8f0fc] text-[#2d4eb3]' },
                  { label: 'Interview', count: jobHunt.pipeline.interview,  bg: 'bg-[#fef3e2] text-[#92510a]' },
                  { label: 'Offer',     count: jobHunt.pipeline.offer,      bg: 'bg-[#e6f2ee] text-[#2a6b4f]' },
                ].map((stage, i) => (
                  <div key={stage.label} className="flex items-center gap-2 flex-1">
                    <div className={`flex-1 rounded-lg px-3 py-2.5 text-center ${stage.bg}`}>
                      <p className="font-mono text-[1.2rem] font-semibold leading-none">{stage.count}</p>
                      <p className="text-[0.62rem] font-mono mt-0.5 opacity-80">{stage.label}</p>
                    </div>
                    {i < 2 && <ArrowRight size={12} className="text-[#c5bdb5] flex-shrink-0" />}
                  </div>
                ))}
              </div>
              {jobHunt.newLeadsCount > 0 && (
                <Link
                  href="/dashboard/job-hunt/leads"
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#faf8f4] border border-[#e8e3db] hover:bg-[#f3f1ee] transition-colors"
                >
                  <p className="text-[0.78rem] text-[#4a3728]">
                    <span className="font-semibold font-mono text-[#d4622a]">{jobHunt.newLeadsCount}</span> new leads available
                  </p>
                  <ArrowRight size={12} className="text-[#8a7a6a]" />
                </Link>
              )}
            </div>
          )}
        </div>

      </div>

      {/* ── Row 3: Trending + Messages ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-[#e8e3db] rounded-xl shadow-sm">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e8e3db]">
            <p className="text-[0.82rem] font-semibold text-[#2a2118]">Trending Content</p>
            <TrendingUp size={14} className="text-[#8a7a6a]" />
          </div>
          {blogs.trending.length > 0 ? (
            <div className="divide-y divide-[#f3f1ee]">
              {blogs.trending.map((blog, index) => (
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
          {messages.recent.length > 0 ? (
            <div className="divide-y divide-[#f3f1ee]">
              {messages.recent.map((message, index) => (
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

      {/* ── Row 4: Recent Activity ─────────────────────────────────────────── */}
      <div className="bg-white border border-[#e8e3db] rounded-xl shadow-sm">
        <div className="px-5 py-3.5 border-b border-[#e8e3db]">
          <p className="text-[0.82rem] font-semibold text-[#2a2118]">Recent Activity</p>
        </div>
        {recentActivity.length > 0 ? (
          <div className="divide-y divide-[#f3f1ee]">
            {recentActivity.map((activity, index) => {
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
