import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { toast } from 'react-hot-toast';
import { FiUpload, FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import { uploadImage } from '@/lib/cloudinary';

// Import rich text editor dynamically
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';
import './quill.css';

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
          if (key === 'technologies') return !formData.technologies.some(tech => tech.name.trim());
          if (key === 'repositories') return !formData.repositories.some(repo => repo.url.trim() && repo.type);
          return !formData[key as keyof typeof formData];
        })
        .map(([_, label]) => label);

      if (missingFields.length > 0) {
        throw new Error(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      }

      // Filter out empty items from arrays
      const projectData = {
        ...formData,
        technologies: formData.technologies.filter(tech => tech.name.trim()),
        repositories: formData.repositories.filter(repo => repo.url.trim() && repo.type).map(repo => ({
          name: repo.name || repo.type,
          url: repo.url,
          type: repo.type
        })),
        demoUrls: formData.demoUrls.filter(demo => demo.url.trim()).map(demo => ({
          name: demo.name || 'Demo',
          url: demo.url
        }))
      };

      // Send request
      const response = await fetch(`/api/projects${isEdit && initialData?._id ? `/${initialData._id}` : ''}`, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error || data.details?.join(', ') || 'Failed to save project');

      toast.success(isEdit ? 'Project updated successfully' : 'Project created successfully');
      router.push('/dashboard/projects');
      router.refresh();
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Basic Information</h3>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => handleChange('title', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Category</label>
            <select
              value={formData.category}
              onChange={e => handleChange('category', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            >
              {CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Completion Date</label>
            <input
              type="date"
              value={formData.completionDate}
              onChange={e => handleChange('completionDate', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Status</label>
            <select
              value={formData.status}
              onChange={e => handleChange('status', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <ReactQuill
            value={formData.description}
            onChange={value => handleChange('description', value)}
            className="mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Short Description</label>
          <textarea
            value={formData.shortDescription}
            onChange={e => handleChange('shortDescription', e.target.value)}
            rows={2}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            required
          />
        </div>
      </div>

      {/* Project Image */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Project Image</h3>
        
        <div className="flex items-center gap-4">
          <div className="relative h-32 w-32 overflow-hidden rounded-lg bg-gray-100">
            {imagePreview && (
              <Image
                src={imagePreview}
                alt="Project preview"
                fill
                className="object-cover"
              />
            )}
          </div>
          
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            <p className="mt-2 text-sm text-gray-500">
              {isLoading ? 'Uploading...' : 'Upload a project image (required)'}
            </p>
          </div>
        </div>
      </div>

      {/* Technologies */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Technologies</h3>
        
        {formData.technologies.map((tech, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={tech.name}
                onChange={e => handleArrayFieldChange('technologies', index, 'name', e.target.value)}
                placeholder="Technology name"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={tech.icon || ''}
                onChange={e => handleArrayFieldChange('technologies', index, 'icon', e.target.value)}
                placeholder="Icon URL (optional)"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <button
              type="button"
              onClick={() => handleRemoveArrayItem('technologies', index)}
              className="text-red-600 hover:text-red-800"
            >
              <FiTrash2 className="h-5 w-5" />
            </button>
          </div>
        ))}
        
        <button
          type="button"
          onClick={() => handleAddArrayItem('technologies')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <FiPlus className="h-4 w-4" />
          Add Technology
        </button>
      </div>

      {/* Repositories */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Repositories</h3>
        
        {formData.repositories.map((repo, index) => (
          <div key={index} className="flex gap-4">
            <div className="w-32">
              <select
                value={repo.type}
                onChange={e => handleArrayFieldChange('repositories', index, 'type', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                {REPOSITORY_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <input
                type="url"
                value={repo.url}
                onChange={e => handleArrayFieldChange('repositories', index, 'url', e.target.value)}
                placeholder="Repository URL"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={repo.name}
                onChange={e => handleArrayFieldChange('repositories', index, 'name', e.target.value)}
                placeholder="Repository name (optional)"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <button
              type="button"
              onClick={() => handleRemoveArrayItem('repositories', index)}
              className="text-red-600 hover:text-red-800"
            >
              <FiTrash2 className="h-5 w-5" />
            </button>
          </div>
        ))}
        
        <button
          type="button"
          onClick={() => handleAddArrayItem('repositories')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <FiPlus className="h-4 w-4" />
          Add Repository
        </button>
      </div>

      {/* Demo URLs */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Demo URLs</h3>
        
        {formData.demoUrls.map((demo, index) => (
          <div key={index} className="flex gap-4">
            <div className="w-32">
              <select
                value={demo.type}
                onChange={e => handleArrayFieldChange('demoUrls', index, 'type', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                {DEMO_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <input
                type="url"
                value={demo.url}
                onChange={e => handleArrayFieldChange('demoUrls', index, 'url', e.target.value)}
                placeholder="Demo URL"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={demo.name}
                onChange={e => handleArrayFieldChange('demoUrls', index, 'name', e.target.value)}
                placeholder="Demo name (optional)"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <button
              type="button"
              onClick={() => handleRemoveArrayItem('demoUrls', index)}
              className="text-red-600 hover:text-red-800"
            >
              <FiTrash2 className="h-5 w-5" />
            </button>
          </div>
        ))}
        
        <button
          type="button"
          onClick={() => handleAddArrayItem('demoUrls')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <FiPlus className="h-4 w-4" />
          Add Demo URL
        </button>
      </div>

      {/* Featured and Status Toggle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Featured Toggle */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="featured"
            checked={formData.featured}
            onChange={(e) => handleChange('featured', e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor="featured" className="text-sm font-medium text-gray-700">
            Feature this project
          </label>
        </div>

        {/* Status Toggle */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="status"
            checked={formData.status === 'published'}
            onChange={(e) => handleChange('status', e.target.checked ? 'published' : 'draft')}
            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor="status" className="text-sm font-medium text-gray-700">
            Publish this project
          </label>
          <span className="ml-2 text-sm text-gray-500">
            ({formData.status === 'published' ? 'Published' : 'Draft'})
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Project' : 'Create Project')}
        </button>
      </div>
    </form>
  );
} 