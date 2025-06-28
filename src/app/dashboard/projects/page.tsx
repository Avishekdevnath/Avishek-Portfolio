"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlusCircle, Eye, CheckCircle2, Clock, Star, BarChart2 } from 'lucide-react';
import ProjectGrid from '@/components/ProjectGrid';
import { Project } from '@/types/dashboard';
import LoadingScreen from '@/components/shared/LoadingScreen';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  className?: string;
}

function StatsCard({ title, value, icon: Icon, className = '' }: StatsCardProps) {
  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm ${className}`}>
      <div className="flex items-center gap-4">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
          <Icon size={24} />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    featured: 0
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch projects and stats
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch projects
      const projectsResponse = await fetch('/api/projects', {
        headers: {
          'x-is-admin': 'true'
        }
      });
      if (!projectsResponse.ok) {
        const data = await projectsResponse.json();
        throw new Error(data.error || 'Failed to fetch projects');
      }

      const projectsData = await projectsResponse.json();
      if (!projectsData.success) {
        throw new Error(projectsData.error || 'Failed to fetch projects');
      }

      // Handle both array and pagination object responses
      const projects = Array.isArray(projectsData.data) ? projectsData.data : (projectsData.data.projects || []);
      setProjects(projects);

      // Fetch stats
      const statsResponse = await fetch('/api/projects/stats', {
        headers: {
          'x-is-admin': 'true'
        }
      });
      if (!statsResponse.ok) {
        throw new Error('Failed to fetch stats');
      }

      const statsData = await statsResponse.json();
      if (statsData.success && statsData.overview) {
        setStats({
          total: statsData.overview.total || 0,
          published: statsData.overview.published || 0,
          draft: statsData.overview.draft || 0,
          featured: statsData.overview.featured || 0
        });
      } else {
        throw new Error('Invalid stats response format');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle project actions
  const handleEdit = (project: Project) => {
    router.push(`/dashboard/projects/edit/${project._id}`);
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete project');
      }

      await fetchData();
    } catch (err) {
      console.error('Error deleting project:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  const handleToggleFeature = async (projectId: string, featured: boolean) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ featured })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update project');
      }

      await fetchData();
    } catch (err) {
      console.error('Error updating project:', err);
      alert(err instanceof Error ? err.message : 'Failed to update project');
    }
  };

  return (
    <>
      {loading && <LoadingScreen type="projects" />}
      
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Projects Management</h1>
          <Link
            href="/dashboard/projects/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusCircle size={20} />
            Add New Project
          </Link>
        </div>

        {error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-8">
            <p className="font-medium">Error: {error}</p>
            <button 
              onClick={fetchData}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Total Projects"
                value={stats.total}
                icon={Eye}
                className="bg-blue-50 text-blue-600"
              />
              <StatsCard
                title="Published"
                value={stats.published}
                icon={CheckCircle2}
                className="bg-green-50 text-green-600"
              />
              <StatsCard
                title="Draft"
                value={stats.draft}
                icon={Clock}
                className="bg-yellow-50 text-yellow-600"
              />
              <StatsCard
                title="Featured"
                value={stats.featured}
                icon={Star}
                className="bg-purple-50 text-purple-600"
              />
            </div>

            {/* Projects Grid */}
            <ProjectGrid
              projects={projects}
              isAdmin={true}
              onProjectsChange={fetchData}
            />
          </>
        )}
      </div>
    </>
  );
} 