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
    customStats: Array<{
      title: string;
      value: number;
      description: string;
      icon: string;
    }>;
    tagline: string;
  };
  error?: string;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  description: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, description }) => (
  <div 
    className="bg-gradient-to-b from-gray-50 to-white p-6 rounded-2xl border border-gray-300 shadow-inner transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 font-ui"
    style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)'}}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="text-gray-600 text-sm font-medium">{title}</div>
      <div className="p-2 rounded-lg bg-white border border-gray-200 shadow-sm">
        <Icon className="text-xl text-blue-600" />
      </div>
    </div>
    <div className="text-h4 weight-bold mb-2 text-gray-900">
      <CountUp end={value} duration={2.5} />+
    </div>
    <div className="text-body-sm text-gray-600 leading-relaxed">{description}</div>
  </div>
);

export default function Stats() {
  const [stats, setStats] = useState<StatsResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data: StatsResponse = await response.json();
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch stats');
        }
        setStats(data.data);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[300px] flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const defaultStats = [
    {
      title: "Programming Languages",
      value: stats.programmingLanguages.value,
      icon: FaCode,
      description: stats.programmingLanguages.description
    },
    {
      title: "Projects Completed",
      value: stats.projectsCompleted.value,
      icon: FaLaptopCode,
      description: stats.projectsCompleted.description
    },
    {
      title: "Students Mentored",
      value: stats.studentsCount.value,
      icon: FaUserGraduate,
      description: stats.studentsCount.description
    },
    {
      title: "Work Experience",
      value: stats.workExperience.value,
      icon: FaBriefcase,
      description: stats.workExperience.description
    }
  ];

  return (
    <div className="py-16 px-4 bg-gradient-to-br from-stone-50 to-orange-50 font-ui">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h4 className="text-caption text-gray-500 mb-3 tracking-wider uppercase">Career Highlights</h4>
          <h2 className="text-h3 md:text-h2 weight-bold text-gray-900 mb-6">Achievement Numbers</h2>
          <p className="text-body-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Key metrics that showcase my professional growth and impact in software development and education.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {defaultStats.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              description={stat.description}
            />
          ))}
        </div>

        {/* Custom Stats if any */}
        {stats.customStats && stats.customStats.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            {stats.customStats.map((stat, index) => (
              <StatCard
                key={`custom-${index}`}
                title={stat.title}
                value={stat.value}
                icon={FaCode} // You might want to create a mapping for custom icons
                description={stat.description}
              />
            ))}
          </div>
        )}

        {/* Tagline */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-b from-gray-50 to-white p-8 rounded-2xl border border-gray-300 shadow-inner max-w-4xl mx-auto" style={{boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)'}}>
            <p className="text-body-sm text-gray-600 leading-relaxed">
              {stats.tagline}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 