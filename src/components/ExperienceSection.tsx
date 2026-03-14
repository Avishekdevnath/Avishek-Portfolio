"use client";

import React, { useState, useEffect } from 'react';
import ExperienceCard from './ExperienceCard';
import { IWorkExperience, IEducation, ExperienceType, ExperienceListApiResponse } from '@/types/experience';

interface ExperienceSectionProps {
  type?: ExperienceType | 'both';
  variant?: 'default' | 'compact' | 'detailed';
  showFeaturedOnly?: boolean;
  limit?: number;
  title?: React.ReactNode;
  subtitle?: string;
  hideHeader?: boolean;
  gridClassName?: string;
  containerClassName?: string;
  className?: string;
}

export default function ExperienceSection({ 
  type = 'both',
  variant = 'default',
  showFeaturedOnly = false,
  limit,
  title,
  subtitle,
  hideHeader = false,
  gridClassName,
  containerClassName = '',
  className = ''
}: ExperienceSectionProps) {
  const [experiences, setExperiences] = useState<{
    work: IWorkExperience[];
    education: IEducation[];
  }>({ work: [], education: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        setLoading(true);
        
        
        const params = new URLSearchParams({
          status: 'published',
          ...(showFeaturedOnly && { featured: 'true' }),
          ...(limit && { limit: limit.toString() })
        });

        let url: string;
        if (type === 'work') {
          url = `/api/experience/work?${params}`;
        } else if (type === 'education') {
          url = `/api/experience/education?${params}`;
        } else {
          url = `/api/experience?${params}`;
        }

        

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch experiences');
        }
        
        const data: ExperienceListApiResponse = await response.json();
        

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch experiences');
        }

        // Handle both response formats
        if (type === 'work') {
          const workExperiences = (data.data?.experiences || []).filter(
            (exp): exp is IWorkExperience => exp.type === 'work'
          );
          setExperiences({
            work: workExperiences,
            education: []
          });
        } else if (type === 'education') {
          // Check if we have the education array in the response
          if (data.data?.education) {
            setExperiences({
              work: [],
              education: data.data.education
            });
          } else {
            const educationExperiences = (data.data?.experiences || []).filter(
              (exp): exp is IEducation => exp.type === 'education'
            );
            setExperiences({
              work: [],
              education: educationExperiences
            });
          }
        } else {
          // For 'both', check if we have the new format or old format
          if (data.data && 'work' in data.data) {
            setExperiences({
              work: data.data.work || [],
              education: data.data.education || []
            });
          } else {
            // Old format with experiences array
            const workExp = (data.data?.experiences || []).filter(
              (exp): exp is IWorkExperience => exp.type === 'work'
            );
            const eduExp = (data.data?.experiences || []).filter(
              (exp): exp is IEducation => exp.type === 'education'
            );
            setExperiences({
              work: workExp,
              education: eduExp
            });
          }
        }
        

      } catch (error) {
        
        setError(error instanceof Error ? error.message : 'Failed to fetch experiences');
      } finally {
        setLoading(false);
      }
    };

    fetchExperiences();
  }, [type, showFeaturedOnly, limit]);

  if (loading) return (
    <div className="flex items-center justify-center py-12 gap-3">
      <div className="w-4 h-4 border-2 border-cream-deeper border-t-accent-orange rounded-full animate-spin" />
      <p className="font-mono text-[0.65rem] tracking-[0.1em] uppercase text-text-muted">Loading…</p>
    </div>
  );

  if (error) {
    console.error('❌ ExperienceSection: Rendering error state:', error);
    return (
      <div className="text-center py-12">
        <p className="font-body text-[0.83rem] text-accent-orange mb-1">Unable to load experiences</p>
        <p className="font-mono text-[0.65rem] tracking-[0.06em] text-text-muted">Please make sure MongoDB is properly configured</p>
      </div>
    );
  }

  const hasWork = experiences.work.length > 0;
  const hasEducation = experiences.education.length > 0;
  const hasExperiences = hasWork || hasEducation;

  

  if (!hasExperiences) {
    return (
      <div className="text-center py-12">
        <p className="font-body text-[0.83rem] text-text-muted">No experiences found</p>
      </div>
    );
  }

  const getDefaultTitle = () => {
    if (type === 'work') return 'Work Experience';
    if (type === 'education') return 'Education';
    return '';
  };

  const getDefaultSubtitle = () => {
    if (type === 'work') return 'Professional journey and career highlights';
    if (type === 'education') return 'Academic background and qualifications';
    return '';
  };

  return (
    <section className={`${className}`}>
      <div className={containerClassName}>
        {/* Header */}
        {!hideHeader && (
          <div className="text-center mb-10">
            <p className="font-mono text-[0.68rem] tracking-[0.25em] uppercase text-accent-orange mb-3 flex items-center justify-center gap-3">
              <span className="w-8 h-px bg-accent-orange opacity-50" />
              {type === 'work' ? 'Career' : type === 'education' ? 'Academic' : 'Background'}
              <span className="w-8 h-px bg-accent-orange opacity-50" />
            </p>
            <h2
              className="font-heading font-light text-ink mb-4 leading-[1.05]"
              style={{ fontSize: 'clamp(2.2rem,5vw,3.6rem)' }}
            >
              {title || getDefaultTitle()}
            </h2>
            {(subtitle || getDefaultSubtitle()) && (
              <p className="font-body text-[0.9rem] text-text-muted max-w-[60ch] mx-auto leading-[1.7] font-light text-justify">
                {subtitle || getDefaultSubtitle()}
              </p>
            )}
          </div>
        )}

        {/* Work Experience */}
        {(type === 'both' || type === 'work') && hasWork && (
          <div className={type === 'both' ? 'mb-10' : ''}>
            {type === 'both' && (
              <p className="font-mono text-[0.65rem] tracking-[0.16em] uppercase text-accent-orange mb-5 flex items-center gap-2">
                <span className="w-4 h-px bg-accent-orange opacity-60" />
                Work Experience
              </p>
            )}
            <div className={`grid gap-4 ${
              gridClassName || (variant === 'compact'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1')
            }`}>
              {experiences.work.map((experience) => (
                <ExperienceCard
                  key={experience._id}
                  experience={experience}
                  variant={variant}
                />
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {(type === 'both' || type === 'education') && hasEducation && (
          <div>
            {type === 'both' && (
              <p className="font-mono text-[0.65rem] tracking-[0.16em] uppercase text-accent-teal mb-5 flex items-center gap-2">
                <span className="w-4 h-px bg-accent-teal opacity-60" />
                Education
              </p>
            )}
            <div className={`grid gap-4 ${
              gridClassName || (variant === 'compact'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1')
            }`}>
              {experiences.education.map((experience) => (
                <ExperienceCard
                  key={experience._id}
                  experience={experience}
                  variant={variant}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
} 
