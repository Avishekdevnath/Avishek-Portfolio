import React, { useState, useEffect } from 'react';
import ExperienceCard from './ExperienceCard';
import LoadingScreen from './shared/LoadingScreen';
import { FaBriefcase, FaGraduationCap } from 'react-icons/fa';

interface Experience {
  _id: string;
  type: 'work' | 'education';
  title: string;
  organization: string;
  location: string;
  startDate: string | Date;
  endDate?: string | Date;
  isCurrent: boolean;
  description: string;
  featured: boolean;
  // Work-specific fields
  jobTitle?: string;
  level?: string;
  company?: string;
  employmentType?: string;
  technologies?: string[];
  achievements?: string[];
  responsibilities?: string[];
  website?: string;
  // Education-specific fields
  degree?: string;
  institution?: string;
  fieldOfStudy?: string;
  gpa?: number;
  maxGpa?: number;
  activities?: string[];
  honors?: string[];
  coursework?: string[];
}

interface ExperienceSectionProps {
  type?: 'work' | 'education' | 'both';
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
    work: Experience[];
    education: Experience[];
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
        
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch experiences');
        }

        if (type === 'work') {
          setExperiences({ work: data.data.workExperiences || [], education: [] });
        } else if (type === 'education') {
          setExperiences({ work: [], education: data.data.education || [] });
        } else {
          setExperiences({
            work: data.data.work || [],
            education: data.data.education || []
          });
        }

      } catch (error) {
        console.error('Error fetching experiences:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch experiences');
      } finally {
        setLoading(false);
      }
    };

    fetchExperiences();
  }, [type, showFeaturedOnly, limit]);

  if (loading) return <LoadingScreen />;
  if (error) return null;

  const hasWork = experiences.work.length > 0;
  const hasEducation = experiences.education.length > 0;
  const hasExperiences = hasWork || hasEducation;

  if (!hasExperiences) return null;

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