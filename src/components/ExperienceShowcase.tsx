"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { FaBriefcase, FaGraduationCap, FaStar } from 'react-icons/fa';
import ExperienceCard from '@/components/ExperienceCard';
import { ExperienceListApiResponse, IWorkExperience, IEducation } from '@/types/experience';

type TabKey = 'all' | 'work' | 'education';

interface ExperienceShowcaseProps {
  className?: string;
  initialTab?: TabKey;
  showFeaturedToggle?: boolean;
  limit?: number;
  title?: string;
  subtitle?: string;
}

export default function ExperienceShowcase({
  className = '',
  initialTab = 'all',
  showFeaturedToggle = true,
  limit = 9,
  title = 'Experience & Education',
  subtitle = 'Professional journey and academic background',
}: ExperienceShowcaseProps) {
  const [tab, setTab] = useState<TabKey>(initialTab);
  const [featuredOnly, setFeaturedOnly] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [work, setWork] = useState<IWorkExperience[]>([]);
  const [education, setEducation] = useState<IEducation[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams({ status: 'published', limit: String(limit) });
        if (featuredOnly) params.set('featured', 'true');
        const url = `/api/experience?${params.toString()}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to load experiences');
        const data: ExperienceListApiResponse = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to load experiences');
        if (data.data?.work || data.data?.education) {
          setWork((data.data.work || []) as IWorkExperience[]);
          setEducation((data.data.education || []) as IEducation[]);
        } else {
          const items = data.data?.experiences || [];
          setWork(items.filter(e => e.type === 'work') as IWorkExperience[]);
          setEducation(items.filter(e => e.type === 'education') as IEducation[]);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load experiences');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [featuredOnly, limit]);

  const filtered = useMemo(() => {
    if (tab === 'work') return { work, education: [] as IEducation[] };
    if (tab === 'education') return { work: [] as IWorkExperience[], education };
    return { work, education };
  }, [tab, work, education]);

  const tabs: { key: TabKey; label: string; icon: React.ElementType | null }[] = [
    { key: 'all', label: 'All', icon: null },
    { key: 'work', label: 'Work', icon: FaBriefcase },
    { key: 'education', label: 'Education', icon: FaGraduationCap },
  ];

  return (
    <section className={`py-12 md:py-16 px-4 ${className}`}>
      <div className="max-w-[1100px] mx-auto font-body">
        {/* Header */}
        <header className="text-center mb-10">
          <p className="font-mono text-[0.68rem] tracking-[0.25em] uppercase text-accent-orange mb-3 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-accent-orange opacity-50" />
            Professional Journey
            <span className="w-8 h-px bg-accent-orange opacity-50" />
          </p>
          <h2
            className="font-heading font-light text-ink mb-4 leading-[1.05]"
            style={{ fontSize: 'clamp(2.2rem,5vw,3.6rem)' }}
          >
            {title}
          </h2>
          <p className="text-[0.9rem] text-text-muted max-w-[54ch] mx-auto leading-[1.75] font-light">
            {subtitle}
          </p>
        </header>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-1.5 bg-off-white border border-cream-deeper rounded-full p-1 shadow-sm flex-wrap">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                role="tab"
                aria-selected={tab === key}
                className={`font-mono text-[0.72rem] tracking-wider uppercase px-5 py-2.5 rounded-full border-none flex items-center gap-2 whitespace-nowrap transition-all duration-250 cursor-pointer ${
                  tab === key
                    ? 'bg-ink text-off-white shadow-md'
                    : 'bg-transparent text-text-muted hover:text-ink'
                }`}
                onClick={() => setTab(key)}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {label}
              </button>
            ))}
          </div>

          {showFeaturedToggle && (
            <label className="inline-flex items-center gap-2 font-mono text-[0.65rem] tracking-wider uppercase text-text-muted select-none cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 accent-accent-orange"
                checked={featuredOnly}
                onChange={(e) => setFeaturedOnly(e.target.checked)}
                aria-label="Show featured only"
              />
              <FaStar className="text-[#c4841a] w-3 h-3" />
              <span>Featured only</span>
            </label>
          )}
        </div>

        {/* Panels */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-accent-orange border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {error && !loading && (
          <div className="text-center py-10">
            <p className="font-body text-[0.83rem] text-accent-orange">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-10">
            {(tab === 'all' || tab === 'work') && filtered.work.length > 0 && (
              <section>
                {tab === 'all' && (
                  <div className="flex items-center gap-3 px-4 py-3 mb-4 bg-off-white border border-cream-deeper rounded-xl">
                    <div className="w-9 h-9 rounded-lg bg-accent-orange/10 flex items-center justify-center shrink-0">
                      <FaBriefcase className="w-4 h-4 text-accent-orange" />
                    </div>
                    <div>
                      <h3 className="font-heading text-[1.1rem] font-semibold text-ink leading-none">Work Experience</h3>
                      <p className="font-mono text-[0.62rem] tracking-wider uppercase text-text-muted mt-0.5">Professional career journey</p>
                    </div>
                  </div>
                )}
                <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {filtered.work.map((exp) => (
                    <ExperienceCard key={exp._id} experience={exp} variant="compact" />
                  ))}
                </div>
              </section>
            )}

            {(tab === 'all' || tab === 'education') && filtered.education.length > 0 && (
              <section>
                {tab === 'all' && (
                  <div className="flex items-center gap-3 px-4 py-3 mb-4 bg-off-white border border-cream-deeper rounded-xl">
                    <div className="w-9 h-9 rounded-lg bg-accent-teal/10 flex items-center justify-center shrink-0">
                      <FaGraduationCap className="w-4 h-4 text-accent-teal" />
                    </div>
                    <div>
                      <h3 className="font-heading text-[1.1rem] font-semibold text-ink leading-none">Education</h3>
                      <p className="font-mono text-[0.62rem] tracking-wider uppercase text-text-muted mt-0.5">Academic background</p>
                    </div>
                  </div>
                )}
                <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {filtered.education.map((exp) => (
                    <ExperienceCard key={exp._id} experience={exp} variant="compact" />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
