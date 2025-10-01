"use client";

import { useEffect, useState } from 'react';
import ProjectGrid from '@/components/ProjectGrid';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { Project } from '@/types/dashboard';
import LoadingScreen from '@/components/shared/LoadingScreen';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-orange-50 font-ui">
      <div className="pt-6">
        <Header />
      </div>
      
      <main className="relative">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-7xl mx-auto">
            {/* Page Title */}
            <div className="text-center mb-12">
              <h4 className="text-caption text-gray-500 mb-3 tracking-wider uppercase">Browse My Recent</h4>
              <h1 className="text-h3 md:text-h2 weight-bold text-gray-900 mb-6">
                Projects
              </h1>
              <p className="text-body-sm text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Explore a curated selection of my shipped work across web apps, tools, and experiments. Use search and filters to quickly find projects by technology, category, or status.
              </p>
            </div>
            
            {/* Inline error (non-blocking layout) */}
            {error && (
              <div className="mb-8 bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-2xl shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-red-900">Error loading projects</p>
                    <p className="text-sm mt-1 text-red-700">{error}</p>
                  </div>
                  <button
                    onClick={fetchProjects}
                    className="shrink-0 text-sm px-4 py-2 bg-red-100 text-red-800 rounded-xl hover:bg-red-200 transition-all duration-300 border border-red-300"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {/* Projects Grid */}
            {loading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div 
                    key={idx} 
                    className="bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-gray-300 overflow-hidden animate-pulse"
                    style={{
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div className="h-32 bg-gray-200" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-full" />
                      <div className="h-3 bg-gray-200 rounded w-5/6" />
                      <div className="flex gap-1.5 pt-1.5">
                        <div className="h-5 bg-gray-200 rounded-full w-12" />
                        <div className="h-5 bg-gray-200 rounded-full w-16" />
                        <div className="h-5 bg-gray-200 rounded-full w-14" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ProjectGrid
                projects={projects}
              />
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
