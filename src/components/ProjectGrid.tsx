"use client";

import { useState } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import ProjectCard from './ProjectCard';
import SearchFilter from './SearchFilter';
import { Project } from '@/types/dashboard';
import ConfirmModal from './shared/ConfirmModal';

interface ProjectGridProps {
  projects?: Project[];
  isAdmin?: boolean;
  defaultCategory?: string;
  defaultStatus?: string;
  defaultSearch?: string;
  onProjectsChange?: () => void;
}

export default function ProjectGrid({
  projects = [],
  isAdmin = false,
  defaultCategory = '',
  defaultStatus = '',
  defaultSearch = '',
  onProjectsChange
}: ProjectGridProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(defaultSearch);
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [selectedStatus, setSelectedStatus] = useState(defaultStatus);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'order'>('order');
  const [activeTechFilter, setActiveTechFilter] = useState<string>('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const projectList = Array.isArray(projects) ? projects : [];

  // Get unique technologies from all projects
  const allTechnologies = Array.from(
    new Set(
      projectList
        .flatMap(project => project.technologies.map(tech => tech.name))
        .filter(Boolean)
    )
  ).sort();

  // Compute category counts from all projects
  const categoryCounts: Record<string, number> = {};
  projectList.forEach(p => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });

  // Sort projects
  const sortedProjects = [...projectList].sort((a, b) => {
    switch (sortBy) {
      case 'date': {
        const aTime = a.completionDate ? new Date(a.completionDate as any).getTime() : 0;
        const bTime = b.completionDate ? new Date(b.completionDate as any).getTime() : 0;
        return bTime - aTime;
      }
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return (a.order - b.order);
    }
  });

  // Filter projects
  const filteredProjects = sortedProjects.filter(project => {
    const matchesSearch = !searchTerm ||
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.technologies.some(tech =>
        tech.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory = !selectedCategory || project.category === selectedCategory;
    const matchesStatus = !selectedStatus || project.status === selectedStatus;
    const matchesTech = !activeTechFilter ||
      project.technologies.some(tech => tech.name === activeTechFilter);

    return matchesSearch && matchesCategory && matchesStatus && matchesTech;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedStatus('');
    setActiveTechFilter('');
  };

  const handleDeleteRequest = (projectId: string) => {
    setProjectToDelete(projectId);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectToDelete}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to delete project');
      toast.success('Project deleted successfully');
      onProjectsChange?.();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete project');
    } finally {
      setIsLoading(false);
      setDeleteModalOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleFeatureToggle = async (projectId: string) => {
    setIsLoading(true);
    try {
      const project = projects?.find(p => p._id === projectId);
      if (!project) throw new Error('Project not found');

      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !project.featured })
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to update project');

      toast.success(`Project ${project.featured ? 'removed from' : 'added to'} featured`);
      onProjectsChange?.();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusToggle = async (projectId: string) => {
    setIsLoading(true);
    try {
      const project = projects?.find(p => p._id === projectId);
      if (!project) throw new Error('Project not found');

      const newStatus = project.status === 'published' ? 'draft' : 'published';
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to update project');

      toast.success(`Project ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`);
      onProjectsChange?.();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update project status');
    } finally {
      setIsLoading(false);
    }
  };

  const activeFiltersCount = [
    searchTerm,
    selectedCategory,
    selectedStatus,
    activeTechFilter
  ].filter(Boolean).length;

  return (
    <div className="space-y-0 font-body">
      <SearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        sortBy={sortBy}
        setSortBy={setSortBy}
        activeTechFilter={activeTechFilter}
        setActiveTechFilter={setActiveTechFilter}
        allTechnologies={allTechnologies}
        viewMode={viewMode}
        setViewMode={setViewMode}
        isAdmin={isAdmin}
        onClearFilters={clearFilters}
        activeFiltersCount={activeFiltersCount}
        categoryCounts={categoryCounts}
        totalCount={projectList.length}
        filteredCount={filteredProjects.length}
      />

      {/* Projects Grid/List */}
      {filteredProjects.length > 0 ? (
        <div
          className={`
            ${viewMode === 'grid'
              ? 'grid grid-cols-1 gap-[1.15rem] sm:grid-cols-2 lg:grid-cols-3'
              : 'grid grid-cols-1 gap-[1.15rem]'
            }
            transition-all duration-300
          `}
        >
          {filteredProjects.map(project => (
            <div
              key={project._id}
              className={`transition-all duration-500 animate-fadeIn ${
                viewMode === 'list' ? 'max-w-full' : ''
              }`}
            >
              <ProjectCard
                project={project}
                isAdmin={isAdmin}
                onDelete={() => handleDeleteRequest(project._id)}
                onFeatureToggle={handleFeatureToggle}
                onStatusToggle={handleStatusToggle}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="col-span-full text-center py-16">
          <div className="text-[2rem] opacity-[0.22] mb-2">🔍</div>
          <p className="text-[0.88rem] text-text-muted font-light">
            {activeFiltersCount > 0
              ? 'No projects match your search. Try adjusting your filters.'
              : 'No projects available at the moment.'}
          </p>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="mt-4 px-5 py-2 bg-off-white text-text-muted rounded-full border-[1.5px] border-cream-deeper hover:border-sand hover:text-ink transition-all duration-200 text-[0.8rem] font-medium font-body"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={deleteModalOpen}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => { setDeleteModalOpen(false); setProjectToDelete(null); }}
        loading={isLoading}
      />
    </div>
  );
}
