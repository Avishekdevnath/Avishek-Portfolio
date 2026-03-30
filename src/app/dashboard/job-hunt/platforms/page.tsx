'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Search, Plus, Trash2, ExternalLink, Layers, BookOpen, Star, Users } from 'lucide-react';
import ConfirmModal from '@/components/shared/ConfirmModal';

interface PlatformItem {
  _id: string;
  name: string;
  description?: string;
  url?: string;
  note?: string;
  needsReferral?: boolean;
  curatedJobsCount: number;
  isActive?: boolean;
  priorityScore?: number;
  reputationScore?: number;
  remoteFocusScore?: number;
  curationScore?: number;
  payPotentialScore?: number;
}

// Warm accent colors cycled per card (matches brand palette)
const CARD_ACCENTS = [
  { bg: '#fff1e9', fg: '#d4622a', border: '#fcd9c4', accent: '#d4622a' },
  { bg: '#f0f4ff', fg: '#4a6cf7', border: '#c7d4fd', accent: '#4a6cf7' },
  { bg: '#f0faf5', fg: '#2e7d52', border: '#b6e5cc', accent: '#2e7d52' },
  { bg: '#fffbea', fg: '#92600a', border: '#fde68a', accent: '#d97706' },
  { bg: '#f5f0ff', fg: '#6d28d9', border: '#ddd6fe', accent: '#7c3aed' },
  { bg: '#fff0f3', fg: '#be185d', border: '#fecdd3', accent: '#e11d48' },
];

function getInitials(name: string) {
  return name.split(/\s+/).map((w) => w[0]?.toUpperCase() || '').slice(0, 2).join('');
}

function prettify(value: string) {
  return value.split(' ').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}

