"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Project, ITechnology, IRepository, IDemoURL } from '@/types/dashboard';
import { Trash2, Plus } from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// Import rich text editor dynamically
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

// Define enum options
const REPOSITORY_TYPES = ['github', 'gitlab', 'bitbucket', 'other'] as const;
const DEMO_TYPES = ['live', 'staging', 'demo', 'documentation'] as const;
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

interface EditProjectFormProps {
  projectId: string;
}

export default function EditProjectForm({ projectId }: EditProjectFormProps) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
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
    completionDate: new Date().toISOString().split('T')[0]
  });

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

      const project = data.data;
      setProject(project);
      setFormData(project);
      setPreviewImage(project.image || '/placeholder-project.svg');
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
        imagePublicId: 'Image ID',
        completionDate: 'Completion date'
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([key, label]) => {
          if (key === 'technologies') return formData.technologies.length === 0;
          if (key === 'repositories') return formData.repositories.length === 0;
          return !formData[key as keyof Project];
        })
        .map(([_, label]) => label);

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

      // Keep the preview as the uploaded image URL
      setPreviewImage(data.data.url);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      setPreviewImage(formData.image || '/placeholder-project.svg');
      // Clear the file input
      e.target.value = '';
    } finally {
      setImageUploading(false);
    }
  };

  const addTechnology = () => {
    setFormData(prev => ({
      ...prev,
      technologies: [...prev.technologies, { name: '' }]
    }));
  };

  const removeTechnology = (index: number) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter((_, i) => i !== index)
    }));
  };

  const updateTechnology = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.map((tech, i) => 
        i === index ? { ...tech, name: value } : tech
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

  const updateRepository = (index: number, field: keyof IRepository, value: string) => {
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
      demoUrls: [...prev.demoUrls, { name: '', url: '' }]
    }));
  };

  const removeDemoUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      demoUrls: prev.demoUrls.filter((_, i) => i !== index)
    }));
  };

  const updateDemoUrl = (index: number, field: keyof IDemoURL, value: string) => {
    setFormData(prev => ({
      ...prev,
      demoUrls: prev.demoUrls.map((demo, i) => 
        i === index ? { ...demo, [field]: value } : demo
      )
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      {/* Description - Rich Text Editor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <ReactQuill
          value={formData.description}
          onChange={(value) => setFormData({ ...formData, description: value })}
          className="bg-white"
          theme="snow"
          modules={{
            toolbar: [
              [{ 'header': [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              ['blockquote', 'code-block'],
              ['link'],
              ['clean']
            ],
          }}
          formats={[
            'header', 'bold', 'italic', 'underline', 'strike',
            'list', 'bullet', 'blockquote', 'code-block', 'link'
          ]}
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
          rows={2}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Project Image
        </label>
        <div className="flex items-start gap-4">
          {/* Preview */}
          <div className="relative w-40 h-40 bg-gray-100 rounded-lg overflow-hidden">
            {previewImage ? (
              <Image
                src={previewImage}
                alt="Project preview"
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No image
              </div>
            )}
            {imageUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </div>
          {/* Upload Input */}
          <div className="flex-1">
            <input
              type="file"
              onChange={handleImageChange}
              accept="image/jpeg,image/png,image/webp"
              className="w-full"
            />
            <p className="mt-1 text-sm text-gray-500">
              Recommended size: 1200x800px. Max size: 5MB.
            </p>
          </div>
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">Select a category</option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Featured */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="featured"
          checked={formData.featured}
          onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="featured" className="text-sm font-medium text-gray-700">
          Featured Project
        </label>
      </div>

      {/* Technologies */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Technologies
          </label>
          <button
            type="button"
            onClick={addTechnology}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Plus size={16} />
            Add Technology
          </button>
        </div>
        <div className="space-y-2">
          {formData.technologies.map((tech, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={tech.name}
                onChange={(e) => updateTechnology(index, e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., React, Node.js, etc."
              />
              <button
                type="button"
                onClick={() => removeTechnology(index)}
                className="p-2 text-red-600 hover:text-red-700"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Repositories */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Repositories
          </label>
          <button
            type="button"
            onClick={addRepository}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Plus size={16} />
            Add Repository
          </button>
        </div>
        <div className="space-y-4">
          {formData.repositories.map((repo, index) => (
            <div key={index} className="flex gap-2">
              <select
                value={repo.type}
                onChange={(e) => updateRepository(index, 'type', e.target.value)}
                className="w-40 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select type</option>
                {REPOSITORY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
              <input
                type="url"
                value={repo.url}
                onChange={(e) => updateRepository(index, 'url', e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Repository URL"
              />
              <input
                type="text"
                value={repo.name || ''}
                onChange={(e) => updateRepository(index, 'name', e.target.value)}
                className="w-40 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Label (optional)"
              />
              <button
                type="button"
                onClick={() => removeRepository(index)}
                className="p-2 text-red-600 hover:text-red-700"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Demo URLs */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Demo URLs
          </label>
          <button
            type="button"
            onClick={addDemoUrl}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Plus size={16} />
            Add Demo URL
          </button>
        </div>
        <div className="space-y-4">
          {formData.demoUrls.map((demo, index) => (
            <div key={index} className="flex gap-2">
              <select
                value={demo.name}
                onChange={(e) => updateDemoUrl(index, 'name', e.target.value)}
                className="w-40 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select type</option>
                {DEMO_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
              <input
                type="url"
                value={demo.url}
                onChange={(e) => updateDemoUrl(index, 'url', e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Demo URL"
              />
              <button
                type="button"
                onClick={() => removeDemoUrl(index)}
                className="p-2 text-red-600 hover:text-red-700"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.push('/dashboard/projects')}
          className="px-4 py-2 text-gray-700 hover:text-gray-900"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || imageUploading}
          className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
            (saving || imageUploading) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
} 