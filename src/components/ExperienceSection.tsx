"use client";

import React, { useState, useEffect } from 'react';
import ExperienceCard from './ExperienceCard';
import LoadingScreen from './shared/LoadingScreen';
import { FaBriefcase, FaGraduationCap } from 'react-icons/fa';
import { IWorkExperience, IEducation, ExperienceType, ExperienceListApiResponse } from '@/types/experience';

interface ExperienceSectionProps {
  type?: ExperienceType | 'both';
  variant?: 'default' | 'compact' | 'detailed';
  showFeaturedOnly?: boolean;
  limit?: number;
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function ExperienceSection({ 
  type = 'both',
  variant = 'default',
  showFeaturedOnly = false,
  limit,
  title,
  subtitle,
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
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-gray-600">Loading experiences...</p>
    </div>
  );

  if (error) {
    console.error('❌ ExperienceSection: Rendering error state:', error);
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Unable to load experiences</p>
        <p className="text-gray-600 text-sm">Please make sure MongoDB is properly configured</p>
      </div>
    );
  }

  const hasWork = experiences.work.length > 0;
  const hasEducation = experiences.education.length > 0;
  const hasExperiences = hasWork || hasEducation;

  

  if (!hasExperiences) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No experiences found</p>
        <p className="text-gray-500 text-sm mt-2">Add some experiences in the dashboard</p>
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
    <section className={`py-12 md:py-16 px-4 ${className}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-1 md:mb-2 font-ui">
          <h2 className="text-h4 md:text-h3 weight-bold text-gray-900 mb-2">
            {title || getDefaultTitle()}
          </h2>
          <p className="text-body-sm text-gray-600 max-w-2xl mx-auto">
            {subtitle || getDefaultSubtitle()}
          </p>
        </header>

        {/* Work Experience Section */}
        {(type === 'both' || type === 'work') && hasWork && (
          <div className="mb-8">
            {type === 'both' && (
              <div className="flex items-center gap-3 mb-2 font-ui">
                <div className="p-1.5 rounded-lg icon-work-bg">
                  <FaBriefcase className="icon-md icon-work" />
                </div>
                <div>
                  <h3 className="text-h5 weight-semibold text-gray-900">Work Experience</h3>
                  <p className="text-caption text-gray-600">Professional career journey</p>
                </div>
              </div>
            )}
            <div className={`grid gap-6 ${
              variant === 'compact' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
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

        {/* Education Section */}
        {(type === 'both' || type === 'education') && hasEducation && (
          <div>
            {type === 'both' && (
              <div className="flex items-center gap-3 mb-2 font-ui">
                <div className="p-1.5 rounded-lg icon-edu-bg">
                  <FaGraduationCap className="icon-md icon-edu" />
                </div>
                <div>
                  <h3 className="text-h5 weight-semibold text-gray-900">Education</h3>
                  <p className="text-caption text-gray-600">Academic background and qualifications</p>
                </div>
              </div>
            )}
            <div className={`grid gap-6 ${
              variant === 'compact' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
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