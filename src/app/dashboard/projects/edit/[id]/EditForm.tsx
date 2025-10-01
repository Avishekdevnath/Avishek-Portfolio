"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Project, Technology, Repository, DemoURL } from '@/types/dashboard';
import { Trash2, Plus } from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/components/shared/RichTextEditor'), { ssr: false });

// Define enum options
const REPOSITORY_TYPES = ['github', 'gitlab', 'bitbucket', 'other'] as const;
const DEMO_TYPES = ['live', 'staging', 'demo', 'documentation'] as const;
const CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'Desktop Development',
  'NPM Package',
  'Python Package (pip)',
  'Library/Package',
  'Chrome Extension',
  'VS Code Extension',
  'CLI Tool',
  'Machine Learning',
  'Artificial Intelligence',
  'Data Science',
  'Data Engineering',
  'DevOps',
  'Cloud Computing',
  'Cyber Security',
  'Blockchain',
  'Game Development',
  'IoT',
  'Embedded Systems',
  'Computer Vision',
  'Natural Language Processing',
  'Robotics',
  'Augmented Reality',
  'Virtual Reality',
  'API Development',
  'Automation',
  'WordPress Plugin',
  'Browser Extension',
  'Other'
] as const;
const STATUS_OPTIONS = ['draft', 'published'] as const;

interface EditProjectFormProps {
  projectId: string;
}

type ProjectStatus = 'draft' | 'published';