export default function PlatformStorePage() {
  const router = useRouter();
  const [platforms, setPlatforms] = useState<PlatformItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'curated' | 'nourl'>('all');
  const [platformToDelete, setPlatformToDelete] = useState<PlatformItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch('/api/job-hunt/platforms');
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Failed to load');
        setPlatforms(Array.isArray(json.data) ? json.data : []);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to load platforms');
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, []);

  const totals = useMemo(() => ({
    total: platforms.length,
    curated: platforms.reduce((s, p) => s + (p.curatedJobsCount || 0), 0),
    selfApply: platforms.filter((p) => !p.needsReferral).length,
    referral: platforms.filter((p) => p.needsReferral).length,
  }), [platforms]);

  const filtered = useMemo(() => {
    let list = platforms;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
    }
    if (filter === 'curated') list = list.filter((p) => p.curatedJobsCount > 0);
    if (filter === 'nourl') list = list.filter((p) => !p.url);
    return list;
  }, [platforms, search, filter]);

  const handleDelete = async () => {
    if (!platformToDelete?._id) return;
    setDeletingId(platformToDelete._id);
    try {
      const res = await fetch(`/api/job-hunt/platforms/${platformToDelete._id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete');
      setPlatforms((prev) => prev.filter((p) => p._id !== platformToDelete._id));
      toast.success('Platform deleted');
      setPlatformToDelete(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete platform');
    } finally {
      setDeletingId(null);
    }
  };

  const STATS = [
    { label: 'Platforms', value: totals.total, Icon: Layers, color: 'text-[#d4622a] bg-[#fff1e9]' },
    { label: 'Curated Jobs', value: totals.curated, Icon: BookOpen, color: 'text-[#2e7d52] bg-[#f0faf5]' },
    { label: 'Self-apply', value: totals.selfApply, Icon: Star, color: 'text-[#92600a] bg-[#fffbea]' },
    { label: 'Need Referral', value: totals.referral, Icon: Users, color: 'text-[#6d28d9] bg-[#f5f0ff]' },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[0.6rem] font-mono tracking-[0.18em] uppercase text-[#8a7a6a]">Job Hunt</p>
          <h1 className="text-[1.45rem] font-semibold text-[#2a2118] leading-tight mt-0.5">
            Job <span className="text-[#d4622a] italic" style={{ fontStyle: 'italic' }}>Platforms</span>
          </h1>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="flex divide-x divide-[#e8e3db] border border-[#e8e3db] rounded-xl overflow-hidden bg-white shadow-sm">
        {STATS.map(({ label, value, Icon, color }) => (
          <div key={label} className="flex-1 flex items-center gap-3 px-5 py-4 hover:bg-[#faf8f4] transition-colors">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
              <Icon size={15} />
            </div>
            <div>
              <p className="text-xl font-semibold text-[#2a2118] leading-none">{value}</p>
              <p className="text-[0.6rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a7a6a]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search platforms…"
            className="w-full bg-white border border-[#e8e3db] rounded-lg pl-8 pr-3 py-2 text-[0.82rem] text-[#2a2118] focus:outline-none focus:ring-1 focus:ring-[#d4622a] focus:border-[#d4622a]"
          />
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1.5">
          {(['all', 'curated', 'nourl'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg border text-[0.75rem] font-medium transition-colors ${
                filter === f
                  ? 'bg-[#d4622a] text-white border-[#d4622a]'
                  : 'bg-white border-[#e8e3db] text-[#6b5c4e] hover:border-[#d4622a] hover:text-[#d4622a]'
              }`}
            >
              {f === 'all' ? 'All' : f === 'curated' ? 'Has Jobs' : 'No URL'}
            </button>
          ))}
        </div>

        <Link
          href="/dashboard/job-hunt/platforms/new"
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#2a2118] text-[#f0ece3] rounded-lg text-[0.78rem] font-medium hover:bg-[#d4622a] transition-colors"
        >
          <Plus size={13} /> Add Platform
        </Link>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-5 h-5 border-2 border-[#e8e3db] border-t-[#d4622a] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center bg-white border border-dashed border-[#d8cfc3] rounded-xl">
          <p className="text-[#8a7a6a] text-sm">{platforms.length === 0 ? 'No platforms yet' : 'No platforms match your search'}</p>
          {platforms.length === 0 && (
            <Link href="/dashboard/job-hunt/platforms/new"
              className="mt-4 inline-flex px-4 py-2 bg-[#d4622a] text-white text-sm rounded-lg hover:bg-[#c04d1a]">
              Add First Platform
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((platform, idx) => {
            const accent = CARD_ACCENTS[idx % CARD_ACCENTS.length];
            return (
              <div
                key={platform._id}
                className="group relative bg-white border border-[#e8e3db] rounded-2xl p-5 flex flex-col gap-0 overflow-hidden cursor-pointer hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
                style={{ animationDelay: `${idx * 0.04}s` }}
                onClick={() => router.push(`/dashboard/job-hunt/platforms/${platform._id}`)}
                onKeyDown={(e) => { if (e.key === 'Enter') router.push(`/dashboard/job-hunt/platforms/${platform._id}`); }}
                tabIndex={0}
                role="button"
              >
                {/* Top accent line on hover */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, transparent, ${accent.accent}, transparent)` }}
                />

                {/* Card top row */}
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 border"
                    style={{ background: accent.bg, color: accent.fg, borderColor: accent.border }}
                  >
                    {getInitials(platform.name)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[0.72rem] font-mono font-bold px-2 py-0.5 rounded-md ${
                      platform.priorityScore == null
                        ? 'bg-[#f3f1ee] text-[#c0b8ae]'
                        : platform.priorityScore >= 80 ? 'bg-[#f0faf5] text-[#2e7d52]'
                        : platform.priorityScore >= 60 ? 'bg-[#fffbea] text-[#92600a]'
                        : 'bg-[#fff1e9] text-[#d4622a]'
                    }`} title="Priority Score">
                      {platform.priorityScore ?? '—'}
                    </span>
                    <span className={`text-[0.6rem] font-mono tracking-[0.08em] uppercase px-2 py-1 rounded-md border ${
                      platform.curatedJobsCount > 0
                        ? 'bg-[#f0faf5] text-[#2e7d52] border-[#b6e5cc]'
                        : 'bg-[#f7f5f1] text-[#8a7a6a] border-[#e8e3db]'
                    }`}>
                      {platform.curatedJobsCount > 0 ? '● Active' : '○ Empty'}
                    </span>
                  </div>
                </div>

                {/* Name + desc */}
                <p className="text-[0.95rem] font-semibold text-[#2a2118] leading-snug mb-1">
                  {prettify(platform.name)}
                </p>
                <p className="text-[0.78rem] text-[#8a7a6a] leading-relaxed min-h-[36px] mb-0">
                  {platform.description || <span className="opacity-40 italic">No description added yet.</span>}
                </p>

                <hr className="border-[#f3f1ee] my-3.5" />

                {/* Stats row */}
                <div className="flex gap-5 mb-3">
                  <div>
                    <p className={`font-mono text-lg font-medium leading-none ${platform.curatedJobsCount > 0 ? 'text-[#d4622a]' : 'text-[#2a2118]'}`}>
                      {platform.curatedJobsCount}
                    </p>
                    <p className="text-[0.6rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] mt-0.5">Curated</p>
                  </div>
                  <div>
                    <p className="font-mono text-[0.82rem] font-medium leading-none text-[#2a2118] pt-0.5">
                      {platform.needsReferral ? 'Referral' : 'Self-apply'}
                    </p>
                    <p className="text-[0.6rem] font-mono tracking-[0.1em] uppercase text-[#8a7a6a] mt-0.5">Mode</p>
                  </div>
                </div>

                {/* Score mini-bars */}
                {(platform.reputationScore || platform.remoteFocusScore || platform.curationScore || platform.payPotentialScore) ? (
                  <div className="flex flex-wrap gap-x-3 gap-y-1.5 mb-3 bg-[#faf8f4] rounded-lg px-3 py-2">
                    {([
                      { label: 'Rep', val: platform.reputationScore },
                      { label: 'Remote', val: platform.remoteFocusScore },
                      { label: 'Vet', val: platform.curationScore },
                      { label: 'Pay', val: platform.payPotentialScore },
                    ] as const).map(({ label, val }) => val != null && (
                      <div key={label} className="flex items-center gap-1">
                        <span className="text-[0.55rem] font-mono uppercase tracking-wide text-[#8a7a6a] w-8">{label}</span>
                        <div className="flex gap-[2px]">
                          {[1,2,3,4,5].map((d) => (
                            <span key={d} className={`w-1.5 h-1.5 rounded-full ${val >= d ? 'bg-[#d4622a]' : 'bg-[#e8e3db]'}`} />
                          ))}
                        </div>
                        <span className="text-[0.6rem] font-mono text-[#6b5c4e] ml-0.5">{val}</span>
                      </div>
                    ))}
                  </div>
                ) : null}

                {/* No URL warning */}
                {!platform.url && (
                  <p className="text-[0.68rem] text-[#8a7a6a] border border-dashed border-[#ddd5c5] rounded-lg px-2.5 py-1.5 mb-3 bg-[#faf8f4]">
                    ⚠ No platform URL added yet
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/job-hunt/platforms/${platform._id}`); }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-[#fcd9c4] bg-[#fff1e9] text-[#d4622a] text-[0.72rem] font-medium hover:bg-[#fce0d0] transition-colors"
                  >
                    Details →
                  </button>
                  <Link
                    href={`/dashboard/job-hunt/bookmarks?platform=${encodeURIComponent(platform.name)}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-[#e8e3db] text-[#4a3728] text-[0.72rem] font-medium hover:bg-[#f3f1ee] transition-colors"
                  >
                    Jobs
                  </Link>
                  {platform.url && (
                    <a
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center justify-center w-9 h-9 rounded-lg border border-[#e8e3db] text-[#6b5c4e] hover:bg-[#f3f1ee] transition-colors"
                    >
                      <ExternalLink size={13} />
                    </a>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); setPlatformToDelete(platform); }}
                    disabled={deletingId === platform._id}
                    className="flex items-center justify-center w-9 h-9 rounded-lg border border-[#e8e3db] text-[#8a7a6a] hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={platformToDelete !== null}
        title="Delete platform?"
        description={platformToDelete ? `Delete "${prettify(platformToDelete.name)}"? This cannot be undone.` : undefined}
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => { if (!deletingId) setPlatformToDelete(null); }}
        loading={deletingId !== null}
      />
    </div>
  );
}
