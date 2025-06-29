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
        console.log('🔄 ExperienceSection: Fetching experiences...', { type, showFeaturedOnly, limit });
        
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

        console.log('🌐 ExperienceSection: Fetching from URL:', url);

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch experiences');
        }
        
        const data: ExperienceListApiResponse = await response.json();
        console.log('📦 ExperienceSection: Received data:', {
          type,
          url,
          success: data.success,
          hasWork: 'work' in data.data,
          hasEducation: 'education' in data.data,
          hasExperiences: 'experiences' in data.data,
          workCount: data.data?.work?.length || data.data?.experiences?.filter(e => e.type === 'work').length || 0,
          educationCount: data.data?.education?.length || data.data?.experiences?.filter(e => e.type === 'education').length || 0
        });

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch experiences');
        }

        // Handle both response formats
        if (type === 'work') {
          const workExperiences = data.data?.experiences || [];
          console.log('💼 ExperienceSection: Setting work experiences:', workExperiences.length);
          setExperiences({
            work: workExperiences,
            education: []
          });
        } else if (type === 'education') {
          // Check if we have the education array in the response
          if (data.data?.education) {
            console.log('🎓 ExperienceSection: Setting education experiences from education array:', data.data.education.length);
            setExperiences({
              work: [],
              education: data.data.education
            });
          } else {
            const educationExperiences = data.data?.experiences || [];
            console.log('🎓 ExperienceSection: Setting education experiences from experiences array:', educationExperiences.length);
            setExperiences({
              work: [],
              education: educationExperiences
            });
          }
        } else {
          // For 'both', check if we have the new format or old format
          if ('work' in data.data) {
            console.log('🔄 ExperienceSection: Using combined format');
            setExperiences({
              work: data.data.work || [],
              education: data.data.education || []
            });
          } else {
            console.log('🔄 ExperienceSection: Using experiences array format');
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

        console.log('✅ ExperienceSection: State updated', { 
          type,
          workCount: experiences.work.length, 
          educationCount: experiences.education.length,
          hasWork: experiences.work.length > 0,
          hasEducation: experiences.education.length > 0
        });

      } catch (error) {
        console.error('❌ ExperienceSection Error:', error);
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

  console.log('🎯 ExperienceSection: Rendering with:', { 
    hasWork, 
    hasEducation, 
    workCount: experiences.work.length,
    educationCount: experiences.education.length,
    type
  });

  if (!hasExperiences) {
    console.log('⚠️ ExperienceSection: No experiences to show');
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
    return 'Experience & Education';
  };

  const getDefaultSubtitle = () => {
    if (type === 'work') return 'Professional journey and career highlights';
    if (type === 'education') return 'Academic background and qualifications';
    return 'Professional and academic background';
  };

  return (
    <section className={`py-16 px-4 ${className}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {title || getDefaultTitle()}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {subtitle || getDefaultSubtitle()}
              </p>
            )}
          </div>
        )}

        {/* Work Experience Section */}
        {(type === 'both' || type === 'work') && hasWork && (
          <div className="mb-12">
            {type === 'both' && (
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FaBriefcase className="text-2xl text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Work Experience</h3>
                  <p className="text-gray-600">Professional career journey</p>
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
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <FaGraduationCap className="text-2xl text-purple-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Education</h3>
                  <p className="text-gray-600">Academic background and qualifications</p>
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