export default function EditProjectForm({ projectId }: EditProjectFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string>('/placeholder-project.svg');
  const [imageUploading, setImageUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Project>({
    _id: '',
    title: '',
    description: '',
    shortDescription: '',
    image: '',
    imagePublicId: '',
    category: 'Web Development',
    status: 'draft',
    featured: false,
    technologies: [],
    repositories: [],
    demoUrls: [],
    completionDate: '',
    order: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const [lineSpacing, setLineSpacing] = useState('10');

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/projects/${projectId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch project');
      }

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Project not found');
      }

      const projectData = data.data;
      setFormData(projectData);
      setPreviewImage(projectData.image || '/placeholder-project.svg');
    } catch (err) {
      console.error('Error fetching project:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch project');
      
      // Redirect to projects list if project not found
      if (err instanceof Error && err.message === 'Project not found') {
        setTimeout(() => {
          router.push('/dashboard/projects');
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Validate required fields
      const requiredFields = {
        title: 'Title',
        description: 'Description',
        shortDescription: 'Short description',
        category: 'Category',
        technologies: 'Technologies',
        repositories: 'Repositories',
        image: 'Project image',
        imagePublicId: 'Image ID'
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([key]) => {
          if (key === 'technologies') return formData.technologies.length === 0;
          if (key === 'repositories') return formData.repositories.length === 0;
          return !formData[key as keyof Project];
        })
        .map(([, label]) => label);

      if (missingFields.length > 0) {
        throw new Error(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      }

      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details?.join(', ') || 'Failed to update project');
      }

      if (!data.success) {
        throw new Error(data.error || data.details?.join(', ') || 'Failed to update project');
      }

      router.push('/dashboard/projects');
    } catch (err) {
      console.error('Error updating project:', err);
      setError(err instanceof Error ? err.message : 'Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImageUploading(true);
      setError(null);

      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Create and send form data
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to upload image');
      }

      // Update form data with the new image
      setFormData(prev => ({
        ...prev,
        image: data.data.url,
        imagePublicId: data.data.public_id,
      }));
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      setPreviewImage(formData.image || '/placeholder-project.svg');
    } finally {
      setImageUploading(false);
    }
  };

  const addTechnology = () => {
    setFormData(prev => ({
      ...prev,
      technologies: [...prev.technologies, { name: '', icon: '' }]
    }));
  };

  const removeTechnology = (index: number) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter((_, i) => i !== index)
    }));
  };

  const updateTechnology = (index: number, field: keyof Technology, value: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.map((tech, i) => 
        i === index ? { ...tech, [field]: value } : tech
      )
    }));
  };

  const addRepository = () => {
    setFormData(prev => ({
      ...prev,
      repositories: [...prev.repositories, { name: '', url: '', type: 'github' }]
    }));
  };

  const removeRepository = (index: number) => {
    setFormData(prev => ({
      ...prev,
      repositories: prev.repositories.filter((_, i) => i !== index)
    }));
  };

  const updateRepository = (index: number, field: keyof Repository, value: string) => {
    setFormData(prev => ({
      ...prev,
      repositories: prev.repositories.map((repo, i) => 
        i === index ? { ...repo, [field]: value } : repo
      )
    }));
  };

  const addDemoUrl = () => {
    setFormData(prev => ({
      ...prev,
      demoUrls: [...prev.demoUrls, { name: '', url: '', type: 'live' }]
    }));
  };

  const removeDemoUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      demoUrls: prev.demoUrls.filter((_, i) => i !== index)
    }));
  };

  const updateDemoUrl = (index: number, field: keyof DemoURL, value: string) => {
    setFormData(prev => ({
      ...prev,
      demoUrls: prev.demoUrls.map((demo, i) => 
        i === index ? { ...demo, [field]: value } : demo
      )
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading project...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="Enter project title"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <RichTextEditor
          value={formData.description}
          onChange={(html: string) => setFormData({ ...formData, description: html })}
          lineSpacing={lineSpacing}
          onLineSpacingChange={(spacing: string) => setLineSpacing(spacing)}
          minHeight="250px"
          placeholder="Enter detailed project description..."
          className="border border-gray-300 rounded-md shadow-sm focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500"
        />
      </div>

      {/* Short Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Short Description
        </label>
        <textarea
          value={formData.shortDescription}
          onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          rows={3}
          placeholder="Enter a brief description of your project"
          required
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          required
        >
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Technologies */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="block text-body-sm weight-medium text-gray-700">
            Technologies & Packages <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={addTechnology}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-body-sm weight-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Plus className="icon-sm" />
            Add
          </button>
        </div>
        <div className="space-y-3">
          {formData.technologies.map((tech, index) => (
            <div key={index} className="flex flex-col sm:flex-row gap-3 items-start p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-full sm:flex-1">
                <input
                  type="text"
                  value={tech.name}
                  onChange={(e) => updateTechnology(index, 'name', e.target.value)}
                  className="block w-full px-3 py-2 text-body-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  placeholder="e.g., React, pandas, Docker"
                  required
                />
              </div>
              <div className="w-full sm:flex-1">
                <input
                  type="text"
                  value={tech.icon || ''}
                  onChange={(e) => updateTechnology(index, 'icon', e.target.value)}
                  className="block w-full px-3 py-2 text-body-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  placeholder="Icon URL (optional)"
                />
              </div>
              <button
                type="button"
                onClick={() => removeTechnology(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove technology"
              >
                <Trash2 className="icon-sm" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Repositories */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Repositories
        </label>
        {formData.repositories.map((repo, index) => (
          <div key={index} className="flex gap-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                value={repo.name}
                onChange={(e) => updateRepository(index, 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Repository name"
                required
              />
            </div>
            <div className="flex-1">
              <input
                type="url"
                value={repo.url}
                onChange={(e) => updateRepository(index, 'url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Repository URL"
                required
              />
            </div>
            <div>
              <select
                value={repo.type}
                onChange={(e) => updateRepository(index, 'type', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              >
                {REPOSITORY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => removeRepository(index)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addRepository}
          className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
        >
          <Plus size={20} />
          Add Repository
        </button>
      </div>

      {/* Demo URLs */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Demo URLs (Optional)
        </label>
        {formData.demoUrls.map((demo, index) => (
          <div key={index} className="flex gap-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                value={demo.name}
                onChange={(e) => updateDemoUrl(index, 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Demo name"
              />
            </div>
            <div className="flex-1">
              <input
                type="url"
                value={demo.url}
                onChange={(e) => updateDemoUrl(index, 'url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Demo URL"
              />
            </div>
            <div>
              <select
                value={demo.type}
                onChange={(e) => updateDemoUrl(index, 'type', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                {DEMO_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => removeDemoUrl(index)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addDemoUrl}
          className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
        >
          <Plus size={20} />
          Add Demo URL
        </button>
      </div>

      {/* Project Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Project Image *
        </label>
        <div className="flex items-start gap-4">
          <div className="relative w-48 h-32 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50">
            <Image
              src={previewImage}
              alt="Project preview"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500">
              <Plus size={16} />
              {formData.image ? 'Change Image' : 'Upload Image'}
              <input
                type="file"
                className="sr-only"
                accept="image/*"
                onChange={handleImageChange}
                disabled={imageUploading}
              />
            </label>
            {imageUploading && (
              <p className="text-sm text-gray-500">Uploading...</p>
            )}
            {formData.image && (
              <p className="text-xs text-gray-500">Current image uploaded</p>
            )}
          </div>
        </div>
      </div>

      {/* Completion Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Completion Date (Optional)
        </label>
        <input
          type="date"
          value={formData.completionDate ? (typeof formData.completionDate === 'string' ? formData.completionDate : new Date(formData.completionDate).toISOString().split('T')[0]) : ''}
          onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        />
      </div>

      {/* Featured */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="featured"
          checked={formData.featured}
          onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
        />
        <label htmlFor="featured" className="text-sm font-medium text-gray-700">
          Featured Project
        </label>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          required
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Project'}
        </button>
      </div>
    </form>
  );
} 