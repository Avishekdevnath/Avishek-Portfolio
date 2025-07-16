"use client";

import { useEffect, useState } from 'react';
import ProjectGrid from '@/components/ProjectGrid';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { Project } from '@/types/dashboard';
import Loader from '@/components/shared/Loader';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/projects?status=published');
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch projects');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch projects');
      }

      // Handle both array and pagination object responses
      const projectsData = Array.isArray(data.data) ? data.data : (data.data.projects || []);
      setProjects(projectsData);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader text="Loading projects..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-lg w-full">
          <p className="font-medium">Error loading projects</p>
          <p className="text-sm mt-1">{error}</p>
          <button 
            onClick={fetchProjects}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="pt-6">
        <Header />
      </div>
      
      <main className="bg-gray-100">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-7xl mx-auto">
            {/* Page Title */}
            <div className="text-center mb-12">
              <h4 className="text-md text-gray-600 mb-2">Browse My Recent</h4>
              <h1 className="text-5xl font-bold text-black">Projects</h1>
            </div>
            
            {/* Projects Grid */}
            <ProjectGrid
              projects={projects}
              defaultStatus="published" // Only show published projects on public page
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
