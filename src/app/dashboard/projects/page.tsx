"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaFilter, FaStar } from 'react-icons/fa';
import { Project } from '@/types/dashboard';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchProjects();
  }, [currentPage, statusFilter, categoryFilter]);

  const fetchProjects = async () => {
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      });
      
      if (searchTerm) {
        queryParams.set('search', searchTerm);
      }
      if (statusFilter !== 'all') {
        queryParams.set('status', statusFilter);
      }
      if (categoryFilter !== 'all') {
        queryParams.set('category', categoryFilter);
      }

      const response = await fetch(`/api/projects?${queryParams}`, {
        headers: {
          'x-is-admin': 'true'
        }
      });
      const data = await response.json();

      if (data.success) {
        const projectsList = Array.isArray(data.data) ? data.data : (data.data.projects || []);
        setProjects(projectsList);
        
        // Extract unique categories
        const uniqueCategories = Array.from(new Set(projectsList.map((p: Project) => p.category)));
        setCategories(uniqueCategories as string[]);
        
        if (data.data.pagination) {
          setTotalPages(data.data.pagination.pages);
        }
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        fetchProjects();
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleToggleFeatured = async (projectId: string, currentFeatured: boolean) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ featured: !currentFeatured })
      });

      if (response.ok) {
        fetchProjects();
      }
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProjects();
  };

  return (
    <div className="p-6 font-ui">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-h2 text-gray-800">Projects</h1>
          <Link
            href="/dashboard/projects/new"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors text-button weight-medium"
          >
          <FaPlus className="icon-sm" /> New Project
          </Link>
        </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
          {/* Search Input */}
          <div className="flex-1 min-w-[280px]">
            <label className="block text-gray-700 text-caption weight-medium mb-2 uppercase tracking-wide">
              Search Projects
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <FaSearch className="icon-sm text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full !pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-body-sm"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <span className="text-xl leading-none">&times;</span>
                </button>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div className="min-w-[160px]">
            <label className="block text-gray-700 text-caption weight-medium mb-2 uppercase tracking-wide">
              Status
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <FaFilter className="icon-sm text-gray-400" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full !pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-body-sm"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="min-w-[160px]">
            <label className="block text-gray-700 text-caption weight-medium mb-2 uppercase tracking-wide">
              Category
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <FaFilter className="icon-sm text-gray-400" />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="block w-full !pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-body-sm"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Apply Button */}
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-button weight-medium"
            >
              Apply Filters
            </button>
            <button 
              type="button"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCategoryFilter('all');
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-button weight-medium"
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-table-header text-gray-600">Title</th>
                <th className="px-6 py-3 text-left text-table-header text-gray-600">Category</th>
                <th className="px-6 py-3 text-left text-table-header text-gray-600">Technologies</th>
                <th className="px-6 py-3 text-left text-table-header text-gray-600">Status</th>
                <th className="px-6 py-3 text-center text-table-header text-gray-600">Featured</th>
                <th className="px-6 py-3 text-right text-table-header text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500 text-table-cell">
                    Loading...
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500 text-table-cell">
                    No projects found
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="weight-medium text-gray-900 text-table-cell">{project.title}</span>
                        <span className="text-caption text-gray-500 line-clamp-1">
                          {project.shortDescription}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="chip-muted">
                        {project.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {project.technologies?.slice(0, 3).map((tech, idx) => (
                          <span 
                            key={idx}
                            className="chip-muted"
                          >
                            {tech.name}
                          </span>
                        ))}
                        {project.technologies?.length > 3 && (
                          <span className="text-caption text-gray-500 weight-medium">
                            +{project.technologies.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-caption weight-medium ${
                        project.status === 'published' 
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-yellow-50 text-yellow-700'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleFeatured(project._id, project.featured)}
                        className={`transition-colors ${
                          project.featured 
                            ? 'text-yellow-500 hover:text-yellow-600' 
                            : 'text-gray-300 hover:text-gray-400'
                        }`}
                        title={project.featured ? 'Remove from featured' : 'Mark as featured'}
                        aria-label={project.featured ? 'Remove from featured' : 'Mark as featured'}
                      >
                        <FaStar className="inline icon-sm" />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-3">
                        <Link
                          href={`/projects/${project._id}`}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          target="_blank"
                          aria-label="View project"
                        >
                          <FaEye className="inline icon-sm" />
                        </Link>
                        <Link
                          href={`/dashboard/projects/edit/${project._id}`}
                          className="text-blue-400 hover:text-blue-600 transition-colors"
                          aria-label="Edit project"
                        >
                          <FaEdit className="inline icon-sm" />
                        </Link>
                        <button
                          onClick={() => handleDelete(project._id)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                          aria-label="Delete project"
                        >
                          <FaTrash className="inline icon-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
            </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 flex justify-between items-center border-t border-gray-200">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-1.5 rounded-lg bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors text-button weight-medium"
            >
              Previous
            </button>
            <span className="text-body-sm text-gray-600 weight-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-1.5 rounded-lg bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors text-button weight-medium"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 