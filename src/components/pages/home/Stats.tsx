'use client';

import React, { useEffect, useState } from 'react';
import { FaCode, FaUserGraduate, FaBriefcase, FaLaptopCode } from 'react-icons/fa';
import CountUp from 'react-countup';

interface StatData {
  value: number;
  description: string;
}

interface StatsResponse {
  success: boolean;
  data: {
    programmingLanguages: StatData;
    projectsCompleted: StatData;
    studentsCount: StatData;
    workExperience: StatData;
    customStats: Array<{ title: string; value: number; description: string; icon: string }>;
    tagline: string;
  };
  error?: string;
}

const ACCENT_COLORS = ['bg-accent-orange', 'bg-accent-teal', 'bg-accent-blue', 'bg-[#c4841a]'];
const ICON_BG = [
  'bg-accent-orange/10 text-accent-orange',
  'bg-accent-teal/10 text-accent-teal',
  'bg-accent-blue/10 text-accent-blue',
  'bg-[rgba(196,132,26,0.10)] text-[#c4841a]',
];

interface StatCardProps {
  title: string;
  value: number;
  suffix?: string;
  icon: React.ElementType;
  description: string;
  accentIdx: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, suffix = '+', icon: Icon, description, accentIdx }) => (
  <div className="relative bg-off-white border border-cream-deeper rounded-[0.9rem] px-6 py-6 hover:border-sand hover:shadow-lg transition-all duration-300 overflow-hidden group">
    <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${ACCENT_COLORS[accentIdx]} rounded-l-[0.9rem]`} />

    <div className="flex items-start justify-between mb-4">
      <p className="font-mono text-[0.62rem] tracking-[0.14em] uppercase text-text-muted leading-snug max-w-[70%]">
        {title}
      </p>
      <div className={`w-9 h-9 rounded-lg ${ICON_BG[accentIdx]} flex items-center justify-center shrink-0`}>
        <Icon className="w-4 h-4" />
      </div>
    </div>

    <div className="font-heading text-[2.6rem] font-semibold text-ink leading-none mb-2">
      <CountUp end={value} duration={2.5} />{suffix}
    </div>

    <p className="font-body text-[0.8rem] text-text-muted leading-[1.6] font-light text-justify">
      {description}
    </p>
  </div>
);

export default function Stats() {
  const [stats, setStats] = useState<StatsResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => { if (!r.ok) throw new Error('Failed to fetch stats'); return r.json(); })
      .then((data: StatsResponse) => {
        if (!data.success) throw new Error(data.error || 'Failed to fetch stats');
        setStats(data.data);
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to fetch stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-20 px-4 bg-off-white">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-12 space-y-3">
            <div className="h-3 w-28 bg-cream-deeper rounded-full mx-auto animate-pulse" />
            <div className="h-9 w-52 bg-cream-deeper rounded mx-auto animate-pulse" />
            <div className="h-4 w-72 bg-cream-deeper rounded mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-cream border border-cream-deeper rounded-[0.9rem] p-6 animate-pulse space-y-3">
                <div className="h-3 bg-cream-deeper rounded w-3/4" />
                <div className="h-8 bg-cream-deeper rounded w-1/2" />
                <div className="h-3 bg-cream-deeper rounded w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !stats) return null;

  const statCards = [
    { title: "Programming Languages", value: stats.programmingLanguages.value, icon: FaCode,         description: stats.programmingLanguages.description },
    { title: "Projects Completed",    value: stats.projectsCompleted.value,    icon: FaLaptopCode,   description: stats.projectsCompleted.description },
    { title: "Students Mentored",     value: stats.studentsCount.value,        icon: FaUserGraduate, description: stats.studentsCount.description },
    { title: "Work Experience",       value: stats.workExperience.value,       icon: FaBriefcase,    description: stats.workExperience.description },
  ];

  return (
    <section className="py-20 px-4 bg-off-white">
      <div className="max-w-[1100px] mx-auto">

        {/* ── Section header ── */}
        <div className="text-center mb-12">
          <p className="font-mono text-[0.68rem] tracking-[0.25em] uppercase text-accent-orange mb-3 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-accent-orange opacity-50" />
            Career Highlights
            <span className="w-8 h-px bg-accent-orange opacity-50" />
          </p>
          <h2
            className="font-heading font-light text-ink leading-[1.05] mb-4"
            style={{ fontSize: 'clamp(2.2rem,5vw,3.6rem)' }}
          >
            Achievement <em className="italic text-warm-brown">Numbers</em>
          </h2>
          <p className="text-[0.9rem] text-text-muted max-w-[54ch] mx-auto leading-[1.75] font-light text-justify">
            Key metrics that showcase my professional growth and impact in software development and education.
          </p>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((stat, i) => (
            <StatCard key={i} {...stat} accentIdx={i % ACCENT_COLORS.length} />
          ))}
        </div>

        {/* ── Custom stats ── */}
        {stats.customStats?.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
            {stats.customStats.map((stat, i) => (
              <StatCard
                key={`c-${i}`}
                title={stat.title}
                value={stat.value}
                icon={FaCode}
                description={stat.description}
                accentIdx={(statCards.length + i) % ACCENT_COLORS.length}
              />
            ))}
          </div>
        )}

        {/* ── Tagline ── */}
        {stats.tagline && (
          <div className="mt-10 text-center">
            <p className="font-heading italic font-light text-warm-brown text-[clamp(1rem,2vw,1.25rem)] leading-relaxed max-w-[65ch] mx-auto">
              &ldquo;{stats.tagline}&rdquo;
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
