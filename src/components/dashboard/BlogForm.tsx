"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { FaSave, FaImage, FaTimes, FaEye, FaCode, FaPalette, FaPlus, FaUser } from 'react-icons/fa';
import Image from 'next/image';

// Dynamic import of the rich text editor to avoid SSR issues
const ReactQuill = dynamic(
  () => import('react-quill'),
  { 
    ssr: false,
    loading: () => <div className="h-64 w-full bg-gray-100 animate-pulse rounded-md" />
  }
);

// Import Quill CSS
import './quill.css';

interface BlogFormProps {
  initialData?: {
    id?: string;
    _id?: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage?: string;
    category: string;
    tags: string[];
    author: {
      name: string;
      email?: string;
      bio?: string;
      avatar?: string;
      social?: {
        twitter?: string;
        linkedin?: string;
        github?: string;
        website?: string;
      };
    };
    status: 'draft' | 'published';
    featured: boolean;
    readTime?: number;
  };
  mode: 'create' | 'edit';
}

export default function BlogForm({ initialData, mode }: BlogFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.coverImage || null);
  const [previewMode, setPreviewMode] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    coverImage: initialData?.coverImage || '',
    category: initialData?.category || 'General',
    tags: initialData?.tags || [],
    author: {
      name: initialData?.author?.name || 'Admin',
      email: initialData?.author?.email || '',
      bio: initialData?.author?.bio || '',
      avatar: initialData?.author?.avatar || '',
      social: {
        twitter: initialData?.author?.social?.twitter || '',
        linkedin: initialData?.author?.social?.linkedin || '',
        github: initialData?.author?.social?.github || '',
        website: initialData?.author?.social?.website || '',
      }
    },
    status: initialData?.status || 'draft',
    featured: initialData?.featured || false,
  });

  // Rich text editor configuration
  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean']
      ],
      handlers: {
        image: function() {
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          input.click();
          
          input.onchange = async () => {
            const file = input.files?.[0];
            if (file) {
              await handleImageUpload.call(this, file);
            }
          };
        }
      }
    },
    clipboard: {
      matchVisual: false,
    }
  }), []);

  // Image upload handler
  const handleImageUpload = async function(file: File) {
    try {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }

      // Create form data for upload
      const uploadData = new FormData();
      uploadData.append('image', file);

      // Show loading indicator
      const quill = this.quill;
      const range = quill.getSelection(true);
      const loadingText = `📷 Uploading ${file.name}...`;
      quill.insertText(range.index, loadingText, 'italic', true);
      quill.setSelection(range.index + loadingText.length);

      // Upload image
      const response = await fetch('/api/blogs/upload-image', {
        method: 'POST',
        body: uploadData
      });

      const data = await response.json();
      
      // Remove loading text
      quill.deleteText(range.index, loadingText.length);
      
      if (data.success) {
        // Insert image at cursor position
        quill.insertEmbed(range.index, 'image', data.url);
        quill.setSelection(range.index + 1);
        
        // Add a line break after image for better spacing
        quill.insertText(range.index + 1, '\n');
      } else {
        throw new Error(data.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to upload image: ${errorMessage}`);
    }
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'indent',
    'align', 'blockquote', 'code-block', 'link', 'image', 'video', 'clean'
  ];

  // Auto-generate slug from title
  useEffect(() => {
    if (mode === 'create' && formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, mode]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Create form data for upload
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('folder', 'portfolio/blogs');

      // Upload image
      setLoading(true);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error);
      }

      // Update form data with new image
      setFormData(prev => ({
        ...prev,
        coverImage: data.data.url
      }));

      setSuccess('Cover image uploaded successfully');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === ',' || e.key === 'Tab') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const trimmedTag = currentTag.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
    }
    setCurrentTag('');
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Generate slug if empty
      if (!formData.slug) {
        formData.slug = formData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }

      // Debug logging
      console.log('=== BLOG FORM DEBUG ===');
      console.log('Mode:', mode);
      console.log('Form Data:', JSON.stringify(formData, null, 2));

      let url: string;
      if (mode === 'create') {
        url = '/api/blogs';
      } else {
        // For edit mode, we need a valid identifier
        const identifier = initialData?.id || initialData?._id || initialData?.slug;
        if (!identifier) {
          throw new Error('Blog post ID is required for editing');
        }
        url = `/api/blogs/${identifier}`;
      }

      console.log('Request URL:', url);
      console.log('Request Method:', mode === 'create' ? 'POST' : 'PUT');

      const response = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Response Status:', response.status);
      console.log('Response OK:', response.ok);

      const data = await response.json();
      console.log('Response Data:', JSON.stringify(data, null, 2));

      if (!data.success) {
        throw new Error(data.error || data.message || 'Failed to save blog post');
      }

      setSuccess(`Blog post ${mode === 'create' ? 'created' : 'updated'} successfully!`);
      
      // Redirect after successful save
      setTimeout(() => {
        router.push('/dashboard/posts');
      }, 1500);

    } catch (error) {
      console.error('=== ERROR DETAILS ===');
      console.error('Error saving blog post:', error);
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error?.constructor?.name);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      setError(error instanceof Error ? error.message : 'Failed to save blog post');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'General',
    'Web Development',
    'Mobile Development',
    'AI/ML',
    'DevOps',
    'UI/UX',
    'Tutorial',
    'Technology',
    'Career',
    'Opinion'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {mode === 'create' ? 'Create New Blog Post' : 'Edit Blog Post'}
              </h1>
              <p className="text-gray-600">
                {mode === 'create' 
                  ? 'Write and format your blog post with rich text capabilities'
                  : 'Update your blog post content and settings'
                }
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                  previewMode 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <FaEye className="w-4 h-4" />
                <span>{previewMode ? 'Edit' : 'Preview'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg">
            {success}
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Slug */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter blog title..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="url-friendly-slug"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Excerpt */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Excerpt *
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Brief description of your blog post..."
                required
              />
            </div>

            {/* Content Editor */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Content *
              </label>
              {!previewMode ? (
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <ReactQuill
                    value={formData.content}
                    onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Start writing your blog post..."
                    className="min-h-96"
                  />
                </div>
              ) : (
                <div className="min-h-96 p-6 border border-gray-300 rounded-lg bg-gray-50">
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: formData.content }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publishing Options */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaSave className="w-5 h-5 mr-2 text-blue-600" />
                Publishing
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                    Featured Post
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <FaSave className="w-4 h-4" />
                      <span>{mode === 'create' ? 'Create Post' : 'Update Post'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Cover Image */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaImage className="w-5 h-5 mr-2 text-green-600" />
                Cover Image
              </h3>
              
              {imagePreview && (
                <div className="mb-4 relative">
                  <Image
                    src={imagePreview}
                    alt="Cover preview"
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData(prev => ({ ...prev, coverImage: '' }));
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </div>
              )}
              
              <input
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">
                Recommended: 1200x630px, Max: 5MB
              </p>
            </div>

            {/* Category */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaPalette className="w-5 h-5 mr-2 text-purple-600" />
                Category
              </h3>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaCode className="w-5 h-5 mr-2 text-orange-600" />
                Tags
              </h3>
              
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Add a tag..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FaPlus className="w-3 h-3" />
                  </button>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 hover:text-red-600 transition-colors"
                        >
                          <FaTimes className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Author Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaUser className="w-5 h-5 mr-2 text-indigo-600" />
                Author Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.author.name}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      author: { ...prev.author, name: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.author.email}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      author: { ...prev.author, email: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 