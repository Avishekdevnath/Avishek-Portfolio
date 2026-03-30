'use client';

import { useState, Suspense, useEffect, useRef, useCallback } from 'react';
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { usePageReady } from '@/context/PageReadyContext';
import {
  LayoutDashboard,
  Briefcase,
  SearchCheck,
  GraduationCap,
  Code2,
  BookOpen,
  Send,
  Mail,
  Settings,
  Award,
  Bell,
  BarChart3,
  Wrench,
  History,
  UserCheck,
  FileText,
} from 'lucide-react';
import Sidebar, { NavItem } from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import PushNotificationSetup from '@/components/dashboard/PushNotificationSetup';

const sidebarItems: NavItem[] = [
  {
    icon: LayoutDashboard,
    label: 'Overview',
    href: '/dashboard',
    description: 'Dashboard overview and stats',
    category: 'Main',
  },
  {
    icon: Send,
    label: 'Outreach',
    href: '/dashboard/outreach',
    description: 'Cold outreach workflow',
    category: 'Main',
    children: [
      { label: 'Overview',    href: '/dashboard/outreach' },
      { label: 'Companies',   href: '/dashboard/outreach/companies' },
      { label: 'Contacts',    href: '/dashboard/outreach/contacts' },
      { label: 'Templates',   href: '/dashboard/outreach/templates' },
      { label: 'AI Assistant',href: '/dashboard/outreach/ai' },
      { label: 'Follow-ups',  href: '/dashboard/outreach/follow-ups' },
      { label: 'Log',         href: '/dashboard/outreach/log' },
      { label: 'Analytics',   href: '/dashboard/outreach/analytics' },
    ],
  },
  {
    icon: SearchCheck,
    label: 'Job Hunt',
    href: '/dashboard/job-hunt',
    description: 'Private job application tracker',
    category: 'Main',
    children: [
      { label: 'Overview', href: '/dashboard/job-hunt' },
      { label: 'Platform Store', href: '/dashboard/job-hunt/platforms' },
      { label: 'Company Store', href: '/dashboard/job-hunt/companies' },
      { label: 'HR Store', href: '/dashboard/job-hunt/hr' },
      { label: 'Applications', href: '/dashboard/job-hunt/applications' },
      { label: 'Job Leads', href: '/dashboard/job-hunt/leads' },
      { label: 'Bookmarks', href: '/dashboard/job-hunt/bookmarks' },
      { label: 'Activity Log', href: '/dashboard/job-hunt/activities' },
      { label: 'Interviews', href: '/dashboard/job-hunt/interviews' },
      { label: 'Contacts', href: '/dashboard/job-hunt/contacts' },
      { label: 'Analytics', href: '/dashboard/job-hunt/analytics' },
    ],
  },
  {
    icon: Wrench,
    label: 'Tools',
    href: '/dashboard/tools',
    description: 'Utility tools and features',
    category: 'Main',
  },
  {
    icon: Briefcase,
    label: 'Projects',
    href: '/dashboard/projects',
    description: 'Manage portfolio projects',
    category: 'Content',
  },
  {
    icon: Code2,
    label: 'Skills',
    href: '/dashboard/skills',
    description: 'Update technical skills',
    category: 'Content',
  },
  {
    icon: History,
    label: 'Experience',
    href: '/dashboard/experience',
    description: 'Work experience history',
    category: 'Content',
  },
  {
    icon: GraduationCap,
    label: 'Education',
    href: '/dashboard/education',
    description: 'Academic background',
    category: 'Content',
  },
  {
    icon: Award,
    label: 'Achievements',
    href: '/dashboard/achievements',
    description: 'Awards and certifications',
    category: 'Content',
  },
  {
    icon: BarChart3,
    label: 'Statistics',
    href: '/dashboard/stats',
    description: 'Portfolio stats',
    category: 'Content',
  },
  {
    icon: BookOpen,
    label: 'Blog Posts',
    href: '/dashboard/posts',
    description: 'Manage blog content',
    category: 'Content',
  },
  {
    icon: FileText,
    label: 'Resumes',
    href: '/dashboard/resumes',
    description: 'Manage public resume variants',
    category: 'Content',
  },
  {
    icon: Mail,
    label: 'Messages',
    href: '/dashboard/messages',
    description: 'Contact form submissions',
    category: 'Engagement',
  },
  {
    icon: UserCheck,
    label: 'Hiring Inquiries',
    href: '/dashboard/hiring-inquiries',
    description: 'Job opportunities',
    category: 'Engagement',
  },
  {
    icon: Bell,
    label: 'Notifications',
    href: '/dashboard/notifications',
    description: 'System notifications',
    category: 'Engagement',
  },
  {
    icon: Settings,
    label: 'Settings',
    href: '/dashboard/settings',
    description: 'Profile and website settings',
    category: 'System',
  },
];

function DashboardPageReady() {
  const { setReady } = usePageReady();
  const pathname = usePathname();
  const prevPath = useRef(pathname);

  // Signal ready on first mount
  useEffect(() => { setReady(); }, [setReady]);

  // Signal ready on every intra-dashboard navigation
  useEffect(() => {
    if (pathname !== prevPath.current) {
      prevPath.current = pathname;
      setReady();
    }
  }, [pathname, setReady]);

  return null;
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Persist sidebar collapsed state
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved === 'true') setCollapsed(true);
  }, []);

  const handleCollapseToggle = () => {
    setCollapsed(v => {
      localStorage.setItem('sidebar-collapsed', String(!v));
      return !v;
    });
  };

  return (
    <div className="min-h-screen bg-[#f7f5f1] font-body">
      <DashboardPageReady />
      <PushNotificationSetup />

      <Sidebar
        isOpen={mobileOpen}
        onToggle={() => setMobileOpen(false)}
        collapsed={collapsed}
        onCollapseToggle={handleCollapseToggle}
        items={sidebarItems}
      />

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <DashboardHeader
        onMenuToggle={() => setMobileOpen(v => !v)}
        sidebarCollapsed={collapsed}
      />

      <main className={`pt-14 min-h-screen transition-[margin-left] duration-300 ease-in-out ${collapsed ? 'md:ml-[60px]' : 'md:ml-[240px]'}`}>
        <div className="py-2 max-w-[1200px] mx-auto">
          <Suspense>
            {children}
          </Suspense>
        </div>
      </main>
    </div>
  );
}
