"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { FaBriefcase, FaGraduationCap, FaFilter, FaStar } from 'react-icons/fa';
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

  return (
    <section className={`py-12 md:py-16 px-4 ${className}`}>
      <div className="max-w-6xl mx-auto font-ui">
        <header className="text-center mb-6 md:mb-10">
          <h2 className="text-h4 md:text-h3 weight-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-body-sm text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        </header>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
          <div role="tablist" aria-label="Experience categories" className="inline-flex rounded-lg border border-gray-200 overflow-hidden bg-white">
            {([
              { key: 'all', label: 'All', icon: null },
              { key: 'work', label: 'Work', icon: FaBriefcase },
              { key: 'education', label: 'Education', icon: FaGraduationCap },
            ] as Array<{ key: TabKey; label: string; icon: any }>).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                role="tab"
                aria-selected={tab === key}
                aria-controls={`panel-${key}`}
                className={`px-4 py-2 text-sm inline-flex items-center gap-2 transition-colors ${
                  tab === key ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setTab(key)}
              >
                {Icon ? <Icon className={key === 'work' ? 'icon-sm icon-work' : key === 'education' ? 'icon-sm icon-edu' : 'icon-sm'} /> : <FaFilter className="icon-sm text-gray-400" />}
                <span className="weight-medium">{label}</span>
              </button>
            ))}
          </div>

          {showFeaturedToggle && (
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 select-none cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={featuredOnly}
                onChange={(e) => setFeaturedOnly(e.target.checked)}
                aria-label="Show featured only"
              />
              <FaStar className="text-yellow-400 icon-sm" />
              <span>Featured only</span>
            </label>
          )}
        </div>

        {/* Panels */}
        {loading && (
          <div className="text-center py-10 text-gray-600">Loading experiences…</div>
        )}
        {error && !loading && (
          <div className="text-center py-10 text-red-600">{error}</div>
        )}

        {!loading && !error && (
          <div className="space-y-10">
            {(tab === 'all' || tab === 'work') && filtered.work.length > 0 && (
              <section id="panel-work" aria-labelledby="tab-work">
                {tab === 'all' && (
                  <div className="flex items-center gap-3 mb-4 md:mb-6">
                    <div className="p-1.5 rounded-lg icon-work-bg">
                      <FaBriefcase className="icon-md icon-work" />
                    </div>
                    <div>
                      <h3 className="text-h5 weight-semibold text-gray-900">Work Experience</h3>
                      <p className="text-caption text-gray-600">Professional career journey</p>
                    </div>
                  </div>
                )}
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-center">
                  {filtered.work.map((exp) => (
                    <ExperienceCard key={exp._id} experience={exp} variant="compact" />
                  ))}
                </div>
              </section>
            )}

            {(tab === 'all' || tab === 'education') && filtered.education.length > 0 && (
              <section id="panel-education" aria-labelledby="tab-education">
                {tab === 'all' && (
                  <div className="flex items-center gap-3 mb-4 md:mb-6">
                    <div className="p-1.5 rounded-lg icon-edu-bg">
                      <FaGraduationCap className="icon-md icon-edu" />
                    </div>
                    <div>
                      <h3 className="text-h5 weight-semibold text-gray-900">Education</h3>
                      <p className="text-caption text-gray-600">Academic background and qualifications</p>
                    </div>
                  </div>
                )}
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-center">
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


