'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Suspense } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  category: string;
}

const navItems: NavItem[] = [
  // Overview
  { label: 'Overview', href: '/dashboard', icon: '📊', category: 'Main' },
  { label: 'Analytics', href: '/dashboard/analytics', icon: '📈', category: 'Main' },
  
  // Content Management
  { label: 'Blog Posts', href: '/dashboard/posts', icon: '✍️', category: 'Content' },
  { label: 'Projects', href: '/dashboard/projects', icon: '🚀', category: 'Content' },
  { label: 'Skills', href: '/dashboard/skills', icon: '💡', category: 'Content' },
  { label: 'Experience', href: '/dashboard/experience', icon: '🎯', category: 'Content' },
  { label: 'Education', href: '/dashboard/education', icon: '🎓', category: 'Content' },
  { label: 'Stats', href: '/dashboard/stats', icon: '📊', category: 'Content' },
  
  // Communication
  { label: 'Messages', href: '/dashboard/messages', icon: '💬', category: 'Engagement' },
  { label: 'Notifications', href: '/dashboard/notifications', icon: '🔔', category: 'Engagement' },
  
  // Settings
  { label: 'Settings', href: '/dashboard/settings', icon: '⚙️', category: 'System' },
  { label: 'Profile', href: '/dashboard/profile', icon: '👤', category: 'System' },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

function SidebarSkeleton() {
  return (
    <aside className="sidebar">
      {/* Header Skeleton */}
      <div className="sidebar-header">
        <div className="animate-pulse flex items-center gap-3">
          <div className="h-9 w-9 bg-blue-200 rounded-lg"></div>
          <div className="h-5 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* View Site Button Skeleton */}
      <div className="view-site-section">
        <div className="view-site-btn animate-pulse">
          <div className="h-5 w-5 bg-gray-200 rounded"></div>
          <div className="h-4 w-20 bg-gray-200 rounded ml-3"></div>
        </div>
      </div>

      {/* Navigation Items Skeleton */}
      <nav className="sidebar-nav">
        {['Main', 'Content', 'Engagement', 'System'].map((category) => (
          <div key={category} className="nav-section">
            <div className="nav-header">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="nav-item animate-pulse">
                <div className="h-5 w-5 bg-gray-200 rounded"></div>
                <div className="nav-separator"></div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ))}
      </nav>

      <style jsx>{`
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: 280px;
          height: 100vh;
          background: #ffffff;
          border-right: 1px solid rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          overflow-x: hidden;
          z-index: 100;
        }

        .sidebar-header {
          padding: 24px 20px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          background: linear-gradient(to right, #ffffff, #f8fafc);
          margin-bottom: 8px;
        }

        .view-site-section {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }

        .view-site-btn {
          display: flex;
          align-items: center;
          padding: 10px 16px;
          border-radius: 10px;
          background: rgba(0, 0, 0, 0.02);
        }

        .nav-section {
          padding: 8px 12px;
        }

        .nav-header {
          padding: 12px 16px;
          opacity: 0.6;
        }

        .nav-item {
          display: flex;
          align-items: center;
          padding: 10px 16px;
          margin: 4px 0;
          border-radius: 10px;
          gap: 12px;
        }

        .nav-separator {
          width: 1px;
          height: 20px;
          background: rgba(0, 0, 0, 0.06);
          margin: 0 12px;
        }
      `}</style>
    </aside>
  );
}

function SidebarContent({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();

  // Function to check if a link is active
  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // Group nav items by category
  const groupedNavItems = navItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  return (
    <aside className={`sidebar ${!isOpen ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-section">
          <span className="logo">A</span>
          {isOpen && <span className="title">Portfolio Admin</span>}
        </div>
        <button onClick={onToggle} className="toggle-btn">
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* View Site Button */}
      <div className="view-site-section">
        <Link
          href="/"
          className="view-site-btn"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink className="view-site-icon" size={18} />
          {isOpen && (
            <>
              <span className="nav-separator"></span>
              <span className="view-site-label">View Site</span>
            </>
          )}
        </Link>
      </div>

      <nav className="sidebar-nav">
        {Object.entries(groupedNavItems).map(([category, items]) => (
          <div key={category} className="nav-section">
            <div className="nav-header">{isOpen && category}</div>
            {items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item ${active ? 'active' : ''}`}
                >
                  <span className={`nav-icon ${active ? 'active' : ''}`}>{item.icon}</span>
                  {isOpen && (
                    <>
                      <span className="nav-separator"></span>
                      <span className={`nav-label ${active ? 'active' : ''}`}>{item.label}</span>
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <style jsx>{`
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: 280px;
          height: 100vh;
          background: #ffffff;
          border-right: 1px solid rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          overflow-x: hidden;
          z-index: 100;
        }

        .sidebar.collapsed {
          width: 72px;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 20px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          background: linear-gradient(to right, #ffffff, #f8fafc);
          position: relative;
          margin-bottom: 8px;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 14px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .logo {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border-radius: 10px;
          display: grid;
          place-items: center;
          font-weight: bold;
          font-size: 18px;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
          flex-shrink: 0;
        }

        .title {
          font-weight: 600;
          color: #1e293b;
          font-size: 16px;
          opacity: 1;
          transform: translateX(0);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
        }

        .sidebar.collapsed .title {
          opacity: 0;
          transform: translateX(-10px);
        }

        .toggle-btn {
          display: grid;
          place-items: center;
          padding: 8px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          cursor: pointer;
          background: white;
          color: #64748b;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: absolute;
          right: -14px;
          width: 28px;
          height: 28px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          z-index: 10;
        }

        .toggle-btn:hover {
          background: #f8fafc;
          color: #1e293b;
          border-color: #cbd5e1;
          transform: scale(1.05);
        }

        .toggle-btn:active {
          transform: scale(0.95);
        }

        /* View Site Section */
        .view-site-section {
          padding: 0 16px;
          margin-bottom: 12px;
        }

        .view-site-btn {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          color: #059669;
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          border: 1px solid #a7f3d0;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          width: 100%;
          position: relative;
          overflow: hidden;
        }

        .view-site-btn:hover {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          color: #047857;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
        }

        .view-site-btn:active {
          transform: translateY(0);
        }

        .view-site-icon {
          flex-shrink: 0;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .view-site-btn:hover .view-site-icon {
          transform: scale(1.1);
        }

        .view-site-label {
          font-size: 14px;
          font-weight: 600;
          white-space: nowrap;
          opacity: 1;
          transform: translateX(0);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          letter-spacing: 0.01em;
        }

        .sidebar.collapsed .view-site-btn {
          justify-content: center;
          padding: 12px 0;
        }

        .sidebar.collapsed .view-site-label {
          opacity: 0;
          transform: translateX(-10px);
        }

        .sidebar.collapsed .view-site-icon {
          transform: scale(1.1);
        }

        .sidebar-nav {
          flex: 1;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 28px;
          overflow-y: auto;
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
        }

        .nav-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .nav-header {
          padding: 0 12px;
          margin-bottom: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          opacity: 1;
          transform: translateX(0);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sidebar.collapsed .nav-header {
          opacity: 0;
          transform: translateX(-10px);
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          color: #64748b;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          margin: 0 4px;
          width: calc(100% - 8px);
          position: relative;
          overflow: hidden;
        }

        .nav-item:hover {
          background: #f1f5f9;
          color: #1e293b;
          transform: translateX(2px);
        }

        .nav-item.active {
          background: #eff6ff;
          color: #2563eb;
          font-weight: 500;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          position: relative;
        }

        .nav-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 20px;
          background: #2563eb;
          border-radius: 0 4px 4px 0;
        }

        .nav-item.active::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 12px;
          background: linear-gradient(90deg, rgba(37, 99, 235, 0.08) 0%, rgba(37, 99, 235, 0.05) 100%);
          z-index: -1;
        }

        .nav-icon {
          display: inline-block;
          width: 24px;
          text-align: center;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          flex-shrink: 0;
          font-size: 18px;
        }

        .nav-icon.active {
          color: #2563eb;
          transform: scale(1.1);
        }

        .nav-separator {
          display: inline-block;
          width: 8px;
          text-align: center;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .nav-label {
          font-size: 14px;
          white-space: nowrap;
          opacity: 1;
          transform: translateX(0);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          letter-spacing: 0.01em;
        }

        .nav-label.active {
          color: #2563eb;
          font-weight: 600;
        }

        .sidebar.collapsed .nav-label {
          opacity: 0;
          transform: translateX(-10px);
        }

        .sidebar.collapsed .nav-item {
          justify-content: center;
          padding: 12px 0;
          width: 100%;
        }

        .sidebar.collapsed .nav-item.active::before {
          height: 16px;
        }

        .sidebar.collapsed .nav-icon {
          width: auto;
          transform: scale(1.1);
          font-size: 20px;
        }

        .sidebar.collapsed .nav-item.active .nav-icon {
          transform: scale(1.2);
        }

        /* Hover effects */
        .nav-item:not(.active):hover {
          background: rgba(241, 245, 249, 0.8);
          color: #1e293b;
        }

        .nav-item:not(.active):hover .nav-icon {
          transform: scale(1.1);
          color: #2563eb;
        }

        .nav-item:not(.active):hover .nav-label {
          color: #1e293b;
        }

        /* Scrollbar Styles */
        .sidebar-nav::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar-nav::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-nav::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 4px;
        }

        .sidebar-nav::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </aside>
  );
}

export default function Sidebar(props: SidebarProps) {
  return (
    <Suspense fallback={<SidebarSkeleton />}>
      <SidebarContent {...props} />
    </Suspense>
  );
}