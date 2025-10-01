"use client";

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { FiUpload, FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import { uploadImage } from '@/lib/cloudinary';
import { FaSave, FaTimes } from 'react-icons/fa';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/components/shared/RichTextEditor'), { ssr: false });

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

interface ProjectImage {
  url: string;
  publicId: string;
  caption?: string;
  altText?: string;
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
    additionalImages?: ProjectImage[];
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
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([]);

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
    additionalImages: initialData?.additionalImages || [],
    completionDate: initialData?.completionDate ? new Date(initialData.completionDate).toISOString().split('T')[0] : '',
    featured: initialData?.featured || false,
    status: initialData?.status || 'draft',
    lineSpacing: '10'
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

  // Handle additional image upload
  const handleAdditionalImageChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check if adding these files would exceed the limit
    if (formData.additionalImages.length + files.length > 10) {
      toast.error('Cannot add more than 10 additional images');
      return;
    }

    try {
      setIsLoading(true);
      
      for (const file of files) {
        // Upload to Cloudinary
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (!data.success) throw new Error(data.error || 'Failed to upload image');

        // Add to additional images
        const newImage: ProjectImage = {
          url: data.data.url,
          publicId: data.data.public_id,
          caption: '',
          altText: file.name
        };

        setFormData(prev => ({
          ...prev,
          additionalImages: [...prev.additionalImages, newImage]
        }));
      }

      toast.success(`${files.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload images');
    } finally {
      setIsLoading(false);
    }
  }, [formData.additionalImages]);

  // Remove additional image
  const handleRemoveAdditionalImage = useCallback((index: number) => {
    setFormData(prev => {
      const newAdditionalImages = [...prev.additionalImages];
      newAdditionalImages.splice(index, 1);
      return { ...prev, additionalImages: newAdditionalImages };
    });
  }, []);

  // Update additional image caption or alt text
  const handleAdditionalImageUpdate = useCallback((index: number, field: 'caption' | 'altText', value: string) => {
    setFormData(prev => {
      const newAdditionalImages = [...prev.additionalImages];
      newAdditionalImages[index] = { ...newAdditionalImages[index], [field]: value };
      return { ...prev, additionalImages: newAdditionalImages };
    });
  }, []);

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
      // Helper to validate rich text HTML content
      const isHtmlEmpty = (html: string) => !html || html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length === 0;

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
          if (key === 'description') return isHtmlEmpty(formData.description);
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
        demoUrls: formData.demoUrls.filter(demo => demo.name.trim() !== '' && demo.url.trim() !== ''),
        completionDate: formData.completionDate ? formData.completionDate : undefined
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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-body-sm weight-medium text-gray-700 mb-2">
          Project Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className="block w-full px-4 py-2.5 text-body-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="e.g., E-commerce Platform, AI Chatbot, Portfolio Website"
          required
        />
      </div>

      {/* Short Description */}
      <div>
        <label htmlFor="shortDescription" className="block text-body-sm weight-medium text-gray-700 mb-2">
          Short Description <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="shortDescription"
          value={formData.shortDescription}
          onChange={(e) => handleChange('shortDescription', e.target.value)}
          className="block w-full px-4 py-2.5 text-body-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="A brief one-liner description for project cards (max 150 characters)"
          required
          maxLength={150}
        />
        <p className="mt-1.5 text-caption text-gray-500">
          {formData.shortDescription.length}/150 characters
        </p>
      </div>

      {/* Full Description */}
      <div>
        <label htmlFor="description" className="block text-body-sm weight-medium text-gray-700 mb-2">
          Full Description <span className="text-red-500">*</span>
        </label>
        <p className="text-caption text-gray-600 mb-3">
          Provide a detailed description of your project, including features, technologies, and your role.
        </p>
        <RichTextEditor
          value={formData.description}
          onChange={(html: string) => handleChange('description', html)}
          lineSpacing={formData.lineSpacing}
          onLineSpacingChange={(lineSpacing: string) => handleChange('lineSpacing', lineSpacing)}
          minHeight="300px"
          placeholder="Enter detailed project description..."
          className="border border-gray-300 rounded-lg shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500"
        />
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-body-sm weight-medium text-gray-700 mb-2">
          Project Category <span className="text-red-500">*</span>
        </label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value)}
          className="block w-full px-4 py-2.5 text-body-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
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
      <div className="border-t border-gray-200 pt-6">
        <div className="flex justify-between items-center mb-3">
          <label className="block text-body-sm weight-medium text-gray-700">
            Technologies & Packages <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={() => handleAddArrayItem('technologies')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-body-sm weight-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <FiPlus className="icon-sm" />
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
                  onChange={(e) => handleArrayFieldChange('technologies', index, 'name', e.target.value)}
                  className="block w-full px-3 py-2 text-body-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  placeholder="e.g., React, pandas, Docker"
                  required
                />
              </div>
              <div className="w-full sm:flex-1">
                <input
                  type="text"
                  value={tech.icon || ''}
                  onChange={(e) => handleArrayFieldChange('technologies', index, 'icon', e.target.value)}
                  className="block w-full px-3 py-2 text-body-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  placeholder="Icon URL (optional)"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveArrayItem('technologies', index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove technology"
              >
                <FiMinus className="icon-sm" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Repositories */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <label className="block text-body-sm weight-medium text-gray-700">
              Repositories <span className="text-red-500">*</span>
            </label>
            <p className="text-caption text-gray-600 mt-1">
              Link to your source code repositories
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleAddArrayItem('repositories')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-body-sm weight-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <FiPlus className="icon-sm" />
            Add
          </button>
        </div>
        <div className="space-y-3">
          {formData.repositories.map((repo, index) => (
            <div key={index} className="flex flex-col sm:flex-row gap-3 items-start p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-full sm:flex-1">
                <input
                  type="text"
                  value={repo.name}
                  onChange={(e) => handleArrayFieldChange('repositories', index, 'name', e.target.value)}
                  className="block w-full px-3 py-2 text-body-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  placeholder="e.g., Frontend, Backend, Main"
                  required
                />
              </div>
              <div className="w-full sm:flex-1">
                <input
                  type="url"
                  value={repo.url}
                  onChange={(e) => handleArrayFieldChange('repositories', index, 'url', e.target.value)}
                  className="block w-full px-3 py-2 text-body-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  placeholder="https://github.com/username/repo"
                  required
                />
              </div>
              <div className="w-full sm:w-40">
                <select
                  value={repo.type}
                  onChange={(e) => handleArrayFieldChange('repositories', index, 'type', e.target.value)}
                  className="block w-full px-3 py-2 text-body-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
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
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove repository"
              >
                <FiMinus className="icon-sm" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Demo URLs */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <label className="block text-body-sm weight-medium text-gray-700">
              Demo URLs <span className="text-caption text-gray-500">(Optional)</span>
            </label>
            <p className="text-caption text-gray-600 mt-1">
              Add live demo, staging, or documentation links
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleAddArrayItem('demoUrls')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-body-sm weight-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <FiPlus className="icon-sm" />
            Add
          </button>
        </div>
        <div className="space-y-3">
          {formData.demoUrls.map((demo, index) => (
            <div key={index} className="flex flex-col sm:flex-row gap-3 items-start p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-full sm:flex-1">
                <input
                  type="text"
                  value={demo.name}
                  onChange={(e) => handleArrayFieldChange('demoUrls', index, 'name', e.target.value)}
                  className="block w-full px-3 py-2 text-body-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  placeholder="e.g., Live Site, API Docs"
                />
              </div>
              <div className="w-full sm:flex-1">
                <input
                  type="url"
                  value={demo.url}
                  onChange={(e) => handleArrayFieldChange('demoUrls', index, 'url', e.target.value)}
                  className="block w-full px-3 py-2 text-body-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  placeholder="https://example.com"
                />
              </div>
              <div className="w-full sm:w-40">
                <select
                  value={demo.type}
                  onChange={(e) => handleArrayFieldChange('demoUrls', index, 'type', e.target.value)}
                  className="block w-full px-3 py-2 text-body-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
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
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove demo URL"
              >
                <FiMinus className="icon-sm" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Project Image */}
      <div className="border-t border-gray-200 pt-6">
        <label className="block text-body-sm weight-medium text-gray-700 mb-2">
          Project Image <span className="text-red-500">*</span>
        </label>
        <p className="text-caption text-gray-600 mb-4">
          Upload a featured image for your project (recommended: 16:10 aspect ratio, max 5MB)
        </p>
        <div className="flex items-start gap-6 flex-col sm:flex-row">
          <div className="relative w-full sm:w-64 h-40 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50">
            {imagePreview ? (
              <Image
                src={imagePreview}
                alt="Project preview"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-caption text-gray-500">No image uploaded</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <label className="relative cursor-pointer">
              <span className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-body-sm weight-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                <FiUpload className="icon-sm" />
                {imagePreview ? 'Change Image' : 'Upload Image'}
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
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-red-300 rounded-lg shadow-sm text-body-sm weight-medium text-red-700 bg-white hover:bg-red-50 transition-colors"
              >
                <FiTrash2 className="icon-sm" />
                Remove Image
              </button>
            )}
            {isLoading && (
              <p className="text-caption text-gray-600">Uploading...</p>
            )}
          </div>
        </div>
      </div>

      {/* Additional Images */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Additional Images (Optional)
          </label>
          <span className="text-xs text-gray-500">
            {formData.additionalImages.length}/10 images
          </span>
        </div>
        
        {formData.additionalImages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {formData.additionalImages.map((image, index) => (
              <div key={index} className="relative border border-gray-200 rounded-lg overflow-hidden">
                <div className="relative w-full h-32">
                  <Image
                    src={image.url}
                    alt={image.altText || 'Additional project image'}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveAdditionalImage(index)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                    title="Remove image"
                  >
                    <FiMinus className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-3 bg-gray-50">
                  <input
                    type="text"
                    value={image.caption || ''}
                    onChange={(e) => handleAdditionalImageUpdate(index, 'caption', e.target.value)}
                    placeholder="Caption (optional)"
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1 mb-2 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                  <input
                    type="text"
                    value={image.altText || ''}
                    onChange={(e) => handleAdditionalImageUpdate(index, 'altText', e.target.value)}
                    placeholder="Alt text for accessibility"
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        
        {formData.additionalImages.length < 10 && (
          <label className="relative cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500">
            <FiUpload className="w-5 h-5 mr-2" />
            Add Additional Images
            <input
              type="file"
              className="sr-only"
              accept="image/*"
              onChange={handleAdditionalImageChange}
              multiple
              disabled={isLoading}
            />
          </label>
        )}
        
        <p className="mt-2 text-xs text-gray-500">
          Upload additional images to showcase different aspects of your project. Maximum 10 images allowed.
        </p>
      </div>

      {/* Completion Date */}
      <div className="border-t border-gray-200 pt-6">
        <label htmlFor="completionDate" className="block text-body-sm weight-medium text-gray-700 mb-2">
          Completion Date <span className="text-caption text-gray-500">(Optional)</span>
        </label>
        <p className="text-caption text-gray-600 mb-3">
          When was this project completed?
        </p>
        <input
          type="date"
          id="completionDate"
          value={formData.completionDate}
          onChange={(e) => handleChange('completionDate', e.target.value)}
          className="block w-full sm:w-64 px-4 py-2.5 text-body-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Featured Project & Status */}
      <div className="border-t border-gray-200 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Featured Project */}
        <div>
          <label className="block text-body-sm weight-medium text-gray-700 mb-3">
            Project Visibility
          </label>
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => handleChange('featured', e.target.checked)}
              className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div>
              <label htmlFor="featured" className="block text-body-sm weight-medium text-gray-900 cursor-pointer">
                Mark as Featured
              </label>
              <p className="text-caption text-gray-600 mt-1">
                Featured projects appear prominently on your portfolio
              </p>
            </div>
          </div>
        </div>

        {/* Project Status */}
        <div>
          <label htmlFor="status" className="block text-body-sm weight-medium text-gray-700 mb-3">
            Publication Status <span className="text-red-500">*</span>
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="block w-full px-4 py-2.5 text-body-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
            required
          >
            <option value="draft">Draft (Not visible)</option>
            <option value="published">Published (Visible)</option>
          </select>
          <p className="text-caption text-gray-600 mt-2">
            Draft projects are only visible in your dashboard
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-between sm:justify-end gap-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-6 py-2.5 border border-gray-300 rounded-lg shadow-sm text-body-sm weight-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
        >
          <FaTimes className="icon-sm" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-body-sm weight-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin icon-sm" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              <FaSave className="icon-sm" />
              {isEdit ? 'Update Project' : 'Create Project'}
            </>
          )}
        </button>
      </div>
    </form>
  );
} 