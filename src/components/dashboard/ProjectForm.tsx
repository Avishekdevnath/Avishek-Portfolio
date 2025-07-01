"use client";

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { FiUpload, FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import { uploadImage } from '@/lib/cloudinary';
import { FaSave, FaTimes } from 'react-icons/fa';

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
];

const REPOSITORY_TYPES = [
  { value: 'github', label: 'GitHub' },
  { value: 'gitlab', label: 'GitLab' },
  { value: 'bitbucket', label: 'Bitbucket' },
  { value: 'other', label: 'Other' }
];

const DEMO_TYPES = [
  { value: 'live', label: 'Live Site' },
  { value: 'staging', label: 'Staging' },
  { value: 'demo', label: 'Demo' },
  { value: 'documentation', label: 'Documentation' }
];

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
  type: 'live' | 'staging' | 'demo' | 'documentation';
}

interface ProjectFormProps {
  initialData?: {
    _id?: string;
    title?: string;
    description?: string;
    shortDescription?: string;
    category?: string;
    technologies?: Technology[];
    repositories?: Repository[];
    demoUrls?: DemoURL[];
    image?: string;
    imagePublicId?: string;
    completionDate?: string;
    featured?: boolean;
    status?: 'draft' | 'published';
  };
  isEdit?: boolean;
}

