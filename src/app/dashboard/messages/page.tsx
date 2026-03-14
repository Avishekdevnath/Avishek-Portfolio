'use client';

import { useEffect, useState, useMemo } from 'react';
import { Mail, Inbox, MailOpen, Archive, RefreshCw, Search, X, MessageSquare } from 'lucide-react';
import MessageRow from '@/components/dashboard/MessageRow';
import { MessageStatus } from '@/types/message';

interface MessageStats { total: number; unread: number; replied: number; archived: number; }

export interface MessageWithId {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
  readAt?: string | null;
  repliedAt?: string | null;
  replies: { message: string; sentAt: string; sentBy: 'user' | 'admin' }[];
}

const STAT_CARDS = [
  { key: 'all',      label: 'Total',    icon: Mail,           style: 'text-[#2d4eb3] bg-[#e8f0fc]' },
  { key: 'unread',   label: 'Unread',   icon: Inbox,          style: 'text-[#d4622a] bg-[#fdf0eb]' },
  { key: 'replied',  label: 'Replied',  icon: MessageSquare,  style: 'text-[#2a6b4f] bg-[#e6f2ee]' },
  { key: 'archived', label: 'Archived', icon: Archive,        style: 'text-[#6b5c4e] bg-[#f3f1ee]' },
] as const;

