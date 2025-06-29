import { useState, useEffect } from 'react';
import { LayoutGrid, List, Filter, ArrowUpDown, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import ProjectCard from './ProjectCard';
import { Project, Technology, Repository, DemoURL } from '@/types/dashboard';

// Define enum options from the model
const CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'Desktop Development',
  'Machine Learning',
  'Data Science',
  'DevOps',
  'Blockchain',
  'Game Development',
  'IoT',
  'Other'
] as const;

const STATUS_OPTIONS = ['draft', 'published'] as const;

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
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [activeTechFilter, setActiveTechFilter] = useState<string>('');

  // Get unique technologies from all projects
  const allTechnologies = Array.from(
    new Set(
      projects
        .flatMap(project => project.technologies.map(tech => tech.name))
        .filter(Boolean)
    )
  ).sort();

  // Sort projects safely
  const sortedProjects = [...(projects || [])].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return (b.order - a.order);
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

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedStatus('');
    setActiveTechFilter('');
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to delete project');

      toast.success('Project deleted successfully');
      onProjectsChange?.();
      router.refresh();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete project');
    } finally {
      setIsLoading(false);
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
      console.error('Error updating project:', error);
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
      console.error('Error updating project:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update project status');
    } finally {
      setIsLoading(false);
    }
  };

  // Count active filters
  const activeFiltersCount = [
    searchTerm, 
    selectedCategory, 
    selectedStatus, 
    activeTechFilter
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Search and View Toggle */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchTerm && (
            <button 
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={() => setSearchTerm('')}
            >
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFiltersVisible(!isFiltersVisible)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
              activeFiltersCount > 0 
                ? 'border-blue-500 bg-blue-50 text-blue-600' 
                : 'border-gray-300 bg-white text-gray-700'
            } transition-colors`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                {activeFiltersCount}
              </span>
            )}
          </button>
          
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${
                viewMode === 'grid'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              } transition-colors`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${
                viewMode === 'list'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              } transition-colors`}
              aria-label="List view"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Filters */}
      {isFiltersVisible && (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm animate-fadeIn">
          <div className="flex flex-wrap gap-4 items-end">
            {/* Category Filter */}
            <div className="w-full sm:w-48">
              <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter (Admin Only) */}
            {isAdmin && (
              <div className="w-full sm:w-48">
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status-filter"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort */}
            <div className="w-full sm:w-48">
              <label htmlFor="sort-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                id="sort-filter"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="order">Default Order</option>
                <option value="date">Completion Date</option>
                <option value="title">Title</option>
              </select>
            </div>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Technology Pills */}
          {allTechnologies.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Technologies</p>
              <div className="flex flex-wrap gap-2">
                {allTechnologies.map(tech => (
                  <button
                    key={tech}
                    onClick={() => setActiveTechFilter(activeTechFilter === tech ? '' : tech)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      activeTechFilter === tech
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
          {activeFiltersCount > 0 ? ' with filters applied' : ''}
        </p>
      </div>

      {/* Projects Grid/List */}
      {filteredProjects.length > 0 ? (
        <div 
          className={`
            ${viewMode === 'grid' 
              ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr' 
              : 'space-y-4'
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
                onDelete={handleDelete}
                onFeatureToggle={handleFeatureToggle}
                onStatusToggle={handleStatusToggle}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-gray-100 rounded-full p-4 mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No projects found</h3>
          <p className="text-gray-600 max-w-md">
            {activeFiltersCount > 0 
              ? 'Try adjusting your filters or search term to find what you\'re looking for.'
              : 'There are no projects available at the moment.'}
          </p>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
} 