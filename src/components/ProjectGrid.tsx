import { useState } from 'react';
import { LayoutGrid, List, Filter, ArrowUpDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import ProjectCard from './ProjectCard';

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

interface Technology {
  name: string;
  icon?: string;
}

interface Repository {
  name: string;
  url: string;
  type: 'github' | 'gitlab' | 'bitbucket' | 'other';
}

interface DemoURL {
  name: string;
  url: string;
}

interface Project {
  _id: string;
  title: string;
  shortDescription: string;
  description: string;
  image: string;
  imagePublicId: string;
  technologies: Technology[];
  repositories: Repository[];
  demoUrls: DemoURL[];
  category: string;
  completionDate: string;
  featured: boolean;
  status: 'draft' | 'published';
  order?: number;
}

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

  // Sort projects safely
  const sortedProjects = [...(projects || [])].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return ((b.order || 0) - (a.order || 0)); // Handle missing order property
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

    return matchesSearch && matchesCategory && matchesStatus;
  });

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

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div className="w-48">
            <select
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
            <div className="w-48">
              <select
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
          <div className="w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="order">Default Order</option>
              <option value="date">Completion Date</option>
              <option value="title">Title</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${
                viewMode === 'grid'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${
                viewMode === 'list'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr' : 'space-y-4'}>
        {filteredProjects.map(project => (
          <ProjectCard
            key={project._id}
            project={project}
            isAdmin={isAdmin}
            onDelete={handleDelete}
            onFeatureToggle={handleFeatureToggle}
            onStatusToggle={handleStatusToggle}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No projects found.</p>
        </div>
      )}
    </div>
  );
} 