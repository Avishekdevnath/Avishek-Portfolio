'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ExternalLink, LucideIcon } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';

export type NavCategory = 'Main' | 'Content' | 'Engagement' | 'System';

export interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
  description: string;
  category: NavCategory;
  children?: NavChildItem[];
}

export interface NavChildItem {
  label: string;
  href: string;
  description?: string;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  items: NavItem[];
}

interface NavItemProps {
  item: NavItem;
  isActive: boolean;
  isOpen: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

interface NavChildItemProps {
  child: NavChildItem;
  isActive: boolean;
  isOpen: boolean;
  depth?: number;
}

const NavChildItemComponent = ({ child, isActive, isOpen, depth = 0 }: NavChildItemProps) => {
  return (
    <Link
      href={child.href}
      className={`
        group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
        ${isActive
          ? 'bg-blue-50 text-blue-700'
          : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
        }
        ${!isOpen ? 'justify-center' : ''}
      `}
      title={!isOpen && child.description ? child.description : undefined}
      style={{ paddingLeft: isOpen ? `${12 + depth * 16}px` : undefined }}
    >
      {isOpen && (
        <span className="text-sm font-medium truncate flex-1">
          {child.label}
        </span>
      )}
    </Link>
  );
};

const NavItemComponent = ({ item, isActive, isOpen, isExpanded, onToggleExpand }: NavItemProps) => {
  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;
  
  const handleClick = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      onToggleExpand();
    }
  };
  
  return (
    <Link
      href={hasChildren ? '#' : item.href}
      onClick={handleClick}
      className={`
        group flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-200
        ${isActive 
          ? 'bg-blue-50 text-blue-700' 
          : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
        }
        ${!isOpen ? 'justify-center' : ''}
      `}
      title={!isOpen ? item.description : undefined}
    >
      <Icon 
        size={20} 
        className={`
          flex-shrink-0 transition-colors duration-200
          ${isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-600'}
        `}
      />
      {isOpen && (
        <>
          <span className="text-sm font-medium truncate flex-1">
            {item.label}
          </span>
          {hasChildren && (
            isExpanded ? (
              <ChevronUp size={16} className="text-gray-400" />
            ) : (
              <ChevronDown size={16} className="text-gray-400" />
            )
          )}
        </>
      )}
    </Link>
  );
};

function SidebarSkeleton() {
  return (
    <aside className="w-[280px] h-screen fixed top-0 left-0 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <div className="animate-pulse flex items-center gap-3">
          <div className="h-9 w-9 bg-blue-200 rounded-lg"></div>
          <div className="h-5 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>

      <div className="p-3">
        <div className="animate-pulse h-10 bg-gray-100 rounded-lg"></div>
      </div>

      <nav className="flex-1 p-3 space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="space-y-1">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}

function SidebarContent({ isOpen, onToggle, items }: SidebarProps) {
  const pathname = usePathname();
  const [fullName, setFullName] = useState('Portfolio Admin');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // Auto-expand items when viewing their child pages
  useEffect(() => {
    const toExpand: Record<string, boolean> = {};
    items.forEach(item => {
      if (item.children && item.children.length > 0) {
        const hasActiveChild = item.children.some(child => pathname.startsWith(child.href));
        const isCurrentPath = pathname.startsWith(item.href);
        if (hasActiveChild || isCurrentPath) {
          toExpand[item.href] = true;
        }
      }
    });
    if (Object.keys(toExpand).length > 0) {
      setExpandedItems(prev => ({ ...prev, ...toExpand }));
    }
  }, [pathname, items]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        if (data.success && data.data.fullName) {
          setFullName(data.data.fullName);
        }
      } catch (error) {
        // Failed to fetch settings
      }
    };
    fetchSettings();
  }, []);

  const isActive = (href: string, hasChildren?: boolean): boolean => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    // Parent items with children are only active when exactly on their href
    if (hasChildren) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const toggleExpand = (href: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [href]: !prev[href]
    }));
  };

  const groupedItems = items.reduce<Record<NavCategory, NavItem[]>>((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<NavCategory, NavItem[]>);

  return (
    <aside 
      className={`
        fixed top-16 left-0 h-[calc(100vh-64px)] bg-white border-r border-gray-200
        transition-all duration-300 ease-in-out z-20 flex flex-col
        ${isOpen ? 'w-[280px]' : 'w-[72px]'}
        md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-lg">{fullName.charAt(0)}</span>
          </div>
          {isOpen && (
            <h1 className="font-medium text-gray-900 truncate text-sm">
              {fullName}
            </h1>
          )}
        </div>
        <button
          onClick={onToggle}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* View Site Link */}
      <div className="p-3 flex-shrink-0">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={`
            flex items-center gap-2 px-3 py-2.5 rounded-lg
            text-gray-600 hover:text-gray-900 hover:bg-gray-50
            transition-all duration-200
            ${!isOpen ? 'justify-center' : ''}
          `}
        >
          <ExternalLink size={20} className="text-gray-400" />
          {isOpen && (
            <span className="text-sm font-medium">View Site</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {(Object.entries(groupedItems) as [NavCategory, NavItem[]][]).map(([category, categoryItems]) => (
          <div key={category} className="space-y-2">
            {isOpen && (
              <h2 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {category}
              </h2>
            )}
            <div className="space-y-1">
              {categoryItems.map((item) => (
                <div key={item.href}>
                  <NavItemComponent
                    item={item}
                    isActive={isActive(item.href, !!item.children)}
                    isOpen={isOpen}
                    isExpanded={!!expandedItems[item.href]}
                    onToggleExpand={() => toggleExpand(item.href)}
                  />
                  {/* Render child items */}
                  {isOpen && item.children && item.children.length > 0 && expandedItems[item.href] && (
                    <div className="mt-1 space-y-1">
                      {item.children.map((child) => (
                        <NavChildItemComponent
                          key={child.href}
                          child={child}
                          isActive={isActive(child.href)}
                          isOpen={isOpen}
                          depth={1}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile - Fixed at bottom */}
      {isOpen && (
        <div className="flex-shrink-0 border-t border-gray-100">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <span className="font-medium text-gray-600 text-sm">{fullName.charAt(0)}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{fullName}</p>
                <p className="text-xs text-gray-500 truncate">Admin</p>
              </div>
            </div>
          </div>
        </div>
      )}
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