export default function ProjectForm({ initialData, isEdit = false }: ProjectFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(initialData?.image || '');

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    shortDescription: initialData?.shortDescription || '',
    category: initialData?.category || CATEGORIES[0],
    technologies: initialData?.technologies || [{ name: '', icon: '' }],
    repositories: initialData?.repositories || [{ name: '', url: '', type: 'github' }],
    demoUrls: initialData?.demoUrls || [{ name: '', url: '', type: 'live' }],
    image: initialData?.image || '',
    imagePublicId: initialData?.imagePublicId || '',
    completionDate: initialData?.completionDate ? new Date(initialData.completionDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    featured: initialData?.featured || false,
    status: initialData?.status || 'draft'
  });

  // Handle form field changes
  const handleChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Handle array field changes (technologies, repositories, demoUrls)
  const handleArrayFieldChange = useCallback((field: string, index: number, key: string, value: string) => {
    setFormData(prev => {
      const array = [...prev[field as keyof typeof prev] as any[]];
      array[index] = { ...array[index], [key]: value };
      return { ...prev, [field]: array };
    });
  }, []);

  // Add new item to array fields
  const handleAddArrayItem = useCallback((field: string) => {
    setFormData(prev => {
      const defaultItems = {
        technologies: { name: '', icon: '' },
        repositories: { name: '', url: '', type: 'github' },
        demoUrls: { name: '', url: '', type: 'live' }
      };
      return {
        ...prev,
        [field]: [...(prev[field as keyof typeof prev] as any[]), defaultItems[field as keyof typeof defaultItems]]
      };
    });
  }, []);

  // Remove item from array fields
  const handleRemoveArrayItem = useCallback((field: string, index: number) => {
    setFormData(prev => {
      const array = [...prev[field as keyof typeof prev] as any[]];
      array.splice(index, 1);
      return { ...prev, [field]: array };
    });
  }, []);

  // Handle image upload
  const handleImageChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      
      // Show preview immediately
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to upload image');

      // Update form data with the new image
      setFormData(prev => ({
        ...prev,
        image: data.data.url,
        imagePublicId: data.data.public_id,
      }));

      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
      // Reset preview and file
      setImagePreview(formData.image || '');
      setImageFile(null);
    } finally {
      setIsLoading(false);
    }
  }, [formData.image]);

  // Media upload for Quill editor (images & videos)
  const handleEditorMediaUpload = async (file: File): Promise<string> => {
    try {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      if (!isImage && !isVideo) throw new Error('Unsupported file type');

      const maxSize = isImage ? 5 * 1024 * 1024 : 100 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error(`File size must be less than ${isImage ? '5MB' : '100MB'}`);
      }

      const form = new FormData();
      form.append(isImage ? 'image' : 'video', file);
      const endpoint = isImage ? '/api/blogs/upload-image' : '/api/blogs/upload-video';
      const res = await fetch(endpoint, { method: 'POST', body: form });
      const data = await res.json();
      if (data.success) return data.url as string;
      throw new Error(data.error || 'Failed to upload');
    } catch (err) {
      console.error('Media upload error', err);
      toast.error(err instanceof Error ? err.message : 'Upload failed');
      throw err; // Re-throw the error instead of returning null
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

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
          return !formData[key as keyof typeof formData];
        })
        .map(([_, label]) => label);

      if (missingFields.length > 0) {
        toast.error(`Please fill in the following required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Prepare data for submission
      const projectData = {
        ...formData,
        technologies: formData.technologies.filter(tech => tech.name.trim() !== ''),
        repositories: formData.repositories.filter(repo => repo.name.trim() !== '' && repo.url.trim() !== ''),
        demoUrls: formData.demoUrls.filter(demo => demo.name.trim() !== '' && demo.url.trim() !== '')
      };

      // Make API request
      const url = isEdit && initialData?._id
        ? `/api/projects/${initialData._id}`
        : '/api/projects';

      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save project');
      }

      toast.success(isEdit ? 'Project updated successfully' : 'Project created successfully');
      router.push('/dashboard/projects');
      router.refresh();

    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save project');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle image removal
  const handleRemoveImage = useCallback(async () => {
    if (!formData.imagePublicId) return;

    try {
      setIsLoading(true);

      const response = await fetch(`/api/upload?public_id=${formData.imagePublicId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to delete image');

      setFormData(prev => ({
        ...prev,
        image: '',
        imagePublicId: '',
      }));
      setImagePreview('');
      setImageFile(null);

      toast.success('Image removed successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete image');
    } finally {
      setIsLoading(false);
    }
  }, [formData.imagePublicId]);

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title *
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          placeholder="Enter project title"
        />
      </div>

      {/* Short Description */}
      <div>
        <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700">
          Short Description *
        </label>
        <input
          type="text"
          id="shortDescription"
          value={formData.shortDescription}
          onChange={(e) => handleChange('shortDescription', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          placeholder="Brief description for project cards"
        />
      </div>

      {/* Full Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Full Description *
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={e => handleChange('description', e.target.value)}
          placeholder="Enter detailed project description"
          className="min-h-[150px] w-full border rounded-md p-2"
          required
        />
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category *
        </label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
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
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Technologies *
          </label>
          <button
            type="button"
            onClick={() => handleAddArrayItem('technologies')}
            className="text-purple-600 hover:text-purple-700"
          >
            <FiPlus className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          {formData.technologies.map((tech, index) => (
            <div key={index} className="flex gap-4 items-start">
              <div className="flex-1">
                <input
                  type="text"
                  value={tech.name}
                  onChange={(e) => handleArrayFieldChange('technologies', index, 'name', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  placeholder="Technology name"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={tech.icon || ''}
                  onChange={(e) => handleArrayFieldChange('technologies', index, 'icon', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  placeholder="Icon URL (optional)"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveArrayItem('technologies', index)}
                className="text-red-600 hover:text-red-700"
              >
                <FiMinus className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Repositories */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Repositories *
          </label>
          <button
            type="button"
            onClick={() => handleAddArrayItem('repositories')}
            className="text-purple-600 hover:text-purple-700"
          >
            <FiPlus className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          {formData.repositories.map((repo, index) => (
            <div key={index} className="flex gap-4 items-start">
              <div className="flex-1">
                <input
                  type="text"
                  value={repo.name}
                  onChange={(e) => handleArrayFieldChange('repositories', index, 'name', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  placeholder="Repository name"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={repo.url}
                  onChange={(e) => handleArrayFieldChange('repositories', index, 'url', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  placeholder="Repository URL"
                />
              </div>
              <div className="w-40">
                <select
                  value={repo.type}
                  onChange={(e) => handleArrayFieldChange('repositories', index, 'type', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                >
                  {REPOSITORY_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveArrayItem('repositories', index)}
                className="text-red-600 hover:text-red-700"
              >
                <FiMinus className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Demo URLs */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Demo URLs
          </label>
          <button
            type="button"
            onClick={() => handleAddArrayItem('demoUrls')}
            className="text-purple-600 hover:text-purple-700"
          >
            <FiPlus className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          {formData.demoUrls.map((demo, index) => (
            <div key={index} className="flex gap-4 items-start">
              <div className="flex-1">
                <input
                  type="text"
                  value={demo.name}
                  onChange={(e) => handleArrayFieldChange('demoUrls', index, 'name', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  placeholder="Demo name"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={demo.url}
                  onChange={(e) => handleArrayFieldChange('demoUrls', index, 'url', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  placeholder="Demo URL"
                />
              </div>
              <div className="w-40">
                <select
                  value={demo.type}
                  onChange={(e) => handleArrayFieldChange('demoUrls', index, 'type', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                >
                  {DEMO_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveArrayItem('demoUrls', index)}
                className="text-red-600 hover:text-red-700"
              >
                <FiMinus className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Project Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Project Image *
        </label>
        <div className="flex items-center gap-4">
          <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
            {imagePreview ? (
              <Image
                src={imagePreview}
                alt="Project preview"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <span className="text-gray-400">No image</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500">
              <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <FiUpload className="w-5 h-5 mr-2" />
                Upload Image
              </span>
              <input
                type="file"
                className="sr-only"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isLoading}
              />
            </label>
            {imagePreview && (
              <button
                type="button"
                onClick={handleRemoveImage}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-gray-50"
              >
                <FiTrash2 className="w-5 h-5 mr-2" />
                Remove Image
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Completion Date */}
      <div>
        <label htmlFor="completionDate" className="block text-sm font-medium text-gray-700">
          Completion Date *
        </label>
        <input
          type="date"
          id="completionDate"
          value={formData.completionDate}
          onChange={(e) => handleChange('completionDate', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
        />
      </div>

      {/* Featured Project */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="featured"
          checked={formData.featured}
          onChange={(e) => handleChange('featured', e.target.checked)}
          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
        />
        <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
          Featured Project
        </label>
      </div>

      {/* Project Status */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <FaTimes className="w-4 h-4 mr-2" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
        >
          <FaSave className="w-4 h-4 mr-2" />
          {isLoading ? 'Saving...' : isEdit ? 'Update Project' : 'Create Project'}
        </button>
      </div>
    </form>
  );
} 