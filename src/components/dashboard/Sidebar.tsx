'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ExternalLink, LucideIcon, X } from 'lucide-react';
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
  isOpen: boolean;   // mobile only: whether overlay is shown
  onToggle: () => void;
  items: NavItem[];
}

const CATEGORY_ORDER: NavCategory[] = ['Main', 'Content', 'Engagement', 'System'];

function SidebarSkeleton() {
  return (
    <aside className="fixed top-0 left-0 h-screen w-[240px] bg-[#16120e] border-r border-cream/[0.07] z-30 flex flex-col">
      <div className="px-5 py-[1.1rem] border-b border-cream/[0.07] flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent-orange/30 animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 bg-cream/10 rounded animate-pulse w-28" />
          <div className="h-2 bg-cream/[0.06] rounded animate-pulse w-20" />
        </div>
      </div>
      <div className="px-4 py-3">
        <div className="h-8 bg-cream/[0.04] rounded-lg animate-pulse" />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2 space-y-5">
        {[3, 6, 3, 1].map((count, g) => (
          <div key={g} className="space-y-1.5">
            <div className="h-2 w-12 bg-cream/[0.07] rounded animate-pulse mx-3" />
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="h-8 bg-cream/[0.04] rounded-lg animate-pulse mx-0" />
            ))}
          </div>
        ))}
      </div>
    </aside>
  );
}

