'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Menu, Settings } from 'lucide-react';

interface HeaderProps {
  onMenuToggle: () => void;
}

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Overview',
  '/dashboard/outreach': 'Outreach',
  '/dashboard/outreach/companies': 'Companies',
  '/dashboard/outreach/contacts': 'Contacts',
  '/dashboard/outreach/templates': 'Templates',
  '/dashboard/outreach/ai': 'AI Assistant',
  '/dashboard/outreach/follow-ups': 'Follow-ups',
  '/dashboard/outreach/log': 'Outreach Log',
  '/dashboard/outreach/analytics': 'Outreach Analytics',
  '/dashboard/job-hunt': 'Job Hunt',
  '/dashboard/job-hunt/platforms': 'Platform Store',
  '/dashboard/job-hunt/platforms/new': 'Add Platform',
  '/dashboard/job-hunt/applications': 'Job Hunt Applications',
  '/dashboard/job-hunt/applications/new': 'Log New Application',
  '/dashboard/job-hunt/leads': 'Job Leads',
  '/dashboard/job-hunt/bookmarks': 'Bookmarks',
  '/dashboard/job-hunt/activities': 'Daily Activity Log',
  '/dashboard/job-hunt/interviews': 'Interview Tracker',
  '/dashboard/job-hunt/contacts': 'Contacts & Networking',
  '/dashboard/job-hunt/analytics': 'Job Hunt Analytics',
  '/dashboard/tools': 'Tools',
  '/dashboard/projects': 'Projects',
  '/dashboard/skills': 'Skills',
  '/dashboard/experience': 'Experience',
  '/dashboard/education': 'Education',
  '/dashboard/achievements': 'Achievements',
  '/dashboard/stats': 'Statistics',
  '/dashboard/posts': 'Blog Posts',
  '/dashboard/resumes': 'Resumes',
  '/dashboard/messages': 'Messages',
  '/dashboard/hiring-inquiries': 'Hiring Inquiries',
  '/dashboard/notifications': 'Notifications',
  '/dashboard/settings': 'Settings',
};

export default function DashboardHeader({ onMenuToggle }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [fullName, setFullName] = useState('Admin');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => { if (d.success && d.data?.fullName) setFullName(d.data.fullName); })
      .catch(() => {});
  }, []);

  const pageTitle = useMemo(() => {
    if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
    // Longest-prefix match for dynamic sub-routes
    const match = Object.entries(PAGE_TITLES)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([p]) => pathname.startsWith(p) && p !== '/dashboard');
    return match ? match[1] : 'Dashboard';
  }, [pathname]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.push('/login');
      setIsLoggingOut(false);
    }
  };

  const initials = fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="fixed top-0 left-0 right-0 md:left-[240px] h-14 bg-[#f7f5f1] border-b border-[#e8e3db] z-20 flex items-center justify-between px-4 sm:px-6">

      {/* ── Left: hamburger + page title ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-[#4a3728] hover:bg-[#e8e3db] transition-colors"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <h1 className="text-[0.9rem] font-semibold text-[#2a2118] font-body tracking-[-0.01em]">
          {pageTitle}
        </h1>
      </div>

      {/* ── Right: settings + user + logout ── */}
      <div className="flex items-center gap-1.5">

        {/* Settings */}
        <button
          onClick={() => router.push('/dashboard/settings')}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#8a7a6a] hover:text-[#2a2118] hover:bg-[#e8e3db] transition-colors"
          title="Settings"
        >
          <Settings size={15} />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-[#ddd5c5] mx-1.5" />

        {/* User avatar + name */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#d4622a] flex items-center justify-center flex-shrink-0">
            <span className="text-[0.58rem] font-bold text-white font-mono">{initials}</span>
          </div>
          <span className="hidden sm:block text-[0.82rem] font-medium text-[#2a2118] leading-none">
            {fullName}
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-[#ddd5c5] mx-1.5" />

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.75rem] font-medium transition-colors ${
            isLoggingOut
              ? 'text-[#8a7a6a] cursor-not-allowed'
              : 'text-[#8a7a6a] hover:text-red-600 hover:bg-red-50'
          }`}
          title="Logout"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">
            {isLoggingOut ? 'Logging out…' : 'Logout'}
          </span>
        </button>

      </div>
    </header>
  );
}