export default function MessagesPage() {
  const [messages, setMessages]   = useState<MessageWithId[]>([]);
  const [stats, setStats]         = useState<MessageStats>({ total: 0, unread: 0, replied: 0, archived: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  // ── filters ──
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOrder, setSortOrder]       = useState<'newest' | 'oldest'>('newest');

  const fetchMessages = async (silent = false) => {
    if (silent) setRefreshing(true); else setIsLoading(true);
    setError(null);
    try {
      const res  = await fetch('/api/messages');
      const data = await res.json();
      if (!res.ok) throw new Error('Failed to fetch messages');
      if (data.success) {
        setMessages(data.data.messages.map((m: any) => ({ ...m, _id: m._id.toString() })));
        setStats(data.data.stats);
      } else throw new Error(data.error || 'Failed to fetch messages');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch messages');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchMessages(); }, []);

  const handleStatusChange = async (id: string, status: MessageStatus) => {
    await fetch(`/api/messages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    await fetchMessages(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    await fetch(`/api/messages/${id}`, { method: 'DELETE' });
    await fetchMessages(true);
  };

  // ── client-side filtering ──
  const filtered = useMemo(() => {
    let list = [...messages];
    if (statusFilter !== 'all') list = list.filter(m => m.status === statusFilter);
    if (categoryFilter !== 'all') list = list.filter(m => m.subject === categoryFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      const d = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? -d : d;
    });
    return list;
  }, [messages, search, statusFilter, categoryFilter, sortOrder]);

  const hasFilters = !!(search || statusFilter !== 'all' || categoryFilter !== 'all');

  const statCount = (key: string) => {
    if (key === 'all') return stats.total;
    return stats[key as keyof MessageStats] ?? 0;
  };

  if (error) return (
    <div className="bg-[#fceaea] border border-[#f0b8b8] text-[#c0392b] px-5 py-4 rounded-xl flex items-center justify-between">
      <p className="text-[0.875rem]">{error}</p>
      <button onClick={() => fetchMessages()} className="flex items-center gap-1.5 text-[0.78rem] font-medium underline hover:no-underline">
        <RefreshCw size={13} /> Retry
      </button>
    </div>
  );

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <p className="font-mono text-[0.65rem] tracking-[0.15em] uppercase text-[#8a7a6a]">
          {isLoading ? 'Loading…' : `${filtered.length} of ${messages.length} message${messages.length !== 1 ? 's' : ''}`}
        </p>
        <button
          onClick={() => fetchMessages(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-[#ddd5c5] text-[#4a3728] rounded-lg text-[0.78rem] hover:border-[#2a2118] transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Stat cards (clickable filter shortcuts) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STAT_CARDS.map(({ key, label, icon: Icon, style }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(prev => prev === key ? 'all' : key)}
            className={`bg-white border rounded-xl p-4 shadow-sm flex items-center gap-3.5 text-left transition-all duration-200 hover:shadow-[0_4px_14px_rgba(74,55,40,0.1)] ${statusFilter === key ? 'border-[#d4622a] ring-1 ring-[#d4622a]/20' : 'border-[#e8e3db]'}`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${style}`}>
              <Icon size={15} />
            </div>
            <div>
              <p className="font-mono text-xl font-semibold text-[#2a2118] leading-none">
                {isLoading ? '–' : statCount(key)}
              </p>
              <p className="text-[0.7rem] text-[#8a7a6a] mt-0.5">{label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* ── Search + Filters ── */}
      <div className="bg-white border border-[#e8e3db] rounded-xl p-4 shadow-sm flex flex-wrap gap-3 items-end">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[0.65rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] mb-1.5">Search</label>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a7a6a] pointer-events-none" />
            <input
              type="text"
              placeholder="Name, email, subject or message…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pr-8 bg-[#faf8f4] border border-[#ddd5c5] rounded-lg py-2 text-[0.875rem] text-[#2a2118] focus:outline-none focus:border-[#d4622a] focus:ring-1 focus:ring-[#d4622a]/20 placeholder:text-[#8a7a6a]"
              style={{ paddingLeft: '2.25rem' }}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8a7a6a] hover:text-[#2a2118] transition-colors">
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="min-w-[130px]">
          <label className="block text-[0.65rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] mb-1.5">Status</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.875rem] text-[#2a2118] focus:outline-none focus:border-[#d4622a] focus:ring-1 focus:ring-[#d4622a]/20"
          >
            <option value="all">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Category */}
        <div className="min-w-[170px]">
          <label className="block text-[0.65rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] mb-1.5">Category</label>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.875rem] text-[#2a2118] focus:outline-none focus:border-[#d4622a] focus:ring-1 focus:ring-[#d4622a]/20"
          >
            <option value="all">All Categories</option>
            <option value="Job Opportunity">Job Opportunity</option>
            <option value="Project Collaboration">Project Collaboration</option>
            <option value="General Inquiry">General Inquiry</option>
          </select>
        </div>

        {/* Sort */}
        <div className="min-w-[130px]">
          <label className="block text-[0.65rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] mb-1.5">Sort</label>
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value as 'newest' | 'oldest')}
            className="w-full bg-[#faf8f4] border border-[#ddd5c5] rounded-lg px-3 py-2 text-[0.875rem] text-[#2a2118] focus:outline-none focus:border-[#d4622a] focus:ring-1 focus:ring-[#d4622a]/20"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {/* Clear filters */}
        {hasFilters && (
          <button
            onClick={() => { setSearch(''); setStatusFilter('all'); setCategoryFilter('all'); }}
            className="px-3.5 py-2 border border-[#ddd5c5] text-[#4a3728] rounded-lg text-[0.82rem] hover:border-[#2a2118] transition-colors flex items-center gap-1.5"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* ── Message list ── */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-[#e8e3db] border-t-[#d4622a] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#e8e3db] rounded-xl py-16 flex flex-col items-center gap-3">
          <Mail size={36} className="text-[#ddd5c5]" />
          <p className="font-body text-[0.875rem] font-medium text-[#2a2118]">
            {hasFilters ? 'No messages match your filters' : 'No messages yet'}
          </p>
          <p className="font-body text-[0.78rem] text-[#8a7a6a]">
            {hasFilters ? 'Try adjusting your search or filters' : 'Contact form submissions will appear here'}
          </p>
          {hasFilters && (
            <button
              onClick={() => { setSearch(''); setStatusFilter('all'); setCategoryFilter('all'); }}
              className="mt-1 px-4 py-1.5 border border-[#ddd5c5] text-[#4a3728] rounded-lg text-[0.78rem] hover:border-[#2a2118] transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(message => (
            <MessageRow
              key={message._id}
              message={message}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

    </div>
  );
}
