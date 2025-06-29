'use client';

import { useState, Suspense } from 'react';
import { ReactNode } from 'react';
import {
  LayoutDashboard,
  Briefcase,
  GraduationCap,
  Code2,
  FileText,
  Mail,
  Settings,
  BookOpen,
  Award,
  User,
  Bell,
  BarChart3,
  Wrench
} from 'lucide-react';
import Sidebar, { NavItem, NavCategory } from '@/components/dashboard/Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

const sidebarItems: NavItem[] = [
  { 
    icon: LayoutDashboard, 
    label: 'Overview', 
    href: '/dashboard',
    description: 'Dashboard overview and analytics',
    category: 'Main'
  },
  { 
    icon: Wrench, 
    label: 'Tools', 
    href: '/dashboard/tools',
    description: 'Utility tools and features',
    category: 'Main'
  },
  { 
    icon: Briefcase, 
    label: 'Projects', 
    href: '/dashboard/projects',
    description: 'Manage portfolio projects',
    category: 'Content'
  },
  { 
    icon: Code2, 
    label: 'Skills', 
    href: '/dashboard/skills',
    description: 'Update technical skills',
    category: 'Content'
  },
  { 
    icon: GraduationCap, 
    label: 'Experience', 
    href: '/dashboard/experience',
    description: 'Work and education history',
    category: 'Content'
  },
  { 
    icon: Award, 
    label: 'Achievements', 
    href: '/dashboard/achievements',
    description: 'Awards and certifications',
    category: 'Content'
  },
  { 
    icon: BarChart3, 
    label: 'Statistics', 
    href: '/dashboard/stats',
    description: 'Portfolio stats and achievements',
    category: 'Content'
  },
  { 
    icon: BookOpen, 
    label: 'Blog Posts', 
    href: '/dashboard/posts',
    description: 'Manage blog content',
    category: 'Content'
  },
  { 
    icon: Mail, 
    label: 'Messages', 
    href: '/dashboard/messages',
    description: 'Contact form submissions',
    category: 'Engagement'
  },
  { 
    icon: Bell, 
    label: 'Notifications', 
    href: '/dashboard/notifications',
    description: 'System notifications',
    category: 'Engagement'
  },
  { 
    icon: Settings, 
    label: 'Settings', 
    href: '/dashboard/settings',
    description: 'Profile and website settings',
    category: 'System'
  },
];

function SidebarSkeleton() {
  return (
    <div className="fixed inset-y-0 left-0 w-[280px] bg-white border-r border-gray-200 z-30">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        <div className="animate-pulse flex items-center gap-3">
          <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="p-4 space-y-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="animate-pulse flex items-center gap-3 px-3 py-2">
            <div className="h-5 w-5 bg-gray-200 rounded"></div>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="dashboard-layout">
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} items={sidebarItems} />
      </Suspense>

      <main className={`dashboard-main ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`}>
        <div className="content-wrapper">
          <Suspense>
            {children}
          </Suspense>
        </div>
      </main>

      <style jsx>{`
        .dashboard-layout {
          min-height: 100vh;
          background: #f8fafc;
        }

        .dashboard-main {
          margin-left: 280px;
          min-height: 100vh;
          padding: 24px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .dashboard-main.sidebar-collapsed {
          margin-left: 72px;
        }

        .content-wrapper {
          max-width: 1200px;
          margin: 0 auto;
        }

        @media (max-width: 1536px) {
          .dashboard-main {
            padding: 20px;
          }
        }

        @media (max-width: 1280px) {
          .dashboard-main {
            padding: 16px;
          }
        }

        @media (max-width: 768px) {
          .dashboard-main {
            margin-left: 0;
            padding: 12px;
          }
          
          .dashboard-main.sidebar-collapsed {
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  );
}