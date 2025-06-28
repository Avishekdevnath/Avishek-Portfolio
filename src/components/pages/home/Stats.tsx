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
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  description: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, description }) => (
  <div className="bg-white p-6 rounded-xl shadow-md transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
    <div className="flex items-center justify-between mb-4">
      <div className="text-gray-600">{title}</div>
      <Icon className="text-2xl text-blue-500" />
    </div>
    <div className="text-3xl font-bold mb-2">
      <CountUp end={value} duration={2.5} />+
    </div>
    <div className="text-sm text-gray-500">{description}</div>
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
    <div className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h4 className="text-md text-gray-600">Career Highlights</h4>
          <h4 className="text-5xl font-bold text-black">Achievement Numbers</h4>
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
          <p className="text-gray-600 max-w-2xl mx-auto">
            {stats.tagline}
          </p>
        </div>
      </div>
    </div>
  );
} 