function SidebarContent({ isOpen, onToggle, items }: SidebarProps) {
  const pathname = usePathname();
  const [fullName, setFullName] = useState('Avishek Devnath');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => { if (d.success && d.data?.fullName) setFullName(d.data.fullName); })
      .catch(() => {});
  }, []);

  // Auto-expand parent when a child route is active
  useEffect(() => {
    const toExpand: Record<string, boolean> = {};
    items.forEach(item => {
      if (item.children?.some(c => isChildActive(c.href, item.href))) {
        toExpand[item.href] = true;
      }
    });
    if (Object.keys(toExpand).length > 0) {
      setExpandedItems(prev => ({ ...prev, ...toExpand }));
    }
  }, [pathname, items]);

  const isActive = (href: string, hasChildren?: boolean) => {
    // Exact match for dashboard
    if (href === '/dashboard') return pathname === href;
    // For parent items with children, check if any child is active
    if (hasChildren) {
      return false; // Parent is not "active" by itself
    }
    // For standalone items, match exact path or if pathname starts with href followed by /
    if (pathname === href) return true;
    return pathname.startsWith(href + '/');
  };

  // Check if a parent has any active children
  const hasActiveChild = (item: NavItem): boolean => {
    if (!item.children) return false;
    return item.children.some((child) => isChildActive(child.href, item.href));
  };

  // Child route matching:
  // - exact match is always active
  // - nested match is active only for non-overview children
  //   (prevents '/dashboard/job-hunt' overview from also matching '/dashboard/job-hunt/leads')
  const isChildActive = (childHref: string, parentHref: string): boolean => {
    if (pathname === childHref) return true;
    if (childHref === parentHref) return false;
    return pathname.startsWith(childHref + '/');
  };

  const handleChildLinkClick = () => {
    // Close sidebar on mobile when a child link is clicked
    if (window.innerWidth < 768) {
      onToggle();
    }
  };

  const handleMainLinkClick = (hasChildren: boolean, href: string) => {
    if (!hasChildren) {
      // Close sidebar on mobile when a main link (non-parent) is clicked
      if (window.innerWidth < 768) {
        onToggle();
      }
    } else {
      // For parent items, just toggle expand
      toggleExpand(href);
    }
  };

  const toggleExpand = (href: string) => {
    setExpandedItems(prev => ({ ...prev, [href]: !prev[href] }));
  };

  const initials = fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const groupedItems = CATEGORY_ORDER.reduce<Record<NavCategory, NavItem[]>>((acc, cat) => {
    acc[cat] = items.filter(i => i.category === cat);
    return acc;
  }, {} as Record<NavCategory, NavItem[]>);

  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen w-[240px] z-30 flex flex-col
        bg-[#16120e] border-r border-cream/[0.07]
        transition-transform duration-300 ease-in-out
        md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      {/* ── Brand ── */}
      <div className="flex items-center justify-between gap-3 px-5 py-[1.15rem] border-b border-cream/[0.07] flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-accent-orange flex items-center justify-center flex-shrink-0">
            <span className="text-[0.68rem] font-bold text-white font-mono tracking-wide">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-[0.82rem] font-medium text-[#e8e2da] truncate leading-tight">{fullName}</p>
            <p className="text-[0.57rem] font-mono tracking-[0.13em] uppercase text-[#7a7268] mt-0.5">Software Engineer</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="md:hidden w-6 h-6 flex items-center justify-center rounded text-[#7a7268] hover:text-[#c8c2ba] transition-colors flex-shrink-0"
          aria-label="Close menu"
        >
          <X size={15} />
        </button>
      </div>

      {/* ── View Portfolio ── */}
      <div className="px-4 pt-3 pb-2 flex-shrink-0">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#9e9690] hover:text-accent-orange hover:bg-accent-orange/[0.06] transition-all duration-200"
        >
          <ExternalLink size={13} className="flex-shrink-0" />
          <span className="text-[0.72rem] font-mono tracking-wide">View Portfolio</span>
        </Link>
      </div>

      {/* ── Divider ── */}
      <div className="mx-4 h-px bg-cream/[0.07]" />

      {/* ── Navigation ── */}
      <nav
        className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-4"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(240,236,227,0.08) transparent' }}
      >
        {CATEGORY_ORDER.map(category => {
          const catItems = groupedItems[category] || [];
          if (catItems.length === 0) return null;

          return (
            <div key={category}>
              <p className="px-3 mb-1.5 text-[0.56rem] font-mono tracking-[0.22em] uppercase text-[#5e5550]">
                {category}
              </p>

              <div className="space-y-0.5">
                {catItems.map(item => {
                  const active = isActive(item.href, !!item.children);
                  const childActive = hasActiveChild(item);
                  const expanded = !!expandedItems[item.href];
                  const hasChildren = !!item.children?.length;
                  const Icon = item.icon;
                  const shouldHighlight = active || childActive;

                  return (
                    <div key={item.href}>
                      {/* Nav item row */}
                      <div className="relative">
                        {shouldHighlight && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2.5px] h-[18px] rounded-r-full bg-accent-orange pointer-events-none" />
                        )}
                        <Link
                          href={hasChildren ? '#' : item.href}
                          onClick={
                            hasChildren
                              ? e => { e.preventDefault(); handleMainLinkClick(true, item.href); }
                              : () => handleMainLinkClick(false, item.href)
                          }
                          className={`flex items-center gap-2.5 px-3 py-[0.4rem] rounded-lg transition-all duration-150 ${
                            shouldHighlight
                              ? 'text-accent-orange bg-accent-orange/[0.09]'
                              : 'text-[#b0a89e] hover:text-[#e8e2da] hover:bg-white/[0.05]'
                          }`}
                        >
                          <Icon size={15} className="flex-shrink-0" />
                          <span className="text-[0.82rem] flex-1 truncate">{item.label}</span>
                          {hasChildren && (
                            <ChevronDown
                              size={13}
                              className={`flex-shrink-0 transition-transform duration-200 ${
                                childActive ? 'text-accent-orange' : 'text-[#7a7268]'
                              } ${expanded ? 'rotate-180' : ''}`}
                            />
                          )}
                        </Link>
                      </div>

                      {/* Children */}
                      {hasChildren && expanded && (
                        <div
                          className="mt-0.5 ml-[22px] pl-3 space-y-0.5 border-l border-cream/[0.07]"
                        >
                          {item.children!.map(child => {
                            const childIsActive = isChildActive(child.href, item.href);
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={handleChildLinkClick}
                                className={`flex items-center gap-2 px-2 py-[0.3rem] rounded-md transition-all duration-150 text-[0.75rem] ${
                                  childIsActive
                                    ? 'text-accent-orange bg-accent-orange/[0.06]'
                                    : 'text-[#918980] hover:text-[#d4cec8] hover:bg-white/[0.03]'
                                }`}
                              >
                                <span
                                  className={`w-[5px] h-[5px] rounded-full flex-shrink-0 ${
                                    childIsActive ? 'bg-accent-orange' : 'bg-[#4a4440]'
                                  }`}
                                />
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* ── User footer ── */}
      <div className="flex-shrink-0 px-4 py-4 border-t border-cream/[0.07]">
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-[30px] h-[30px] rounded-full bg-cream/[0.07] border border-cream/[0.1] flex items-center justify-center flex-shrink-0">
            <span className="text-[0.6rem] font-mono font-medium text-[#9e9690]">{initials}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[0.78rem] text-[#c8c2ba] truncate leading-tight">{fullName}</p>
            <p className="text-[0.57rem] font-mono text-[#7a7268] mt-0.5">Admin</p>
          </div>
        </div>
      </div>
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
