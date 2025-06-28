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
  Bell
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

const sidebarItems = [
  { 
    icon: LayoutDashboard, 
    label: 'Overview', 
    href: '/dashboard',
    description: 'Dashboard overview and analytics'
  },
  { 
    icon: Briefcase, 
    label: 'Projects', 
    href: '/dashboard/projects',
    description: 'Manage portfolio projects'
  },
  { 
    icon: Code2, 
    label: 'Skills', 
    href: '/dashboard/skills',
    description: 'Update technical skills'
  },
  { 
    icon: GraduationCap, 
    label: 'Experience', 
    href: '/dashboard/experience',
    description: 'Work and education history'
  },
  { 
    icon: Award, 
    label: 'Achievements', 
    href: '/dashboard/achievements',
    description: 'Awards and certifications'
  },
  { 
    icon: BookOpen, 
    label: 'Blog Posts', 
    href: '/dashboard/posts',
    description: 'Manage blog content'
  },
  { 
    icon: Mail, 
    label: 'Messages', 
    href: '/dashboard/messages',
    description: 'Contact form submissions'
  },
  { 
    icon: Bell, 
    label: 'Notifications', 
    href: '/dashboard/notifications',
    description: 'System notifications'
  },
  { 
    icon: Settings, 
    label: 'Settings', 
    href: '/dashboard/settings',
    description: 'Profile and website settings'
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